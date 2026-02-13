from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.analysis import AnalysisResult
from app.services.analyze_service import analyze_image

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResult)
async def analyze(file: UploadFile = File(...)):
    """
    Validate and process plant image for automated analysis and identification.
    """
    # Reject non-image files before processing
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = await file.read()

    try:
        # Service call to trigger ML inference and return analysis results
        return analyze_image(image_bytes)
    except Exception as e:
        # Catch processing errors
        raise HTTPException(status_code=400, detail=str(e))
