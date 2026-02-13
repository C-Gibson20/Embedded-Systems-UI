from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Dict, Optional
import uuid
import time

@dataclass
class Instruction:
    """Data class representing an instruction sent to a device including its:
        - unique ID, 
        - associated job and device IDs, 
        - current status, 
        - creation timestamp,
        - optional result or error information.
    """
    instruction_id: str
    job_id: str
    device_id: str
    status: str # "dispatching" | "applied" | "error"
    created_at: float
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class InstructionStore:
    def __init__(self):
        """
        In-memory store for the latest instruction sent to each device.
        Each device can have at most one active instruction at a time, which is updated or replaced as new instructions are created.
        """
        self._instructions = {}

    def create_instruction(self, device_id, job_id):
        """
        Create a new instruction for a given device and job, replacing any existing instruction for that device.
        Returns the newly created instruction object.
        """
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
        """
        Retrieve the latest instruction for a given device.
        Returns None if no instruction is available.
        """
        return self._instructions.get(device_id)
    
    def is_latest_instruction(self, device_id, instruction_id):
        """]
        Check if the provided instruction ID matches the latest instruction for the specified device. 
        Returns True if it matches, False otherwise (including if no instruction exists for the device). 
        """
        instruction = self.get_instruction(device_id)
        return bool(instruction and instruction.instruction_id == instruction_id)
    
    def set_applied(self, device_id, instruction_id, message = ""):
        """
        Set the status of the instruction to "applied".
        """
        # Fetch the current instruction for the device
        instr = self.get_instruction(device_id)
        
        # Only update if the instruction exists and the ID matches
        if not instr or instr.instruction_id != instruction_id:
            return False

        # Update the instruction status and store the result message        
        instr.status = "applied"
        instr.message = message
        instr.error = None
        return True
    
    def set_error(self, device_id, instruction_id, error_message):
        """
        Set the status of the instruction to "error".
        """
        # Fetch the current instruction for the device
        instr = self.get_instruction(device_id)

        # Only update if the instruction exists and the ID matches
        if not instr or instr.instruction_id != instruction_id:
            return False
        
        # Update the instruction status and store the error message
        instr.status = "error"
        instr.error = error_message
        return True
    
    def get_instruction_payload(self, device_id):
        """
        Retrieve the payload to return for the instruction status endpoint based on the latest instruction for the specified device.
        """
        # Fetch the current instruction for the device
        instr = self.get_instruction(device_id)

        # If no instruction exists for the device, return None
        if not instr:
            return None
        
        # Construct the payload to return based on the instruction's current status and information
        payload = {
            "device_id": device_id,
            "instruction_id": instr.instruction_id,
            "job_id": instr.job_id,
            "status": instr.status
        }
        
        # Include the result or error message in the payload
        if instr.status == "applied":
            payload["message"] = instr.message
        elif instr.status == "error":
            payload["error"] = instr.error
        
        return payload
    
instruction_store = InstructionStore()