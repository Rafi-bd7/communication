import json
import socket
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select

from app.core.config import settings
from app.core.database import init_db, AsyncSessionLocal
from app.core.security import decode_token, get_password_hash
from app.models.models import User
from app.websocket.connection_manager import manager

# Routers
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.conversations import router as conversations_router
from app.api.messages import router as messages_router
from app.api.media import router as media_router
from app.api.calls import router as calls_router
from app.api.statuses import router as statuses_router
from app.api.ai import router as ai_router
from app.api.admin import router as admin_router
from app.api.reports import router as reports_router
from app.api.friends import router as friends_router
from app.api.posts import router as posts_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("adda-platform")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database...")
    await init_db()

    # Automatically seed an initial admin account only if none exist
    async with AsyncSessionLocal() as session:
        user_res = await session.execute(select(User).limit(1))
        if not user_res.scalar_one_or_none():
            logger.info("Initializing system administrator account...")
            pwd_hash = get_password_hash("admin123")
            admin_user = User(
                username="admin",
                email="admin@adda.chat",
                full_name="সিস্টেম অ্যাডমিন",
                hashed_password=pwd_hash,
                bio="আড্ডা প্ল্যাটফর্ম অ্যাডমিনিস্ট্রেটর 🛡️",
                is_admin=True,
                avatar_url=None
            )
            session.add(admin_user)
            await session.commit()
            logger.info("Admin account initialized (username: admin, password: admin123)")

    yield
    logger.info("Shutting down Adda communication platform backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static media uploads mount
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_PATH), name="uploads")

# Include API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(conversations_router, prefix=settings.API_V1_STR)
app.include_router(messages_router, prefix=settings.API_V1_STR)
app.include_router(media_router, prefix=settings.API_V1_STR)
app.include_router(calls_router, prefix=settings.API_V1_STR)
app.include_router(statuses_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(friends_router, prefix=settings.API_V1_STR)
app.include_router(posts_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "service": "Adda Communication Platform Backend",
        "tagline": "স্মার্ট আলাপ, যেকোনো জায়গায়।",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
        "api": "/api"
    }

def get_system_lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

@app.get("/api/system/network-info")
async def get_network_info():
    import os
    ip = get_system_lan_ip()
    
    # Read public tunnel URL from env var or from tunnel.txt file written by cloudflared
    public_url = os.environ.get("ADDA_PUBLIC_URL", "").strip()
    if not public_url:
        candidates = [
            os.path.join(os.path.dirname(__file__), "..", "tunnel_url.txt"),
            os.path.join(os.path.dirname(__file__), "..", "..", "tunnel_url.txt"),
            os.path.abspath("tunnel_url.txt"),
            os.path.abspath(os.path.join("backend", "tunnel_url.txt")),
        ]
        for tf in candidates:
            if os.path.exists(tf):
                try:
                    with open(tf, "rb") as f:
                        raw = f.read()
                    for enc in ["utf-16", "utf-8", "latin1"]:
                        try:
                            text = raw.decode(enc).replace("\x00", "").strip()
                            if "http" in text:
                                # Extract url
                                for line in text.splitlines():
                                    line = line.strip()
                                    if line.startswith("http"):
                                        public_url = line
                                        break
                                if public_url:
                                    break
                        except Exception:
                            continue
                    if public_url:
                        break
                except Exception:
                    pass
    
    return {
        "lan_ip": ip,
        "frontend_port": 3000,
        "backend_port": 8000,
        "frontend_url": f"http://{ip}:3000",
        "backend_url": f"http://{ip}:8000",
        "public_url": public_url or None,
    }

# WebSocket Endpoint for Real-time Messaging & WebRTC Signaling
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(None)):
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user_id = payload["sub"]
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            raw_data = await websocket.receive_text()
            data = json.loads(raw_data)
            event_type = data.get("type")

            # Typing Indicators
            if event_type == "typing":
                target_user_id = data.get("target_user_id")
                conversation_id = data.get("conversation_id")
                is_typing = data.get("is_typing", False)
                if target_user_id:
                    await manager.send_to_user(target_user_id, {
                        "type": "typing",
                        "conversation_id": conversation_id,
                        "user_id": user_id,
                        "is_typing": is_typing
                    })

            # WebRTC Signaling Messages
            elif event_type in ["webrtc_offer", "webrtc_answer", "ice_candidate", "call_reject", "call_end", "call_accept"]:
                target_user_id = data.get("target_user_id")
                if target_user_id:
                    # Forward signaling message to target peer
                    await manager.send_to_user(target_user_id, {
                        "type": event_type,
                        "sender_id": user_id,
                        "payload": data.get("payload"),
                        "call_id": data.get("call_id")
                    })

            # Ping / Pong
            elif event_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))

    except WebSocketDisconnect:
        await manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await manager.disconnect(websocket)
