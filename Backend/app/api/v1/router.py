from fastapi import APIRouter
from app.api.v1.endpoints import health, analyze, upload, capture, result, stored_image, pi_ws

router = APIRouter()

router.include_router(analyze.router, tags=["analysis"])
router.include_router(health.router, tags=["health"])

router.include_router(capture.router, tags=["capture"])
router.include_router(result.router, tags=["result"])
router.include_router(upload.router, tags=["pi"])
router.include_router(pi_ws.router, tags=["pi-ws"])
router.include_router(stored_image.router, tags=["pi-image"])