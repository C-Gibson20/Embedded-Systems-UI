import os
from fastapi import APIRouter, HTTPException, Header
from app.core.job_store import jobs
from app.core.pi_connection_manager import pi_connection_manager

router = APIRouter()
FRONTEND_KEY = os.environ.get("FRONTEND_KEY", "")

@router.post("/capture")
async def start_capture(
    device_id: str,
    es_frontend_key: str = Header(default="", alias="ES-Frontend-Key"),
    es_pairing_secret: str = Header(default="", alias="ES-Pairing-Secret")
):
    """
    Initiate a remote image capture on a paired Raspberry Pi device, returning a job ID for tracking.
    """
    # Validate frontend key for security
    if not FRONTEND_KEY or es_frontend_key != FRONTEND_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    # Device-specific pairing validation
    paired = await pi_connection_manager.is_paired(device_id, es_pairing_secret)
    if not paired:
        raise HTTPException(status_code=403, detail="Not paired with this device.")

    # Create trackable job for this capture request
    job = jobs.create_job(device_id)

    # Send capture command to the Pi and handle connection errors
    ok = await pi_connection_manager.send_capture_command(device_id, job.job_id)
    if not ok:
        jobs.set_error(device_id, job.job_id, "Pi connection failed.")
        raise HTTPException(status_code=503, detail="Pi connection failed.")
    
    return {"job_id": job.job_id} 