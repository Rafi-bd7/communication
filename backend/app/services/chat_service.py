from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from app.models.models import Conversation, ConversationMember, Message, User

async def get_or_create_direct_conversation(db: AsyncSession, user1_id: str, user2_id: str) -> Conversation:
    # Query direct conversations where both user1 and user2 are members
    stmt = (
        select(Conversation)
        .join(ConversationMember)
        .where(
            Conversation.type == "direct",
            ConversationMember.user_id.in_([user1_id, user2_id])
        )
        .group_by(Conversation.id)
        .having(func.count(ConversationMember.user_id) == 2)
    )
    result = await db.execute(stmt)
    conv = result.scalar_one_or_none()
    
    if conv:
        return conv

    # Create new direct conversation
    new_conv = Conversation(
        type="direct",
        created_by=user1_id
    )
    db.add(new_conv)
    await db.flush()

    # Add both members
    m1 = ConversationMember(conversation_id=new_conv.id, user_id=user1_id, role="admin")
    m2 = ConversationMember(conversation_id=new_conv.id, user_id=user2_id, role="member")
    db.add_all([m1, m2])
    await db.commit()
    await db.refresh(new_conv)
    return new_conv

async def get_conversation_member_ids(db: AsyncSession, conversation_id: str) -> List[str]:
    stmt = select(ConversationMember.user_id).where(ConversationMember.conversation_id == conversation_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())

async def is_user_in_conversation(db: AsyncSession, user_id: str, conversation_id: str) -> bool:
    stmt = select(ConversationMember).where(
        ConversationMember.conversation_id == conversation_id,
        ConversationMember.user_id == user_id
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none() is not None
