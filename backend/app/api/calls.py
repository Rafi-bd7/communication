from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, desc

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, CallRecord
from app.schemas.schemas import CallCreate, CallResponse, UserResponse
from app.websocket.connection_manager import manager

router = APIRouter(prefix="/calls", tags=["calls"])

@router.get("/history", response_model=List[CallResponse])
async def get_call_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = (
        select(CallRecord)
        .where(
            or_(CallRecord.caller_id == current_user.id, CallRecord.receiver_id == current_user.id)
        )
        .order_by(desc(CallRecord.started_at))
        .limit(50)
    )
    result = await db.execute(stmt)
    calls = result.scalars().all()

    # Load users for response
    resp = []
    for c in calls:
        caller_res = await db.execute(select(User).where(User.id == c.caller_id))
        caller = caller_res.scalar_one_or_none()
        receiver = None
        if c.receiver_id:
            receiver_res = await db.execute(select(User).where(User.id == c.receiver_id))
            receiver = receiver_res.scalar_one_or_none()

        resp.append(CallResponse(
            id=c.id,
            caller_id=c.caller_id,
            receiver_id=c.receiver_id,
            call_type=c.call_type,
            status=c.status,
            started_at=c.started_at,
            ended_at=c.ended_at,
            duration=c.duration,
            caller=UserResponse.model_validate(caller) if caller else None,
            receiver=UserResponse.model_validate(receiver) if receiver else None,
        ))

    return resp

@router.post("/initiate", response_model=CallResponse)
async def initiate_call(
    body: CallCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    call = CallRecord(
        caller_id=current_user.id,
        receiver_id=body.receiver_id,
        conversation_id=body.conversation_id,
        call_type=body.call_type,
        status="ringing",
        started_at=datetime.now(timezone.utc)
    )
    db.add(call)
    await db.commit()
    await db.refresh(call)

    # Signal the receiver via WebSocket
    await manager.send_to_user(body.receiver_id, {
        "type": "webrtc",
        "event": "incoming_call",
        "call_id": call.id,
        "caller": UserResponse.model_validate(current_user).model_dump(mode="json"),
        "call_type": body.call_type,
        "conversation_id": body.conversation_id
    })

    return CallResponse(
        id=call.id,
        caller_id=call.caller_id,
        receiver_id=call.receiver_id,
        call_type=call.call_type,
        status=call.status,
        started_at=call.started_at,
        ended_at=None,
        duration=0,
        caller=UserResponse.model_validate(current_user),
        receiver=None
    )

@router.post("/{call_id}/end")
async def end_call(
    call_id: str,
    duration: int = 0,
    status_reason: str = "ended",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(CallRecord).where(CallRecord.id == call_id))
    call = res.scalar_one_or_none()
    if call:
        call.status = status_reason
        call.ended_at = datetime.now(timezone.utc)
        call.duration = duration
        await db.commit()
        
        # Notify other party
        target_id = call.receiver_id if call.caller_id == current_user.id else call.caller_id
        if target_id:
            await manager.send_to_user(target_id, {
                "type": "webrtc",
                "event": "call_ended",
                "call_id": call_id,
                "reason": status_reason
            })

    return {"message": "Call ended successfully"}
