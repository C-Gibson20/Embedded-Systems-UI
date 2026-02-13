import os
from fastapi import Header, HTTPException, APIRouter
from app.core.pi_connection_manager import pi_connection_manager

FRONTEND_KEY = os.environ.get("FRONTEND_KEY", "")

router = APIRouter()

@router.get("/device/status/{device_id}")
async def get_device_status(
    device_id: str,
    es_frontend_key: str = Header(default="", alias="ES-Frontend-Key"),
    es_pairing_secret: str = Header(default="", alias="ES-Pairing-Secret"),
):
    """
    Check if specified device is paired and return its status. 
    Requires valid frontend key and pairing secret for security.
    """
    # Validate frontend key for security
    if not FRONTEND_KEY or es_frontend_key != FRONTEND_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Check connection manager for active socket and matching secret
    paired = await pi_connection_manager.is_paired(device_id, es_pairing_secret)

    return {
        "device_id": device_id,
        "paired": paired
    }
