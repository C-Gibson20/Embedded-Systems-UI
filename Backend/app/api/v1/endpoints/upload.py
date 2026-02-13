import os
from fastapi import APIRouter, HTTPException, UploadFile, File, Header
from app.core.job_store import jobs
from app.services.analyze_service import analyze_image
from app.core.image_store import image_store
from fastapi.concurrency import run_in_threadpool

router = APIRouter()
PI_KEY = os.environ.get("PI_KEY", "")

@router.post("/pi/upload/{job_id}")
async def upload_file(
    job_id: str,
    device_id: str,
    file: UploadFile = File(...),
    es_pi_key: str = Header(default="", alias="ES-Pi-Key")
):
    """
    Endpoint for Raspberry Pi to upload captured image for a specific job.
    Checks job validity and type, processes the image, and stores the result.
    Validates the PI key for security.  
    """
    # Validate PI key for security
    if not PI_KEY or es_pi_key != PI_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    # Fetch the current active job for this device
    job = jobs.get_job(device_id)
    if not job:
        raise HTTPException(status_code=404, detail="No active job for this device.")
    
    # Check if the job ID is the latest for this device
    # If not, reject the upload as the job has been superseded
    if not jobs.is_latest_job(device_id, job_id):
        return {"ok": False, "detail": "Job Superseded"}
    
    # Check if the uploaded file is an image
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. File must be an image.")
    
    # Mark the job as processing to prevent duplicate handling
    if not jobs.mark_processing(device_id, job_id):
        return {"ok": False, "detail": "Job Superseded"}

    # Read the uploaded image file and store it
    image_bytes = await file.read()
    image_store.set_image(job_id, file.content_type, image_bytes)

    # Process the image in a thread pool to avoid blocking the event loop and store the result or error in the job store
    try:
        result = await run_in_threadpool(analyze_image, image_bytes)
        jobs.set_result(device_id, job_id, result)
        return {"ok": True}
    except Exception as e:
        jobs.set_error(device_id, job_id, str(e))
        raise HTTPException(status_code=400, detail=str(e))
