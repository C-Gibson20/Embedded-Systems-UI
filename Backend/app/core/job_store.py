from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Dict, Optional
import uuid
import time

@dataclass
class Job:
    """Data class representing a job created for a device, including its:
        - unique job ID, 
        - associated device ID, 
        - current status, 
        - creation timestamp,
        - optional result or error information.
    """
    job_id: str
    device_id: str
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
            device_id=device_id,
            status="capturing",
            created_at=time.time()
        )
        self._jobs[device_id] = job
        return job
    
    def get_job(self, device_id):
        return self._jobs.get(device_id)
    
    def is_latest_job(self, device_id, job_id):
        job = self.get_job(device_id)
        return bool(job and job.job_id == job_id)
    
    def mark_processing(self, device_id, job_id):
        job = self.get_job(device_id)
        if not job or job.job_id != job_id:
            return False
        job.status = "processing"
        return True
    
    def set_result(self, device_id, job_id, result):
        job = self.get_job(device_id)
        if not job or job.job_id != job_id:
            return False
        job.status = "completed"
        job.result = result
        job.error = None
        return True
    
    def set_error(self, device_id, job_id, error_message):
        job = self.get_job(device_id)
        if not job or job.job_id != job_id:
            return False
        job.status = "error"
        job.error = error_message
        return True
    
    def get_job_payload(self, device_id):
        job = self.get_job(device_id)
        if not job:
            return None
        
        payload = {
            "device_id": device_id,
            "job_id": job.job_id,
            "status": job.status
        }
        
        if job.status == "completed":
            payload["result"] = job.result
        elif job.status == "error":
            payload["error"] = job.error
        
        return payload
    
jobs = JobStore()