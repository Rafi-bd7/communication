from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Friendship, Conversation, ConversationMember
from app.schemas.schemas import UserResponse
from app.services.chat_service import get_or_create_direct_conversation

router = APIRouter(prefix="/friends", tags=["friends"])

class FriendSuggestionResponse(BaseModel):
    user: UserResponse
    friendship_status: str  # 'none', 'pending_sent', 'pending_received', 'friends'
    friendship_id: Optional[str] = None

class FriendshipResponse(BaseModel):
    id: str
    requester: UserResponse
    receiver: UserResponse
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/suggestions", response_model=List[FriendSuggestionResponse])
async def get_friend_suggestions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns users to discover and connect with, along with friendship status"""
    # Get all users except current user
    users_stmt = select(User).where(User.id != current_user.id).order_by(User.created_at.desc()).limit(30)
    users_res = await db.execute(users_stmt)
    all_users = users_res.scalars().all()

    # Get all friendships involving current_user
    f_stmt = select(Friendship).where(
        or_(Friendship.requester_id == current_user.id, Friendship.receiver_id == current_user.id)
    )
    f_res = await db.execute(f_stmt)
    friendships = f_res.scalars().all()

    # Map target user -> friendship
    f_map = {}
    for f in friendships:
        other_id = f.receiver_id if f.requester_id == current_user.id else f.requester_id
        f_map[other_id] = f

    results = []
    for u in all_users:
        status_label = "none"
        f_id = None
        if u.id in f_map:
            f = f_map[u.id]
            f_id = f.id
            if f.status == "accepted":
                status_label = "friends"
            elif f.requester_id == current_user.id:
                status_label = "pending_sent"
            else:
                status_label = "pending_received"

        results.append(FriendSuggestionResponse(
            user=UserResponse.model_validate(u),
            friendship_status=status_label,
            friendship_id=f_id
        ))

    return results

@router.post("/request/{target_user_id}")
async def send_friend_request(
    target_user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a friend request to another user"""
    if target_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot send request to yourself")

    # Check target user exists
    target = await db.get(User, target_user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    # Check existing friendship
    existing = await db.execute(
        select(Friendship).where(
            or_(
                and_(Friendship.requester_id == current_user.id, Friendship.receiver_id == target_user_id),
                and_(Friendship.requester_id == target_user_id, Friendship.receiver_id == current_user.id)
            )
        )
    )
    rel = existing.scalar_one_or_none()
    if rel:
        if rel.status == "accepted":
            return {"message": "Already friends", "status": "friends", "id": rel.id}
        elif rel.status == "declined":
            # Re-send friend request if previously declined
            rel.requester_id = current_user.id
            rel.receiver_id = target_user_id
            rel.status = "pending"
            await db.commit()
            return {"message": "Friend request sent", "status": "pending_sent", "id": rel.id}
        elif rel.requester_id == current_user.id:
            return {"message": "Request already sent", "status": "pending_sent", "id": rel.id}
        else:
            # Auto-accept if mutual
            rel.status = "accepted"
            await get_or_create_direct_conversation(db, current_user.id, target_user_id)
            await db.commit()
            return {"message": "Mutual request accepted", "status": "friends", "id": rel.id}

    new_rel = Friendship(
        requester_id=current_user.id,
        receiver_id=target_user_id,
        status="pending"
    )
    db.add(new_rel)
    await db.commit()
    await db.refresh(new_rel)

    return {"message": "Friend request sent", "status": "pending_sent", "id": new_rel.id}

@router.post("/cancel/{target_user_id}")
async def cancel_friend_request(
    target_user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel a pending friend request sent by current user"""
    existing = await db.execute(
        select(Friendship).where(
            or_(
                and_(Friendship.requester_id == current_user.id, Friendship.receiver_id == target_user_id),
                Friendship.id == target_user_id
            )
        )
    )
    rel = existing.scalar_one_or_none()
    if rel:
        await db.delete(rel)
        await db.commit()
        return {"message": "Friend request cancelled", "status": "none"}
    return {"message": "No request found", "status": "none"}

@router.post("/accept/{friendship_id}")
async def accept_friend_request(
    friendship_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Accept incoming friend request and automatically create a chat conversation"""
    rel = await db.get(Friendship, friendship_id)
    if not rel or rel.receiver_id != current_user.id:
        raise HTTPException(status_code=404, detail="Friend request not found")

    rel.status = "accepted"

    # Ensure a direct conversation exists between the two users
    other_user_id = rel.requester_id
    conv = await get_or_create_direct_conversation(db, current_user.id, other_user_id)

    await db.commit()
    return {"message": "Friend request accepted", "status": "friends", "conversation_id": conv.id}

@router.post("/decline/{friendship_id}")
async def decline_friend_request(
    friendship_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rel = await db.get(Friendship, friendship_id)
    if not rel or rel.receiver_id != current_user.id:
        raise HTTPException(status_code=404, detail="Friend request not found")

    await db.delete(rel)
    await db.commit()
    return {"message": "Friend request declined", "status": "none"}

@router.get("/my-friends", response_model=List[UserResponse])
async def get_my_friends(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns list of accepted friends"""
    stmt = select(Friendship).where(
        and_(
            Friendship.status == "accepted",
            or_(Friendship.requester_id == current_user.id, Friendship.receiver_id == current_user.id)
        )
    )
    res = await db.execute(stmt)
    friendships = res.scalars().all()

    friend_ids = []
    for f in friendships:
        fid = f.receiver_id if f.requester_id == current_user.id else f.requester_id
        friend_ids.append(fid)

    if not friend_ids:
        return []

    users_stmt = select(User).where(User.id.in_(friend_ids))
    users_res = await db.execute(users_stmt)
    return [UserResponse.model_validate(u) for u in users_res.scalars().all()]

@router.get("/requests")
async def get_pending_requests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns pending friend requests received by current user"""
    stmt = (
        select(Friendship)
        .where(Friendship.receiver_id == current_user.id, Friendship.status == "pending")
        .order_by(Friendship.created_at.desc())
    )
    res = await db.execute(stmt)
    friendships = res.scalars().all()

    data = []
    for f in friendships:
        requester = await db.get(User, f.requester_id)
        if requester:
            data.append({
                "id": f.id,
                "created_at": f.created_at,
                "requester": UserResponse.model_validate(requester)
            })
    return data
