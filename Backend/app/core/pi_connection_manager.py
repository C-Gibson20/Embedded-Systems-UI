from __future__ import annotations
import asyncio
from fastapi import WebSocket
from dataclasses import dataclass

@dataclass
class PIConnection:
    """
    Data class representing an active WebSocket connection from a device, including:
        - device_id: the unique identifier of the device,
        - websocket: the active WebSocket connection object for communication,
        - device_secret: the secret used for pairing and authentication with the device.
    """
    device_id: str
    websocket: WebSocket
    device_secret: str

class PIConnectionManager:
    def __init__(self):
        """
        Manager for active WebSocket connections from devices.
        """
        self._connections = {}
        self._lock = asyncio.Lock()

    async def connect(self, device_id, websocket, device_secret):
        """
        Accept a new WebSocket connection from a device, replacing any existing connection for the same device ID.
        """
        # Accept the WebSocket connection
        await websocket.accept()
        old = None

        # Store the new connection, replacing any existing connection for the same device ID
        async with self._lock:
            old = self._connections.get(device_id)
            self._connections[device_id] = PIConnection(device_id, websocket, device_secret)

        # If there was an old connection for the same device ID, attempt to close it to free up resources and avoid conflicts
        if old:
            try:
                await old.websocket.close()
            except Exception:
                pass
            
    async def disconnect(self, device_id):
        """ 
        Remove the WebSocket connection for a device when it disconnects, ensuring cleanup of the connection manager state. 
        """
        async with self._lock:
            self._connections.pop(device_id, None)

    async def send_capture_command(self, device_id, job_id):
        """ 
        Send a capture command to the specified device with the associated job ID.
        Returns True if successful and False if the connection fails. 
        """
        # Fetch the active connection for the specified device ID
        conn = await self._get_connection(device_id)
        if not conn:
            return False
        
        # Attempt to send the capture command to the device via the WebSocket connection
        try:
            await conn.websocket.send_json({"type": "capture", "job_id": job_id})
            return True
        # Handle any exceptions that may occur during communication
        except Exception:
            return False    
    
    async def send_instructions(self, device_id, instructions):
        """ 
        Send a instructions to the specified device with the associated job ID.
        Returns True if successful and False if the connection fails. 
        """
        # Fetch the active connection for the specified device ID
        conn = await self._get_connection(device_id)
        if not conn:
            return False
        
        # Attempt to send the instructions to the device via the WebSocket connection
        try:
            await conn.websocket.send_json(instructions)
            return True
        # Handle any exceptions that may occur during communication
        except Exception:
            return False
    
    async def is_paired(self, device_id, pairing_secret):
        """ 
        Check if the specified device ID is currently paired with a connection that has the matching pairing secret. 
        Returns True if paired and False otherwise. 
        """    
        async with self._lock:
            conn = self._connections.get(device_id)
        return bool(conn and conn.device_secret == pairing_secret)
    
    async def _get_connection(self, device_id):
        """ 
        Internal helper method to fetch the active connection for a specified device ID. 
        Returns the PIConnection object if found, or None if no active connection exists for the device ID. 
        """
        async with self._lock:
            return self._connections.get(device_id)

pi_connection_manager = PIConnectionManager()