from fastapi import APIRouter, HTTPException
from server.schemas.url_audit import UrlAuditRequest, UrlAuditResponse
from server.services.smartui_auditor import run_url_audit

router = APIRouter(prefix="/audit/url", tags=["audit"])

@router.post("", response_model=UrlAuditResponse, summary="Audit UI via Figma and Git URLs")
def audit_url(request: UrlAuditRequest):
    """
    Accepts Figma and Git URLs, runs the SMARTUI_RL AI audit, 
    and returns a structured violation report.
    """
    try:
        result = run_url_audit(
            figma_url=request.figma_url,
            git_repo_url=request.git_repo_url,
            profile=request.profile
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
            
        return result
    except Exception as e:
        print(f"Server Error during URL audit: {e}")
        raise HTTPException(status_code=500, detail=str(e))
