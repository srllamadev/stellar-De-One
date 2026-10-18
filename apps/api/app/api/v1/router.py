from fastapi import APIRouter

from app.api.v1.endpoints.status import router as status_router

router = APIRouter(prefix="/api/v1")
router.include_router(status_router)
