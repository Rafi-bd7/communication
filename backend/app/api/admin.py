import os
from pathlib import Path
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user
from app.models.models import User, Conversation, Message, CallRecord, Report
from app.schemas.schemas import UserResponse, ReportResponse

router = APIRouter(prefix="/admin", tags=["admin"])

async def ensure_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privilege required"
        )
    return current_user

@router.get("/metrics")
async def get_system_metrics(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(ensure_admin)
):
    users_count = (await db.execute(select(func.count(User.id)))).scalar() or 0
    convs_count = (await db.execute(select(func.count(Conversation.id)))).scalar() or 0
    msgs_count = (await db.execute(select(func.count(Message.id)))).scalar() or 0
    calls_count = (await db.execute(select(func.count(CallRecord.id)))).scalar() or 0
    reports_count = (await db.execute(select(func.count(Report.id)).where(Report.status == "pending"))).scalar() or 0

    # Calculate upload storage size
    upload_path = Path(settings.UPLOAD_PATH)
    storage_bytes = sum(f.stat().st_size for f in upload_path.glob("**/*") if f.is_file()) if upload_path.exists() else 0
    storage_mb = round(storage_bytes / (1024 * 1024), 2)

    return {
        "total_users": users_count,
        "total_conversations": convs_count,
        "total_messages": msgs_count,
        "total_calls": calls_count,
        "pending_reports": reports_count,
        "storage_mb": storage_mb,
        "system_status": "Healthy 🟢",
        "realtime_engine": "WebSocket & WebRTC Active"
    }

@router.get("/users", response_model=List[UserResponse])
async def list_admin_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(ensure_admin)
):
    stmt = select(User).order_by(desc(User.created_at)).offset(skip).limit(limit)
    result = await db.execute(stmt)
    users = result.scalars().all()
    return [UserResponse.model_validate(u) for u in users]

@router.post("/users/{user_id}/toggle-ban")
async def toggle_user_ban(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(ensure_admin)
):
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot ban yourself")

    user.is_blocked = not user.is_blocked
    await db.commit()
    await db.refresh(user)
    return {"user_id": user.id, "is_blocked": user.is_blocked, "message": f"User {'banned' if user.is_blocked else 'unbanned'}"}

@router.get("/reports", response_model=List[ReportResponse])
async def list_reports(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(ensure_admin)
):
    stmt = select(Report).order_by(desc(Report.created_at)).limit(50)
    result = await db.execute(stmt)
    reports = result.scalars().all()

    resp = []
    for r in reports:
        reporter = (await db.execute(select(User).where(User.id == r.reporter_id))).scalar_one_or_none()
        reported = None
        if r.reported_user_id:
            reported = (await db.execute(select(User).where(User.id == r.reported_user_id))).scalar_one_or_none()
            
        resp.append(ReportResponse(
            id=r.id,
            reporter_id=r.reporter_id,
            reported_user_id=r.reported_user_id,
            message_id=r.message_id,
            reason=r.reason,
            status=r.status,
            created_at=r.created_at,
            reporter=UserResponse.model_validate(reporter) if reporter else None,
            reported_user=UserResponse.model_validate(reported) if reported else None,
        ))

    return resp

@router.post("/reports/{report_id}/resolve")
async def resolve_report(
    report_id: str,
    action: str = "resolve",  # resolve, dismiss
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(ensure_admin)
):
    res = await db.execute(select(Report).where(Report.id == report_id))
    rep = res.scalar_one_or_none()
    if not rep:
        raise HTTPException(status_code=404, detail="Report not found")

    rep.status = "resolved" if action == "resolve" else "dismissed"
    await db.commit()
    return {"message": f"Report marked as {rep.status}"}
