from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Message
from app.schemas.schemas import SummarizeRequest, TranslateRequest, SmartRepliesRequest, AIResponse
from app.services.ai_service import ai_service
from app.services.chat_service import is_user_in_conversation

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/smart-replies", response_model=AIResponse)
async def get_smart_replies(
    body: SmartRepliesRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    last_text = body.last_message
    if not last_text:
        # Fetch the most recent message from this conversation
        stmt = (
            select(Message)
            .where(Message.conversation_id == body.conversation_id, Message.is_deleted == False)
            .order_by(desc(Message.created_at))
            .limit(1)
        )
        res = await db.execute(stmt)
        msg = res.scalar_one_or_none()
        if msg:
            last_text = msg.content

    suggestions = await ai_service.generate_smart_replies(last_text or "")
    return AIResponse(
        success=True,
        result="Generated smart replies",
        options=suggestions
    )

@router.post("/summarize", response_model=AIResponse)
async def summarize_chat(
    body: SummarizeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not await is_user_in_conversation(db, current_user.id, body.conversation_id):
        raise HTTPException(status_code=403, detail="Not a member of this conversation")

    stmt = (
        select(Message)
        .where(Message.conversation_id == body.conversation_id, Message.is_deleted == False)
        .options(selectinload(Message.sender))
        .order_by(desc(Message.created_at))
        .limit(body.limit)
    )
    result = await db.execute(stmt)
    msgs = list(reversed(result.scalars().all()))

    formatted_msgs = [
        {
            "sender_name": m.sender.full_name if m.sender else "User",
            "content": m.content
        } for m in msgs
    ]

    summary = await ai_service.summarize_conversation(formatted_msgs)
    return AIResponse(
        success=True,
        result=summary
    )

@router.post("/translate", response_model=AIResponse)
async def translate_message(
    body: TranslateRequest,
    current_user: User = Depends(get_current_user)
):
    translated = await ai_service.translate_text(body.text, body.target_language)
    return AIResponse(
        success=True,
        result=translated
    )

@router.post("/assistant", response_model=AIResponse)
async def ask_assistant(
    prompt: str,
    current_user: User = Depends(get_current_user)
):
    ans = await ai_service.ask_assistant(prompt)
    return AIResponse(
        success=True,
        result=ans
    )
