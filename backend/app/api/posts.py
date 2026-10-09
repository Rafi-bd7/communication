from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Post, Friendship
from app.schemas.schemas import UserResponse

router = APIRouter(prefix="/posts", tags=["posts"])

class PostCreate(BaseModel):
    content: str
    media_url: Optional[str] = None
    privacy: Optional[str] = "public"  # "public" or "friends"

class PostResponse(BaseModel):
    id: str
    content: str
    media_url: Optional[str] = None
    privacy: str = "public"
    likes_count: int
    created_at: datetime
    author: UserResponse

    class Config:
        from_attributes = True

@router.get("/feed", response_model=List[PostResponse])
async def get_timeline_feed(
    skip: int = 0,
    limit: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get global / friends timeline feed with privacy check"""
    # Fetch friends of current user
    f_stmt = select(Friendship).where(
        and_(
            Friendship.status == "accepted",
            or_(Friendship.requester_id == current_user.id, Friendship.receiver_id == current_user.id)
        )
    )
    f_res = await db.execute(f_stmt)
    friendships = f_res.scalars().all()
    friend_ids = {
        f.receiver_id if f.requester_id == current_user.id else f.requester_id
        for f in friendships
    }
    friend_ids.add(current_user.id)

    stmt = select(Post).order_by(Post.created_at.desc()).offset(skip).limit(limit * 2)
    res = await db.execute(stmt)
    posts = res.scalars().all()

    response = []
    for p in posts:
        post_privacy = getattr(p, 'privacy', 'public') or 'public'
        if post_privacy == 'friends' and p.user_id not in friend_ids:
            continue

        author = await db.get(User, p.user_id)
        if author:
            response.append(PostResponse(
                id=p.id,
                content=p.content,
                media_url=p.media_url,
                privacy=post_privacy,
                likes_count=p.likes_count,
                created_at=p.created_at,
                author=UserResponse.model_validate(author)
            ))
            if len(response) >= limit:
                break
    return response

@router.post("", response_model=PostResponse)
@router.post("/", response_model=PostResponse)
async def create_post(
    post_in: PostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Publish a status or photo update to timeline"""
    if not post_in.content.strip() and not post_in.media_url:
        raise HTTPException(status_code=400, detail="Post content or media required")

    new_post = Post(
        user_id=current_user.id,
        content=post_in.content,
        media_url=post_in.media_url,
        privacy=post_in.privacy or "public",
        likes_count=0
    )
    db.add(new_post)
    await db.commit()
    await db.refresh(new_post)

    return PostResponse(
        id=new_post.id,
        content=new_post.content,
        media_url=new_post.media_url,
        privacy=new_post.privacy or "public",
        likes_count=new_post.likes_count,
        created_at=new_post.created_at,
        author=UserResponse.model_validate(current_user)
    )

@router.post("/{post_id}/like")
async def like_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = await db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.likes_count += 1
    await db.commit()
    return {"likes_count": post.likes_count}

@router.get("/user/{user_id}", response_model=List[PostResponse])
async def get_user_posts(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    author = await db.get(User, user_id)
    if not author:
        raise HTTPException(status_code=404, detail="User not found")

    is_self = (user_id == current_user.id)
    is_friend = False
    if not is_self:
        f_stmt = select(Friendship).where(
            and_(
                Friendship.status == "accepted",
                or_(
                    and_(Friendship.requester_id == current_user.id, Friendship.receiver_id == user_id),
                    and_(Friendship.requester_id == user_id, Friendship.receiver_id == current_user.id)
                )
            )
        )
        f_res = await db.execute(f_stmt)
        is_friend = f_res.scalar_one_or_none() is not None

    if is_self or is_friend:
        stmt = select(Post).where(Post.user_id == user_id).order_by(Post.created_at.desc()).limit(30)
    else:
        stmt = select(Post).where(and_(Post.user_id == user_id, Post.privacy == "public")).order_by(Post.created_at.desc()).limit(30)

    res = await db.execute(stmt)
    posts = res.scalars().all()

    return [
        PostResponse(
            id=p.id,
            content=p.content,
            media_url=p.media_url,
            privacy=getattr(p, 'privacy', 'public') or 'public',
            likes_count=p.likes_count,
            created_at=p.created_at,
            author=UserResponse.model_validate(author)
        )
        for p in posts
    ]

@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = await db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    await db.delete(post)
    await db.commit()
    return {"message": "Post deleted successfully", "id": post_id}

