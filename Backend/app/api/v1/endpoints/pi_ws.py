import os
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core.pi_connection_manager import pi_connection_manager
from app.core.instruction_store import instruction_store

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
            text = await websocket.receive_text()
            try:
                msg = json.loads(text)
            except Exception:
                continue

            if msg.get("type") == "instructions applied":
                instruction_id = msg.get("instruction_id")
                ok = bool(msg.get("ok", True))
                message = msg.get("message")

                if instruction_id and ok:
                    instruction_store.set_applied(device_id, instruction_id, message)
                elif instruction_id and not ok:
                    instruction_store.set_error(device_id, instruction_id, message)

    except WebSocketDisconnect:
        pass
    finally:
        await pi_connection_manager.disconnect(device_id)