from fastapi import APIRouter, HTTPException
from app.core.job_store import jobs

router = APIRouter()

@router.get("/result/{device_id}")
def get_result(device_id: str):
    job = jobs.get_job(device_id)
    if not job:
        raise HTTPException(status_code=404, detail="No job found for this device.")
    
    payload = {"job_id": job.job_id, "status": job.status}

    if job.status == "completed":
        payload["result"] = job.result
    elif job.status == "error":
        payload["error"] = job.error
    return payload