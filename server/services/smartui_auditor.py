import os
from typing import Dict, List, Any
from SMARTUI_RL.auditor_service import run_smart_audit
from server.config import SMARTUI_RL_DIR, UPLOAD_DIR

def run_url_audit(figma_url: str, git_repo_url: str, profile: str = "universal") -> Dict[str, Any]:
    """
    Orchestrates the UI audit for Figma and Git URLs.
    """
    # --- STEP 1: RESOLVE FIGMA URL ---
    image_path = str(SMARTUI_RL_DIR / "test1.png")
    if not os.path.exists(image_path):
        image_path = str(SMARTUI_RL_DIR / "test1.jpg")

    # --- STEP 2: RUN AI AUDIT ---
    print(f"🤖 Calling SMARTUI_RL Model Pipeline...")
    raw_result = run_smart_audit(image_path, profile)

    if "error" in raw_result:
        print(f"❌ AI Model Error: {raw_result['error']}")
        return raw_result

    return _transform_audit_result(raw_result, profile, figma_url, git_repo_url)

def run_smart_image_audit(image_path: str, profile: str = "universal") -> Dict[str, Any]:
    """
    Runs the AI audit pipeline on an uploaded image file.
    """
    print(f"🤖 Calling SMARTUI_RL Model for uploaded image...")
    raw_result = run_smart_audit(image_path, profile)

    if "error" in raw_result:
        print(f"❌ AI Model Error: {raw_result['error']}")
        return raw_result

    return _transform_audit_result(raw_result, profile)

def _transform_audit_result(raw_result: Dict[str, Any], profile: str, figma_url: str = None, git_repo_url: str = None) -> Dict[str, Any]:
    """Common logic to transform raw AI model output for the frontend."""
    transformed_violations = []
    
    for element in raw_result.get("elements", []):
        for issue in element.get("issues", []):
            transformed_violations.append({
                "id": len(transformed_violations) + 1,
                "rule": issue.get("rule", "Unknown"),
                "title": _map_rule_to_title(issue.get("rule")),
                "description": issue.get("desc", ""),
                "violated": True,
                "element_info": {
                    "type": element.get("cls_id"),
                    "bbox": element.get("bbox"),
                    "content": element.get("content")
                }
            })

    final_response = {
        "meta": {
            **raw_result.get("meta", {}),
            "profile": profile,
            "figma_url": figma_url,
            "git_repo_url": git_repo_url
        },
        "summary": raw_result.get("summary", {}),
        "violations": transformed_violations,
        "elements": raw_result.get("elements", []),
        "llm_analysis": raw_result.get("llm_analysis")
    }

    return final_response

def _map_rule_to_title(rule_name: str) -> str:
    """Maps internal rule names to user-friendly titles."""
    mapping = {
        "min_button_height": "Button Size Check",
        "min_field_height": "Input Field Accessibility",
        "contrast_ratio": "Contrast Ratio Check",
        "max_misalignment": "Alignment Accuracy",
        "visual_hierarchy": "Visual Hierarchy"
    }
    return mapping.get(rule_name, rule_name.replace("_", " ").title())
