from datetime import datetime, timezone, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc, delete
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Status, StatusView
from app.schemas.schemas import StatusCreate, StatusResponse, UserResponse

router = APIRouter(prefix="/statuses", tags=["statuses"])

@router.get("", response_model=List[StatusResponse])
async def get_active_statuses(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    stmt = (
        select(Status)
        .where(Status.expires_at > now)
        .options(
            selectinload(Status.user),
            selectinload(Status.views)
        )
        .order_by(desc(Status.created_at))
    )
    result = await db.execute(stmt)
    statuses = result.scalars().all()

    response_list = []
    for s in statuses:
        has_viewed = any(v.viewer_id == current_user.id for v in s.views)
        response_list.append(StatusResponse(
            id=s.id,
            user_id=s.user_id,
            media_url=s.media_url,
            media_type=s.media_type,
            caption=s.caption,
            background_color=s.background_color,
            created_at=s.created_at,
            expires_at=s.expires_at,
            user=UserResponse.model_validate(s.user) if s.user else None,
            views_count=len(s.views),
            has_viewed=has_viewed
        ))

    return response_list

@router.post("", response_model=StatusResponse)
async def create_status(
    body: StatusCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    expires = now + timedelta(hours=24)

    status_obj = Status(
        user_id=current_user.id,
        media_url=body.media_url,
        media_type=body.media_type,
        caption=body.caption,
        background_color=body.background_color or "#059669",
        created_at=now,
        expires_at=expires
    )
    db.add(status_obj)
    await db.commit()
    await db.refresh(status_obj)

    return StatusResponse(
        id=status_obj.id,
        user_id=status_obj.user_id,
        media_url=status_obj.media_url,
        media_type=status_obj.media_type,
        caption=status_obj.caption,
        background_color=status_obj.background_color,
        created_at=status_obj.created_at,
        expires_at=status_obj.expires_at,
        user=UserResponse.model_validate(current_user),
        views_count=0,
        has_viewed=False
    )

@router.post("/{status_id}/view")
async def view_status(
    status_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if already viewed
    existing = await db.execute(
        select(StatusView).where(
            StatusView.status_id == status_id,
            StatusView.viewer_id == current_user.id
        )
    )
    if not existing.scalar_one_or_none():
        view = StatusView(status_id=status_id, viewer_id=current_user.id)
        db.add(view)
        await db.commit()
    return {"message": "Status marked as viewed"}

@router.delete("/{status_id}")
async def delete_status(
    status_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(Status).where(Status.id == status_id))
    s = res.scalar_one_or_none()
    if not s:
        raise HTTPException(status_code=404, detail="Status not found")
    if s.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Cannot delete someone else's status")

    await db.execute(delete(StatusView).where(StatusView.status_id == status_id))
    await db.delete(s)
    await db.commit()
    return {"message": "Status deleted", "id": status_id}
