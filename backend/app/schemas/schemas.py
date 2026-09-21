from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr

# Auth & User
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    phone: Optional[str] = None
    full_name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    is_online: bool
    last_seen: Optional[datetime] = None
    is_admin: bool
    is_blocked: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Conversation
class DirectConversationCreate(BaseModel):
    target_user_id: str

class GroupConversationCreate(BaseModel):
    name: str
    description: Optional[str] = None
    avatar_url: Optional[str] = None
    member_ids: List[str]

class ConversationMemberResponse(BaseModel):
    id: str
    user_id: str
    role: str
    user: UserResponse

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: str
    type: str
    name: Optional[str] = None
    description: Optional[str] = None
    avatar_url: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    members: List[ConversationMemberResponse] = []
    unread_count: int = 0
    last_message: Optional[dict] = None

    class Config:
        from_attributes = True

# Message
class MessageCreate(BaseModel):
    conversation_id: str
    content: str
    message_type: str = "text"
    reply_to_id: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None

class MessageUpdate(BaseModel):
    content: str

class MessageReactionCreate(BaseModel):
    emoji: str

class ReactionResponse(BaseModel):
    id: str
    user_id: str
    emoji: str
    created_at: datetime

    class Config:
        from_attributes = True

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    content: str
    message_type: str
    reply_to_id: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    is_edited: bool
    is_deleted: bool
    created_at: datetime
    edited_at: Optional[datetime] = None
    sender: Optional[UserResponse] = None
    reactions: List[ReactionResponse] = []
    reply_to: Optional[dict] = None

    class Config:
        from_attributes = True

# Status (Story)
class StatusCreate(BaseModel):
    media_url: Optional[str] = None
    media_type: str = "text"  # text, image, video
    caption: Optional[str] = None
    background_color: Optional[str] = "#059669"

class StatusResponse(BaseModel):
    id: str
    user_id: str
    media_url: Optional[str] = None
    media_type: str
    caption: Optional[str] = None
    background_color: Optional[str] = None
    created_at: datetime
    expires_at: datetime
    user: Optional[UserResponse] = None
    views_count: int = 0
    has_viewed: bool = False

    class Config:
        from_attributes = True

# Call
class CallCreate(BaseModel):
    receiver_id: str
    conversation_id: Optional[str] = None
    call_type: str = "video"  # voice, video

class CallResponse(BaseModel):
    id: str
    caller_id: str
    receiver_id: Optional[str] = None
    call_type: str
    status: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration: int
    caller: Optional[UserResponse] = None
    receiver: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# AI
class SummarizeRequest(BaseModel):
    conversation_id: str
    limit: int = 30

class TranslateRequest(BaseModel):
    text: str
    target_language: str = "Bangla"  # Bangla, English, Spanish, Arabic, Hindi, French, German

class SmartRepliesRequest(BaseModel):
    conversation_id: str
    last_message: Optional[str] = None

class AIResponse(BaseModel):
    success: bool
    result: str
    options: Optional[List[str]] = None

# Report
class ReportCreate(BaseModel):
    reported_user_id: Optional[str] = None
    message_id: Optional[str] = None
    reason: str

class ReportResponse(BaseModel):
    id: str
    reporter_id: str
    reported_user_id: Optional[str] = None
    message_id: Optional[str] = None
    reason: str
    status: str
    created_at: datetime
    reporter: Optional[UserResponse] = None
    reported_user: Optional[UserResponse] = None

    class Config:
        from_attributes = True
