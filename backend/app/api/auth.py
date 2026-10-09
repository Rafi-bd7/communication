from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_user
from app.models.models import User
from app.schemas.schemas import UserCreate, UserLogin, UserResponse, TokenResponse, PasswordResetRequest

router = APIRouter(prefix="/auth", tags=["auth"])

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

    # Search by email or username (case-insensitive)
    stmt = select(User).where(
        or_(
            func.lower(User.email) == clean_identifier,
            func.lower(User.username) == clean_identifier
        )
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

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
    user.last_seen = datetime.now(timezone.utc)
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

@router.post("/reset-password")
async def reset_password(body: PasswordResetRequest, db: AsyncSession = Depends(get_db)):
    # Search by email or username
    stmt = select(User).where(
        or_(
            User.email == body.username_or_email,
            User.username == body.username_or_email
        )
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this username or email"
        )

    # Optional phone verification if phone was entered and user has phone saved
    if body.phone and user.phone:
        clean_user_phone = "".join(filter(str.isdigit, user.phone))
        clean_body_phone = "".join(filter(str.isdigit, body.phone))
        if clean_user_phone and clean_body_phone and clean_user_phone != clean_body_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Provided phone number does not match registered phone"
            )

    if len(body.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long"
        )

    user.hashed_password = get_password_hash(body.new_password)
    await db.commit()
    return {"message": "Password reset successfully. You can now login with your new password."}

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
