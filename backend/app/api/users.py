from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Friendship
from app.schemas.schemas import UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])

@router.get("", response_model=List[UserResponse])
@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(User).where(User.id != current_user.id).offset(skip).limit(limit)
    result = await db.execute(stmt)
    users = result.scalars().all()
    return [UserResponse.model_validate(u) for u in users]

@router.get("/search", response_model=List[UserResponse])
async def search_users(
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    term = f"%{q.lower()}%"
    stmt = select(User).where(
        User.id != current_user.id,
        or_(
            User.username.ilike(term),
            User.full_name.ilike(term),
            User.email.ilike(term)
        )
    ).limit(20)
    result = await db.execute(stmt)
    users = result.scalars().all()
    return [UserResponse.model_validate(u) for u in users]

@router.get("/{user_id}", response_model=UserResponse)
async def get_user_profile(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # If not self, verify friendship before revealing private contact details
    if user.id != current_user.id:
        f_stmt = select(Friendship).where(
            and_(
                Friendship.status == "accepted",
                or_(
                    and_(Friendship.requester_id == current_user.id, Friendship.receiver_id == user.id),
                    and_(Friendship.requester_id == user.id, Friendship.receiver_id == current_user.id)
                )
            )
        )
        f_res = await db.execute(f_stmt)
        is_friend = f_res.scalar_one_or_none() is not None
        if not is_friend:
            resp = UserResponse.model_validate(user)
            resp.email = ""
            resp.phone = None
            return resp

    return UserResponse.model_validate(user)

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if update_data.full_name is not None:
        current_user.full_name = update_data.full_name
    if update_data.bio is not None:
        current_user.bio = update_data.bio
    if update_data.avatar_url is not None:
        current_user.avatar_url = update_data.avatar_url
    if update_data.phone is not None:
        current_user.phone = update_data.phone
        
    await db.commit()
    await db.refresh(current_user)
    return UserResponse.model_validate(current_user)
