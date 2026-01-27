from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Dict, List, Optional
import uuid
import time

@dataclass
class Job:
    job_id: str
    status: str # "capturing" | "processing" | "completed" | "error"
    created_at: float
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class JobStore:
    def __init__(self):
        self._jobs = {}

    def create_job(self, device_id):
        job = Job(
            job_id=uuid.uuid4().hex,
            status="capturing",
            created_at=time.time()
        )
        self._jobs[device_id] = job
        return job
    
    def get_job(self, device_id):
        return self._jobs.get(device_id)
    
    def mark_processing(self, device_id):
        job = self.get_job(device_id)
        if job:
            job.status = "processing"
            return True
        return False
    
    def set_result(self, device_id, result):
        job = self.get_job(device_id)
        if job:
            job.status = "completed"
            job.result = result
            job.error = None
            return True
        return False
    
    def set_error(self, device_id, error_message):
        job = self.get_job(device_id)
        if job:
            job.status = "error"
            job.error = error_message
            return True
        return False
    
jobs = JobStore()