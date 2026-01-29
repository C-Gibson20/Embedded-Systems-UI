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
        old = None
        async with self._lock:
            old = self._connections.get(device_id)
            self._connections[device_id] = PIConnection(device_id, websocket, device_secret)
        if old:
            try:
                await old.websocket.close()
            except Exception:
                pass
            
    async def disconnect(self, device_id):
        async with self._lock:
            self._connections.pop(device_id, None)

    async def send_capture_command(self, device_id, job_id):
        conn = await self._get_connection(device_id)
        if not conn:
            return False
        
        try:
            await conn.websocket.send_json({"type": "capture", "job_id": job_id})
            return True
        except Exception:
            return False    
    
    async def send_instructions(self, device_id, instructions):
        conn = await self._get_connection(device_id)
        if not conn:
            return False
        
        try:
            await conn.websocket.send_json(instructions)
            return True
        except Exception:
            return False
    
    async def is_paired(self, device_id, pairing_secret):
        async with self._lock:
            conn = self._connections.get(device_id)
        return bool(conn and conn.device_secret == pairing_secret)
    
    async def _get_connection(self, device_id):
        async with self._lock:
            return self._connections.get(device_id)

pi_connection_manager = PIConnectionManager()