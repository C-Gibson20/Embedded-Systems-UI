from __future__ import annotations
import asyncio
from typing import Dict, Optional
from fastapi import WebSocket

class PIConnectionManager:
    def __init__(self):
        self._connections = {}
        self._lock = asyncio.Lock()

    async def connect(self, device_id, websocket):
        await websocket.accept()
        async with self._lock:
            self._connections[device_id] = websocket

    async def disconnect(self, device_id):
        async with self._lock:
            self._connections.pop(device_id, None)

    async def send_capture_command(self, device_id, job_id):
        async with self._lock:
            ws = self._connections.get(device_id)

        if not ws:
            return False
        
        await ws.send_json({"type": "capture", "job_id": job_id})
        return True
    
pi_connection_manager = PIConnectionManager()