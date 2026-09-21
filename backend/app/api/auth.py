from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_user
from app.models.models import User
from app.schemas.schemas import UserCreate, UserLogin, UserResponse, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if username or email already exists
    existing = await db.execute(
        select(User).where(or_(User.username == user_in.username, User.email == user_in.email))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    # Hash password and create user
    hashed = get_password_hash(user_in.password)
    user = User(
        username=user_in.username,
        email=user_in.email,
        phone=user_in.phone,
        hashed_password=hashed,
        full_name=user_in.full_name,
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
    # Search by email or username
    stmt = select(User).where(
        or_(
            User.email == credentials.username_or_email,
            User.username == credentials.username_or_email
        )
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.hashed_password):
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
