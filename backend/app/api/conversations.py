from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Conversation, ConversationMember, Message
from app.schemas.schemas import (
    ConversationResponse, 
    DirectConversationCreate, 
    GroupConversationCreate,
    ConversationMemberResponse,
    UserResponse
)
from app.services.chat_service import get_or_create_direct_conversation

router = APIRouter(prefix="/conversations", tags=["conversations"])

@router.get("", response_model=List[ConversationResponse])
async def get_my_conversations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Find all conversation IDs where current user is a member
    member_stmt = select(ConversationMember.conversation_id).where(ConversationMember.user_id == current_user.id)
    result = await db.execute(member_stmt)
    conv_ids = result.scalars().all()

    if not conv_ids:
        return []

    # Query conversations with members and users
    stmt = (
        select(Conversation)
        .where(Conversation.id.in_(conv_ids))
        .options(
            selectinload(Conversation.members).selectinload(ConversationMember.user)
        )
        .order_by(desc(Conversation.updated_at))
    )
    conv_result = await db.execute(stmt)
    conversations = conv_result.scalars().all()

    response_list = []
    for conv in conversations:
        # Fetch last message
        last_msg_stmt = (
            select(Message)
            .where(Message.conversation_id == conv.id, Message.is_deleted == False)
            .order_by(desc(Message.created_at))
            .limit(1)
        )
        last_msg_res = await db.execute(last_msg_stmt)
        last_msg = last_msg_res.scalar_one_or_none()

        last_msg_dict = None
        if last_msg:
            last_msg_dict = {
                "id": last_msg.id,
                "content": last_msg.content,
                "message_type": last_msg.message_type,
                "created_at": last_msg.created_at.isoformat(),
                "sender_id": last_msg.sender_id
            }

        members_res = [
            ConversationMemberResponse(
                id=m.id,
                user_id=m.user_id,
                role=m.role,
                user=UserResponse.model_validate(m.user)
            ) for m in conv.members
        ]

        # For direct conversations, dynamic name and avatar can be the other participant
        display_name = conv.name
        display_avatar = conv.avatar_url
        if conv.type == "direct":
            other_member = next((m for m in conv.members if m.user_id != current_user.id), None)
            if other_member and other_member.user:
                display_name = other_member.user.full_name
                display_avatar = other_member.user.avatar_url

        response_list.append(ConversationResponse(
            id=conv.id,
            type=conv.type,
            name=display_name,
            description=conv.description,
            avatar_url=display_avatar,
            created_by=conv.created_by,
            created_at=conv.created_at,
            updated_at=conv.updated_at,
            members=members_res,
            unread_count=0,
            last_message=last_msg_dict
        ))

    return response_list

@router.post("/direct", response_model=ConversationResponse)
async def create_or_get_direct(
    body: DirectConversationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if body.target_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot start a direct conversation with yourself")

    target_user_res = await db.execute(select(User).where(User.id == body.target_user_id))
    target_user = target_user_res.scalar_one_or_none()
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")

    conv = await get_or_create_direct_conversation(db, current_user.id, target_user.id)
    
    # Reload with relations
    stmt = (
        select(Conversation)
        .where(Conversation.id == conv.id)
        .options(selectinload(Conversation.members).selectinload(ConversationMember.user))
    )
    res = await db.execute(stmt)
    full_conv = res.scalar_one()

    members_res = [
        ConversationMemberResponse(
            id=m.id,
            user_id=m.user_id,
            role=m.role,
            user=UserResponse.model_validate(m.user)
        ) for m in full_conv.members
    ]

    return ConversationResponse(
        id=full_conv.id,
        type=full_conv.type,
        name=target_user.full_name,
        description=target_user.bio,
        avatar_url=target_user.avatar_url,
        created_by=full_conv.created_by,
        created_at=full_conv.created_at,
        updated_at=full_conv.updated_at,
        members=members_res,
        unread_count=0,
        last_message=None
    )

@router.post("/group", response_model=ConversationResponse)
async def create_group_conversation(
    body: GroupConversationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_conv = Conversation(
        type="group",
        name=body.name,
        description=body.description,
        avatar_url=body.avatar_url or f"https://api.dicebear.com/7.x/identicon/svg?seed={body.name}",
        created_by=current_user.id
    )
    db.add(new_conv)
    await db.flush()

    # Add creator as admin
    creator_member = ConversationMember(
        conversation_id=new_conv.id,
        user_id=current_user.id,
        role="admin"
    )
    db.add(creator_member)

    # Add other members
    for uid in body.member_ids:
        if uid != current_user.id:
            db.add(ConversationMember(
                conversation_id=new_conv.id,
                user_id=uid,
                role="member"
            ))

    await db.commit()
    
    # Reload
    stmt = (
        select(Conversation)
        .where(Conversation.id == new_conv.id)
        .options(selectinload(Conversation.members).selectinload(ConversationMember.user))
    )
    res = await db.execute(stmt)
    full_conv = res.scalar_one()

    members_res = [
        ConversationMemberResponse(
            id=m.id,
            user_id=m.user_id,
            role=m.role,
            user=UserResponse.model_validate(m.user)
        ) for m in full_conv.members
    ]

    return ConversationResponse(
        id=full_conv.id,
        type=full_conv.type,
        name=full_conv.name,
        description=full_conv.description,
        avatar_url=full_conv.avatar_url,
        created_by=full_conv.created_by,
        created_at=full_conv.created_at,
        updated_at=full_conv.updated_at,
        members=members_res,
        unread_count=0,
        last_message=None
    )
