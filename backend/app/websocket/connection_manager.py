import json
import asyncio
from datetime import datetime, timezone
from typing import Dict, Set, Any
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Maps user_id -> Set of active WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Maps websocket -> user_id
        self.ws_to_user: Dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        self.ws_to_user[websocket] = user_id
        
        # Broadcast online status to all
        await self.broadcast({
            "type": "presence",
            "event": "user_online",
            "user_id": user_id,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }, exclude_user=user_id)

    async def disconnect(self, websocket: WebSocket):
        user_id = self.ws_to_user.get(websocket)
        if user_id and user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                # Broadcast offline status
                await self.broadcast({
                    "type": "presence",
                    "event": "user_offline",
                    "user_id": user_id,
                    "last_seen": datetime.now(timezone.utc).isoformat()
                })
        if websocket in self.ws_to_user:
            del self.ws_to_user[websocket]

    def is_user_online(self, user_id: str) -> bool:
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0

    def get_online_users(self) -> list[str]:
        return list(self.active_connections.keys())

    async def send_to_user(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            closed_sockets = set()
            payload = json.dumps(message)
            for ws in self.active_connections[user_id]:
                try:
                    await ws.send_text(payload)
                except Exception:
                    closed_sockets.add(ws)
            for ws in closed_sockets:
                self.active_connections[user_id].discard(ws)

    async def broadcast_to_users(self, user_ids: list[str], message: dict, exclude_user: str = None):
        targets = [uid for uid in user_ids if uid != exclude_user and uid in self.active_connections]
        if targets:
            await asyncio.gather(*[self.send_to_user(uid, message) for uid in targets], return_exceptions=True)

    async def broadcast(self, message: dict, exclude_user: str = None):
        payload = json.dumps(message)
        for user_id, sockets in list(self.active_connections.items()):
            if user_id == exclude_user:
                continue
            for ws in list(sockets):
                try:
                    await ws.send_text(payload)
                except Exception:
                    pass

manager = ConnectionManager()
