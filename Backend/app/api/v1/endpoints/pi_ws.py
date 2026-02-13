import os
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core.pi_connection_manager import pi_connection_manager
from app.core.instruction_store import instruction_store
from app.core.sensor_store import sensor_store, SensorValue

def parse_sensor(data):
    """
    Parse sensor data from the Pi, validating and normalizing values.
    """
    # Default to "loading" status if not provided, and extract value and message
    status = data.get("status", "loading")
    value = data.get("value")
    message = data.get("message")

    # For "ok" status, attempt to parse the value as a float.
    if status == "ok":
        try:
            value = float(value)
        except Exception:
            return SensorValue(status="error", message="Invalid value format")
        
        value = max(0, min(100, value))
        return SensorValue(status="ok", value=value)
    
    # For "error" status, return the error message if provided, otherwise a default message.
    elif status == "error":
        return SensorValue(status="error", message=message or "Sensor error")
    
    return SensorValue(status="loading")

router = APIRouter()
PI_KEY = os.environ.get("PI_KEY", "")

@router.websocket("/ws/pi")
async def pi_ws(
    websocket: WebSocket,
    device_id: str = Query(...),
    es_pi_key: str = Query(...),
    device_secret: str = Query(...)
):
    """
    WebSocket endpoint for Raspberry Pi devices to connect and receive instructions.
    Also handles incoming messages about instruction application status and sensor updates.
    Validates a secret key for security and manages the connection lifecycle.
    """
    # Validate the PI key for security before accepting the connection
    if not PI_KEY or es_pi_key != PI_KEY:
        await websocket.close(code=1008)
        return
    
    await pi_connection_manager.connect(device_id, websocket, device_secret)

    # Main loop to receive and process messages from the Pi
    try:
        while True:
            text = await websocket.receive_text()
            try:
                msg = json.loads(text)
            except Exception:
                continue

            # Handle messages about instruction application status
            if msg.get("type") == "instructions applied":
                instruction_id = msg.get("instruction_id")
                ok = bool(msg.get("ok", True))
                message = msg.get("message")

                # Set status based on instruction application result
                if instruction_id and ok:
                    instruction_store.set_applied(device_id, instruction_id, message)
                elif instruction_id and not ok:
                    instruction_store.set_error(device_id, instruction_id, message)

            # Handle messages about sensor updates
            elif msg.get("type") == "sensor_update":
                water = msg.get("water") or {"status": "loading"}
                light = msg.get("light") or {"status": "loading"}

                # Parse and store the latest sensor values for this device
                sensor_store.set_latest(
                    device_id=device_id,
                    water=parse_sensor(water),
                    light=parse_sensor(light)
                )

    # Handle WebSocket disconnection and ensure cleanup of the connection manager state
    except WebSocketDisconnect:
        pass
    finally:
        await pi_connection_manager.disconnect(device_id)