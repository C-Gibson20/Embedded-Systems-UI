from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.analysis import AnalysisResult
from app.services.analyze_service import analyze_image

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResult)
async def analyze(file: UploadFile = File(...)):
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = await file.read()

    try:
        return analyze_image(image_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
