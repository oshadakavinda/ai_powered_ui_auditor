from pydantic import BaseModel, Field
from typing import List, Optional, Any

class UrlAuditRequest(BaseModel):
    """Request schema for auditing UI from Figma and Git URLs."""
    figma_url: str = Field(..., description="Link to the Figma design file")
    git_repo_url: str = Field(..., description="Link to the Git repository")
    profile: str = Field("universal", description="Rule profile to use (e.g. apple, healthcare, etc.)")

class ViolationItem(BaseModel):
    """Schema for a single rule violation."""
    id: int
    rule: str
    title: str
    description: str
    violated: bool
    element_info: Optional[dict] = None

class UrlAuditResponse(BaseModel):
    """Unified response schema for the URL-based audit."""
    meta: dict = Field(..., description="Metadata about the audit run")
    summary: dict = Field(..., description="High-level summary (score, total violations)")
    violations: List[ViolationItem] = Field(..., description="List of detected rule violations")
    elements: List[dict] = Field(..., description="Raw data for all detected UI elements")
    llm_analysis: Optional[str] = Field(None, description="Narrative analysis from TinyLlama LLM")
