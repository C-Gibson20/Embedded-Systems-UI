import os
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Header
from app.core.pi_connection_manager import pi_connection_manager
from app.core.instruction_store import instruction_store

router = APIRouter()

FRONTEND_KEY = os.getenv("FRONTEND_KEY", "")

class InstructionPayload(BaseModel):
    job_id: str
    notes: list[str]

@ router.post("/instructions")
async def dispatch_instructions(
    device_id: str, 
    payload: InstructionPayload,
    es_frontend_key: str = Header(default="", alias="ES-Frontend-Key"),
    es_pairing_secret: str = Header(default="", alias="ES-Pairing-Secret")                         
):
    """
    Queue and send configuration instructions to a specified paired device. 
    Validates frontend key and pairing secret for security.
    """
    # Validate frontend key for security
    if not FRONTEND_KEY or es_frontend_key != FRONTEND_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    # Device-specific pairing validation
    paired = await pi_connection_manager.is_paired(device_id, es_pairing_secret)
    if not paired:
        raise HTTPException(status_code=403, detail="Not paired with this device.")
    
    # Create a new instruction entry in the store for this device and job
    instr = instruction_store.create_instruction(device_id, payload.job_id)

    # Convert notes list to a dictionary for easier parsing on the Pi side
    pairs = [note.split(": ", 1) for note in payload.notes if ": " in note]
    
    notes_dict = {
        key: value for key, value in pairs
    }

    # Construct the message to send to the Pi, including instruction ID, job ID, and notes
    msg = {
        "type": "apply instructions",
        "instruction_id": instr.instruction_id,
        "job_id": payload.job_id,
        "notes": notes_dict
    }
    
    # Send the instructions to the Pi and handle connection errors
    ok = await pi_connection_manager.send_instructions(device_id, msg)
    if not ok:
        raise HTTPException(status_code=503, detail="Pi connection failed.")
    
    # Return the instruction status and identifiers for tracking
    return {
        "device_id": device_id,
        "instruction_id": instr.instruction_id,
        "job_id": instr.job_id,
        "status": instr.status,
    }