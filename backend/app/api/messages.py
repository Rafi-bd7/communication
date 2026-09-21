from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc, asc
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Conversation, ConversationMember, Message, MessageReaction
from app.schemas.schemas import MessageCreate, MessageUpdate, MessageReactionCreate, MessageResponse, ReactionResponse, UserResponse
from app.services.chat_service import is_user_in_conversation, get_conversation_member_ids
from app.websocket.connection_manager import manager

router = APIRouter(tags=["messages"])

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    conversation_id: str,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not await is_user_in_conversation(db, current_user.id, conversation_id):
        raise HTTPException(status_code=403, detail="Not authorized to view messages in this conversation")

    stmt = (
        select(Message)
        .where(Message.conversation_id == conversation_id, Message.is_deleted == False)
        .options(
            selectinload(Message.sender),
            selectinload(Message.reactions),
            selectinload(Message.reply_to).selectinload(Message.sender)
        )
        .order_by(asc(Message.created_at))
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    messages = result.scalars().all()

    response_list = []
    for msg in messages:
        reply_dict = None
        if msg.reply_to:
            reply_dict = {
                "id": msg.reply_to.id,
                "content": msg.reply_to.content,
                "sender_name": msg.reply_to.sender.full_name if msg.reply_to.sender else "User"
            }

        reactions_res = [
            ReactionResponse(
                id=r.id,
                user_id=r.user_id,
                emoji=r.emoji,
                created_at=r.created_at
            ) for r in msg.reactions
        ]

        response_list.append(MessageResponse(
            id=msg.id,
            conversation_id=msg.conversation_id,
            sender_id=msg.sender_id,
            content=msg.content,
            message_type=msg.message_type,
            reply_to_id=msg.reply_to_id,
            file_url=msg.file_url,
            file_name=msg.file_name,
            file_size=msg.file_size,
            is_edited=msg.is_edited,
            is_deleted=msg.is_deleted,
            created_at=msg.created_at,
            edited_at=msg.edited_at,
            sender=UserResponse.model_validate(msg.sender) if msg.sender else None,
            reactions=reactions_res,
            reply_to=reply_dict
        ))

    return response_list

@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse)
async def send_message(
    conversation_id: str,
    body: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not await is_user_in_conversation(db, current_user.id, conversation_id):
        raise HTTPException(status_code=403, detail="Not authorized to send messages to this conversation")

    msg = Message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        content=body.content,
        message_type=body.message_type,
        reply_to_id=body.reply_to_id,
        file_url=body.file_url,
        file_name=body.file_name,
        file_size=body.file_size,
    )
    db.add(msg)
    
    # Update conversation updated_at
    conv_res = await db.execute(select(Conversation).where(Conversation.id == conversation_id))
    conv = conv_res.scalar_one_or_none()
    if conv:
        conv.updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(msg)

    # Fetch with relations
    stmt = (
        select(Message)
        .where(Message.id == msg.id)
        .options(
            selectinload(Message.sender),
            selectinload(Message.reactions),
            selectinload(Message.reply_to).selectinload(Message.sender)
        )
    )
    loaded_res = await db.execute(stmt)
    loaded_msg = loaded_res.scalar_one()

    reply_dict = None
    if loaded_msg.reply_to:
        reply_dict = {
            "id": loaded_msg.reply_to.id,
            "content": loaded_msg.reply_to.content,
            "sender_name": loaded_msg.reply_to.sender.full_name if loaded_msg.reply_to.sender else "User"
        }

    msg_response = MessageResponse(
        id=loaded_msg.id,
        conversation_id=loaded_msg.conversation_id,
        sender_id=loaded_msg.sender_id,
        content=loaded_msg.content,
        message_type=loaded_msg.message_type,
        reply_to_id=loaded_msg.reply_to_id,
        file_url=loaded_msg.file_url,
        file_name=loaded_msg.file_name,
        file_size=loaded_msg.file_size,
        is_edited=loaded_msg.is_edited,
        is_deleted=loaded_msg.is_deleted,
        created_at=loaded_msg.created_at,
        edited_at=loaded_msg.edited_at,
        sender=UserResponse.model_validate(loaded_msg.sender),
        reactions=[],
        reply_to=reply_dict
    )

    # Broadcast via WebSocket to all other conversation members
    member_ids = await get_conversation_member_ids(db, conversation_id)
    await manager.broadcast_to_users(member_ids, {
        "type": "chat",
        "event": "new_message",
        "conversation_id": conversation_id,
        "message": msg_response.model_dump(mode="json")
    })

    return msg_response

@router.patch("/messages/{message_id}", response_model=MessageResponse)
async def edit_message(
    message_id: str,
    body: MessageUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Message).where(Message.id == message_id)
    result = await db.execute(stmt)
    msg = result.scalar_one_or_none()

    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    if msg.sender_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot edit someone else's message")

    msg.content = body.content
    msg.is_edited = True
    msg.edited_at = datetime.now(timezone.utc)
    await db.commit()

    member_ids = await get_conversation_member_ids(db, msg.conversation_id)
    await manager.broadcast_to_users(member_ids, {
        "type": "chat",
        "event": "message_edited",
        "message_id": msg.id,
        "content": msg.content,
        "edited_at": msg.edited_at.isoformat()
    })

    return MessageResponse.model_validate(msg)

@router.delete("/messages/{message_id}")
async def delete_message(
    message_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Message).where(Message.id == message_id)
    result = await db.execute(stmt)
    msg = result.scalar_one_or_none()

    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    if msg.sender_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Cannot delete someone else's message")

    msg.is_deleted = True
    await db.commit()

    member_ids = await get_conversation_member_ids(db, msg.conversation_id)
    await manager.broadcast_to_users(member_ids, {
        "type": "chat",
        "event": "message_deleted",
        "message_id": msg.id
    })

    return {"message": "Message deleted successfully"}

@router.post("/messages/{message_id}/reaction")
async def react_to_message(
    message_id: str,
    body: MessageReactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if message exists
    msg_res = await db.execute(select(Message).where(Message.id == message_id))
    msg = msg_res.scalar_one_or_none()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    # Check existing reaction by same user
    existing_res = await db.execute(
        select(MessageReaction).where(
            MessageReaction.message_id == message_id,
            MessageReaction.user_id == current_user.id
        )
    )
    existing = existing_res.scalar_one_or_none()

    if existing:
        if existing.emoji == body.emoji:
            # Toggle off
            await db.delete(existing)
            await db.commit()
            action = "removed"
        else:
            existing.emoji = body.emoji
            await db.commit()
            action = "updated"
    else:
        new_reaction = MessageReaction(
            message_id=message_id,
            user_id=current_user.id,
            emoji=body.emoji
        )
        db.add(new_reaction)
        await db.commit()
        action = "added"

    member_ids = await get_conversation_member_ids(db, msg.conversation_id)
    await manager.broadcast_to_users(member_ids, {
        "type": "chat",
        "event": "reaction_updated",
        "message_id": message_id,
        "user_id": current_user.id,
        "emoji": body.emoji,
        "action": action
    })

    return {"status": "success", "action": action, "emoji": body.emoji}
