from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Report
from app.schemas.schemas import ReportCreate, ReportResponse

router = APIRouter(prefix="/reports", tags=["reports"])

@router.post("", response_model=ReportResponse)
async def submit_report(
    body: ReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rep = Report(
        reporter_id=current_user.id,
        reported_user_id=body.reported_user_id,
        message_id=body.message_id,
        reason=body.reason,
        status="pending"
    )
    db.add(rep)
    await db.commit()
    await db.refresh(rep)

    return ReportResponse(
        id=rep.id,
        reporter_id=rep.reporter_id,
        reported_user_id=rep.reported_user_id,
        message_id=rep.message_id,
        reason=rep.reason,
        status=rep.status,
        created_at=rep.created_at,
        reporter=None,
        reported_user=None
    )
