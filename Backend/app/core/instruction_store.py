from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Dict, Optional
import uuid
import time

@dataclass
class Instruction:
    instruction_id: str
    job_id: str
    device_id: str
    status: str # "dispatching" | "applied" | "error"
    created_at: float
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class InstructionStore:
    def __init__(self):
        self._instructions = {}

    def create_instruction(self, device_id, job_id):
        instruction = Instruction(
            instruction_id=uuid.uuid4().hex,
            job_id=job_id,
            device_id=device_id,
            status="dispatching",
            created_at=time.time()
        )
        self._instructions[device_id] = instruction
        return instruction
    
    def get_instruction(self, device_id):
        return self._instructions.get(device_id)
    
    def is_latest_instruction(self, device_id, instruction_id):
        instruction = self.get_instruction(device_id)
        return bool(instruction and instruction.instruction_id == instruction_id)
    
    def set_applied(self, device_id, instruction_id, message = ""):
        instr = self.get_instruction(device_id)
        if not instr or instr.instruction_id != instruction_id:
            return False
        instr.status = "applied"
        instr.message = message
        instr.error = None
        return True
    
    def set_error(self, device_id, instruction_id, error_message):
        instr = self.get_instruction(device_id)
        if not instr or instr.instruction_id != instruction_id:
            return False
        instr.status = "error"
        instr.error = error_message
        return True
    
    def get_instruction_payload(self, device_id):
        instr = self.get_instruction(device_id)
        if not instr:
            return None
        
        payload = {
            "device_id": device_id,
            "instruction_id": instr.instruction_id,
            "job_id": instr.job_id,
            "status": instr.status
        }
        
        if instr.status == "applied":
            payload["message"] = instr.message
        elif instr.status == "error":
            payload["error"] = instr.error
        
        return payload
    
instruction_store = InstructionStore()