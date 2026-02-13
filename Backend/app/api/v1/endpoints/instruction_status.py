import os
from fastapi import APIRouter, Header, HTTPException
from app.core.instruction_store import instruction_store
from app.core.pi_connection_manager import pi_connection_manager

router = APIRouter()

FRONTEND_KEY = os.getenv("FRONTEND_KEY", "")

@router.get("/instructions/status/{device_id}")
async def get_instruction_status(
    device_id: str,
    instruction_id: str,
    es_frontend_key: str = Header(default="", alias="ES-Frontend-Key"),
    es_pairing_secret: str = Header(default="", alias="ES-Pairing-Secret")
):
    """
    Retrieve the execution status or payload of a specific instruction for a paired device.
    Ensures security through frontend key and pairing secret validation.
    """
    # Validate frontend key for security
    if not FRONTEND_KEY or es_frontend_key != FRONTEND_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    # Device-specific pairing validation
    paired = await pi_connection_manager.is_paired(device_id, es_pairing_secret)
    if not paired:
        raise HTTPException(status_code=403, detail="Not paired with this device.")
    
    # Fetch current instruction state from store
    payload = instruction_store.get_instruction_payload(device_id)
    if not payload:
        raise HTTPException(status_code=404, detail="No instructions found for this device.")
    
    # Ensure the instruction ID matches the latest instruction for this device
    if payload["instruction_id"] != instruction_id:
        raise HTTPException(status_code=409, detail="Instruction ID does not match the latest instruction.")

    return payload

