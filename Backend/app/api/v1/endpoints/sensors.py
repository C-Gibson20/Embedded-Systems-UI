import os
from fastapi import APIRouter, Header, HTTPException
from app.core.sensor_store import sensor_store
from app.core.pi_connection_manager import pi_connection_manager

router = APIRouter()
FRONTEND_KEY = os.environ.get("FRONTEND_KEY", "")

@router.get("/sensors/{device_id}")
async def get_sensors(
    device_id: str,
    es_frontend_key: str = Header(default="", alias="ES-Frontend-Key"),
    es_pairing_secret: str = Header(default="", alias="ES-Pairing-Secret")
):
    """
    Get the latest sensor readings for a specified device. 
    Returns "loading" status if no readings are available yet.
    Validates frontend key and pairing secret for security.
    """
    # Validate frontend key for security
    if not FRONTEND_KEY or es_frontend_key != FRONTEND_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    # Device-specific pairing validation
    paired = await pi_connection_manager.is_paired(device_id, es_pairing_secret)
    if not paired:
        raise HTTPException(status_code=403, detail="Device not paired.")
    
    # Fetch the latest sensor reading for this device from the store, returning loading status if not available
    reading = sensor_store.get_latest(device_id)
    if not reading:
        return {
            "device_id": device_id,
            "water": {"status": "loading"},
            "light": {"status": "loading"}
        }
    return reading.to_dict()