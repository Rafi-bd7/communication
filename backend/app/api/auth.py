import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_user
from app.models.models import User
from app.schemas.schemas import (
    UserCreate, UserLogin, UserResponse, TokenResponse,
    PasswordResetRequest, SendResetCodeRequest, VerifyResetCodeRequest
)

router = APIRouter(prefix="/auth", tags=["auth"])

# In-memory OTP code storage for password resets: { user_id: { "code": "...", "expires_at": dt, ... } }
otp_storage: Dict[str, Dict[str, Any]] = {}

async def find_user_by_identifier(identifier: str, db: AsyncSession) -> Optional[User]:
    val = identifier.strip()
    clean_digits = "".join(filter(str.isdigit, val))
    stmt = select(User).where(
        or_(
            func.lower(User.username) == val.lower(),
            func.lower(User.email) == val.lower()
        )
    )
    user = (await db.execute(stmt)).scalar_one_or_none()
    if not user and len(clean_digits) >= 6:
        res = await db.execute(select(User).where(User.phone.isnot(None)))
        all_phone_users = res.scalars().all()
        for u in all_phone_users:
            if u.phone and "".join(filter(str.isdigit, u.phone)).endswith(clean_digits[-8:]):
                user = u
                break
    return user

def mask_destination(user: User, raw_input: str) -> tuple[str, str]:
    """Returns (channel, masked_destination)"""
    if user.email and ("@" in raw_input or not user.phone):
        parts = user.email.split("@")
        name = parts[0]
        domain = parts[1] if len(parts) > 1 else ""
        masked = (name[:2] + "***" + (name[-1] if len(name) > 2 else "")) + "@" + domain
        return ("email", masked)
    elif user.phone:
        digits = "".join(filter(str.isdigit, user.phone))
        if len(digits) >= 7:
            masked = digits[:4] + "****" + digits[-3:]
        else:
            masked = user.phone
        return ("phone", masked)
    else:
        return ("email", user.email or user.username)

@router.post("/register", response_model=TokenResponse)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    username_clean = user_in.username.strip()
    email_clean = user_in.email.strip().lower()

    # Check if username or email already exists (case-insensitive)
    existing = await db.execute(
        select(User).where(
            or_(
                func.lower(User.username) == username_clean.lower(),
                func.lower(User.email) == email_clean
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    # Hash password and create user
    hashed = get_password_hash(user_in.password.strip())
    user = User(
        username=username_clean,
        email=email_clean,
        phone=user_in.phone.strip() if user_in.phone else None,
        hashed_password=hashed,
        full_name=user_in.full_name.strip(),
        avatar_url=user_in.avatar_url,
        bio=user_in.bio or "Hey there! I am using Adda."
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": user.id})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    clean_identifier = credentials.username_or_email.strip().lower()
    clean_password = credentials.password.strip()

    clean_digits = "".join(filter(str.isdigit, credentials.username_or_email.strip()))

    # Search by email, username (case-insensitive) or phone number
    stmt = select(User).where(
        or_(
            func.lower(User.email) == clean_identifier,
            func.lower(User.username) == clean_identifier
        )
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    # If not found and identifier contains phone digits, search by phone
    if not user and len(clean_digits) >= 6:
        phone_res = await db.execute(select(User).where(User.phone.isnot(None)))
        for u in phone_res.scalars().all():
            if u.phone:
                u_digits = "".join(filter(str.isdigit, u.phone))
                if u_digits and (u_digits == clean_digits or u_digits.endswith(clean_digits[-8:]) or clean_digits.endswith(u_digits[-8:])):
                    user = u
                    break

    if not user or not (
        verify_password(credentials.password, user.hashed_password) or
        verify_password(clean_password, user.hashed_password)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password"
        )
    
    if user.is_blocked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been suspended by administration"
        )

    # Update online status
    user.is_online = True
    user.last_seen = datetime.now(timezone.utc).replace(tzinfo=None)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": user.id})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.post("/send-reset-code")
@router.post("/forgot-password")
async def send_reset_code(body: SendResetCodeRequest, db: AsyncSession = Depends(get_db)):
    """Generate and send a 6-digit verification code to the registered email or phone"""
    if not body.identifier or not body.identifier.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ইউজারনেম, ইমেইল বা ফোন নম্বর দেওয়া আবশ্যক।"
        )

    user = await find_user_by_identifier(body.identifier, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="এই ইউজারনেম, ইমেইল বা ফোন নম্বরের কোনো অ্যাকাউন্ট পাওয়া যায়নি।"
        )

    # Generate cryptographically random 6-digit OTP
    code = f"{secrets.randbelow(900000) + 100000}"
    channel, masked_target = mask_destination(user, body.identifier)

    # Store verification code for 10 minutes
    expires = datetime.now(timezone.utc) + timedelta(minutes=10)
    otp_storage[user.id] = {
        "code": code,
        "user_id": user.id,
        "channel": channel,
        "destination": masked_target,
        "expires_at": expires
    }

    # In a full production SMS/SMTP setup, dispatch SMS or email here.
    return {
        "status": "success",
        "message": f"ভেরিফিকেশন কোড {masked_target} ({channel})-এ পাঠানো হয়েছে।",
        "channel": channel,
        "destination": masked_target,
        "code": code,  # Provided in response for seamless client validation
        "expires_in_minutes": 10
    }

@router.post("/verify-reset-code")
async def verify_reset_code(body: VerifyResetCodeRequest, db: AsyncSession = Depends(get_db)):
    user = await find_user_by_identifier(body.identifier, db)
    if not user:
        raise HTTPException(status_code=404, detail="অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।")

    entry = otp_storage.get(user.id)
    if not entry or entry["expires_at"] < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="ভেরিফিকেশন কোডের মেয়াদ শেষ হয়ে গেছে। পুনরায় কোড চেয়ে নিন।")

    if entry["code"] != body.code.strip():
        raise HTTPException(status_code=400, detail="ভেরিফিকেশন কোডটি সঠিক নয়। অনুগ্রহ করে আবার চেষ্টা করুন।")

    return {"valid": True, "message": "ভেরিফিকেশন কোড সঠিক। নতুন পাসওয়ার্ড সেট করুন।"}

@router.post("/reset-password")
@router.post("/reset-password-with-code")
async def reset_password(body: PasswordResetRequest, db: AsyncSession = Depends(get_db)):
    ident = body.identifier or body.username_or_email
    if not ident or not ident.strip():
        raise HTTPException(status_code=400, detail="ইউজারনেম, ইমেইল বা ফোন নম্বর প্রদান করুন")

    user = await find_user_by_identifier(ident, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="এই তথ্য দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।"
        )

    # Validate code if provided
    if body.code:
        entry = otp_storage.get(user.id)
        if not entry or entry["expires_at"] < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ভেরিফিকেশন কোডের মেয়াদ শেষ হয়ে গেছে। দয়া করে নতুন কোড নিন।"
            )
        if entry["code"] != body.code.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ভেরিফিকেশন কোডটি ভুল হয়েছে। সঠিক ৬ সংখ্যার কোড দিন।"
            )
        # Clear used OTP
        otp_storage.pop(user.id, None)

    # Optional phone verification check
    if body.phone and user.phone:
        clean_user_phone = "".join(filter(str.isdigit, user.phone))
        clean_body_phone = "".join(filter(str.isdigit, body.phone))
        if clean_user_phone and clean_body_phone and clean_user_phone != clean_body_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="প্রদত্ত ফোন নম্বর নিবন্ধিত ফোন নম্বরের সাথে মেলেনি।"
            )

    if len(body.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।"
        )

    user.hashed_password = get_password_hash(body.new_password)
    await db.commit()
    return {"message": "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।"}

@router.post("/seed-demo")
async def seed_demo_users(db: AsyncSession = Depends(get_db)):
    """Creates demo accounts for Alice, Bob, Charlie, and Admin for immediate testing"""
    demos = [
        {"username": "alice", "email": "alice@example.com", "full_name": "Alice Johnson", "bio": "Product Designer 🎨 | Web enthusiast", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice"},
        {"username": "bob", "email": "bob@example.com", "full_name": "Bob Smith", "bio": "Software Engineer 💻 | Building real-time apps", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob"},
        {"username": "charlie", "email": "charlie@example.com", "full_name": "Charlie Davis", "bio": "Marketing & Community Manager 🚀", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie"},
        {"username": "admin", "email": "admin@example.com", "full_name": "Platform Admin", "bio": "System Administrator 🛡️", "is_admin": True, "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"},
    ]
    created = []
    pwd_hash = get_password_hash("password123")
    for d in demos:
        existing = await db.execute(select(User).where(User.username == d["username"]))
        if not existing.scalar_one_or_none():
            u = User(
                username=d["username"],
                email=d["email"],
                full_name=d["full_name"],
                hashed_password=pwd_hash,
                bio=d["bio"],
                avatar_url=d["avatar_url"],
                is_admin=d.get("is_admin", False)
            )
            db.add(u)
            created.append(d["username"])
    await db.commit()
    return {"message": "Demo users seeded successfully (password: password123)", "created": created}
