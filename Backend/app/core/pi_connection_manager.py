from __future__ import annotations
import asyncio
from fastapi import WebSocket
from dataclasses import dataclass

@dataclass
class PIConnection:
    device_id: str
    websocket: WebSocket
    device_secret: str

class PIConnectionManager:
    def __init__(self):
        self._connections = {}
        self._lock = asyncio.Lock()

    async def connect(self, device_id, websocket, device_secret):
        await websocket.accept()
        async with self._lock:
            self._connections[device_id] = PIConnection(device_id, websocket, device_secret)

    async def disconnect(self, device_id):
        async with self._lock:
            self._connections.pop(device_id, None)

    async def send_capture_command(self, device_id, job_id):
        conn = self._connections.get(device_id)
        if not conn:
            return False
        
        await conn.websocket.send_json({"type": "capture", "job_id": job_id})
        return True
    
    async def is_paired(self, device_id, pairing_secret):
        async with self._lock:
            conn = self._connections.get(device_id)
        return bool(conn and conn.device_secret == pairing_secret)
    
pi_connection_manager = PIConnectionManager()