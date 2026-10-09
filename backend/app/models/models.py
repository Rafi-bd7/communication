import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    avatar_url = Column(String(255), nullable=True)
    bio = Column(String(255), default="Hey there! I am using this communication platform.")
    is_online = Column(Boolean, default=False)
    last_seen = Column(DateTime, default=utc_now)
    is_admin = Column(Boolean, default=False)
    is_blocked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    memberships = relationship("ConversationMember", back_populates="user", cascade="all, delete-orphan")
    sent_messages = relationship("Message", back_populates="sender", cascade="all, delete-orphan")
    statuses = relationship("Status", back_populates="user", cascade="all, delete-orphan")
    reactions = relationship("MessageReaction", back_populates="user", cascade="all, delete-orphan")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    type = Column(String(20), default="direct")  # direct, group, channel
    name = Column(String(100), nullable=True)
    description = Column(String(255), nullable=True)
    avatar_url = Column(String(255), nullable=True)
    created_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    members = relationship("ConversationMember", back_populates="conversation", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class ConversationMember(Base):
    __tablename__ = "conversation_members"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    role = Column(String(20), default="member")  # admin, member
    joined_at = Column(DateTime, default=utc_now)
    last_read_message_id = Column(String(36), nullable=True)
    is_muted = Column(Boolean, default=False)

    # Relationships
    conversation = relationship("Conversation", back_populates="members")
    user = relationship("User", back_populates="memberships")

class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False, index=True)
    sender_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    message_type = Column(String(20), default="text")  # text, image, video, audio, file, call_log, system
    reply_to_id = Column(String(36), ForeignKey("messages.id"), nullable=True)
    file_url = Column(String(255), nullable=True)
    file_name = Column(String(255), nullable=True)
    file_size = Column(Integer, nullable=True)
    is_edited = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now, index=True)
    edited_at = Column(DateTime, nullable=True)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", back_populates="sent_messages")
    reactions = relationship("MessageReaction", back_populates="message", cascade="all, delete-orphan")
    reply_to = relationship("Message", remote_side=[id])

class MessageReaction(Base):
    __tablename__ = "message_reactions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    message_id = Column(String(36), ForeignKey("messages.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    emoji = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=utc_now)

    # Relationships
    message = relationship("Message", back_populates="reactions")
    user = relationship("User", back_populates="reactions")

class Status(Base):
    __tablename__ = "statuses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    media_url = Column(String(255), nullable=True)
    media_type = Column(String(20), default="text")  # text, image, video
    caption = Column(Text, nullable=True)
    background_color = Column(String(20), default="#059669")
    created_at = Column(DateTime, default=utc_now)
    expires_at = Column(DateTime, nullable=False)

    # Relationships
    user = relationship("User", back_populates="statuses")
    views = relationship("StatusView", back_populates="status", cascade="all, delete-orphan")

class StatusView(Base):
    __tablename__ = "status_views"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    status_id = Column(String(36), ForeignKey("statuses.id"), nullable=False)
    viewer_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    viewed_at = Column(DateTime, default=utc_now)

    status = relationship("Status", back_populates="views")

class CallRecord(Base):
    __tablename__ = "calls"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    caller_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    receiver_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=True)
    call_type = Column(String(20), default="video")  # voice, video
    status = Column(String(20), default="ended")     # ringing, answered, missed, ended, rejected
    started_at = Column(DateTime, default=utc_now)
    ended_at = Column(DateTime, nullable=True)
    duration = Column(Integer, default=0)            # seconds

class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    reporter_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    reported_user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    message_id = Column(String(36), ForeignKey("messages.id"), nullable=True)
    reason = Column(Text, nullable=False)
    status = Column(String(20), default="pending")  # pending, resolved, dismissed
    created_at = Column(DateTime, default=utc_now)

class Friendship(Base):
    __tablename__ = "friendships"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    requester_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    receiver_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="pending")  # pending, accepted, declined
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    requester = relationship("User", foreign_keys=[requester_id])
    receiver = relationship("User", foreign_keys=[receiver_id])

class Post(Base):
    __tablename__ = "posts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    media_url = Column(String(255), nullable=True)
    likes_count = Column(Integer, default=0)
    privacy = Column(String(20), default="public")  # "public" or "friends"
    created_at = Column(DateTime, default=utc_now)

    author = relationship("User")
