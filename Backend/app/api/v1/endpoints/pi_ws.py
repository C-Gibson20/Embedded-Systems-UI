import os
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core.pi_connection_manager import pi_connection_manager

router = APIRouter()
PI_KEY = os.environ.get("PI_KEY", "")

@router.websocket("/ws/pi")
async def pi_ws(
    websocket: WebSocket,
    device_id: str = Query(...),
    es_pi_key: str = Query(...),
    device_secret: str = Query(...)
):
    if not PI_KEY or es_pi_key != PI_KEY:
        await websocket.close(code=1008)
        return
    
    await pi_connection_manager.connect(device_id, websocket, device_secret)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await pi_connection_manager.disconnect(device_id)