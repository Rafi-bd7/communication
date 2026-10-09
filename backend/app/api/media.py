import os
import uuid
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from app.core.config import settings
from app.core.security import get_current_user
from app.models.models import User

router = APIRouter(prefix="/media", tags=["media"])

ALLOWED_EXTENSIONS = {
    # Images (including iOS HEIC/HEIF and camera photos)
    "png", "jpg", "jpeg", "gif", "webp", "svg", "heic", "heif", "avif", "jfif", "bmp", "tiff", "ico",
    # Audio (including iOS voice memos/audio)
    "mp3", "wav", "ogg", "webm", "m4a", "aac", "caf",
    # Video (including iOS quicktime/MOV)
    "mp4", "webm", "mov", "qt",
    # Documents
    "pdf", "doc", "docx", "txt", "zip"
}

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...)
):
    orig_name = file.filename or "photo.jpg"
    
    if "." in orig_name:
        ext = orig_name.rsplit(".", 1)[-1].lower()
    else:
        # Auto-detect extension from content_type (common on iOS mobile uploads)
        ct = (file.content_type or "").lower()
        if "jpeg" in ct or "jpg" in ct:
            ext = "jpg"
        elif "png" in ct:
            ext = "png"
        elif "heic" in ct:
            ext = "heic"
        elif "heif" in ct:
            ext = "heif"
        elif "webp" in ct:
            ext = "webp"
        elif "image" in ct:
            ext = "jpg"
        elif "audio" in ct:
            ext = "m4a"
        elif "video" in ct:
            ext = "mp4"
        else:
            ext = "jpg"
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File extension '.{ext}' is not supported"
        )

    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    dest_path = Path(settings.UPLOAD_PATH) / unique_filename

    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    file_size = os.path.getsize(dest_path)
    file_url = f"/uploads/{unique_filename}"

    # Determine message type
    message_type = "file"
    if ext in ["png", "jpg", "jpeg", "gif", "webp", "svg", "heic", "heif", "avif", "jfif", "bmp", "tiff", "ico"]:
        message_type = "image"
    elif ext in ["mp3", "wav", "ogg", "webm", "m4a", "aac", "caf"]:
        message_type = "audio"
    elif ext in ["mp4", "mov", "qt"]:
        message_type = "video"

    return {
        "url": file_url,
        "file_url": file_url,
        "file_name": orig_name,
        "file_size": file_size,
        "content_type": file.content_type,
        "message_type": message_type
    }
