from fastapi import APIRouter, HTTPException
from app.core.job_store import jobs

router = APIRouter()

@router.get("/result/{device_id}")
def get_result(device_id: str):
    payload = jobs.get_job_payload(device_id)
    if not payload:
        raise HTTPException(status_code=404, detail="No job found for this device.")
    
    return payload