from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from app.core.image_store import image_store

router = APIRouter()

@router.get("/pi/stored_image/{job_id}")
def get_stored_image(job_id: str):
    img = image_store.get_image(job_id)
    if not img:
        raise HTTPException(status_code=404, detail="No image found for this job.")
    
    return Response(content=img.data, media_type=img.content_type)