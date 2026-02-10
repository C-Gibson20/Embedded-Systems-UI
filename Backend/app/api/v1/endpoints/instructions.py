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
    if not FRONTEND_KEY or es_frontend_key != FRONTEND_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    paired = await pi_connection_manager.is_paired(device_id, es_pairing_secret)
    if not paired:
        raise HTTPException(status_code=403, detail="Not paired with this device.")
    
    instr = instruction_store.create_instruction(device_id, payload.job_id)

    pairs = [notes.split(": ") for notes in payload.notes]
    
    notes_dict = {
        key: value for key, value in pairs
    }

    msg = {
        "type": "apply instructions",
        "instruction_id": instr.instruction_id,
        "job_id": payload.job_id,
        "notes": notes_dict
    }
    
    ok = await pi_connection_manager.send_instructions(device_id, msg)
    if not ok:
        raise HTTPException(status_code=503, detail="Pi connection failed.")
    
    return {
        "device_id": device_id,
        "instruction_id": instr.instruction_id,
        "job_id": instr.job_id,
        "status": instr.status,
    }