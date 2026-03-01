import os
import uuid
import shutil

from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse

from server.config import UPLOAD_DIR
from server.services.auditor import run_audit

router = APIRouter(prefix="/audit", tags=["audit"])


@router.post("", summary="Audit a UI screenshot")
async def audit_ui(file: UploadFile = File(...)):
    """
    Upload a UI screenshot and receive a JSON audit report containing:
    - Per-component similarity scores against the expert style library
    - An overall score and grade
    - A link to the annotated report image
    """
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1] if file.filename else ".png"
    input_path = os.path.join(str(UPLOAD_DIR), f"{file_id}{file_ext}")

    with open(input_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    result = run_audit(input_path)
    return JSONResponse(content=result)


@router.get("/report/{report_id}", summary="Get annotated report image")
async def get_report_image(report_id: str):
    """Download the annotated audit report image for a given report ID."""
    report_path = os.path.join(str(UPLOAD_DIR), f"{report_id}_report.jpg")

    if os.path.exists(report_path):
        return FileResponse(report_path, media_type="image/jpeg")

    return JSONResponse(
        status_code=404, content={"error": "Report not found"}
    )
