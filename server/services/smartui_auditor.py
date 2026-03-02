import os
from typing import Dict, List, Any
from SMARTUI_RL.auditor_service import run_smart_audit
from server.config import SMARTUI_RL_DIR, UPLOAD_DIR

def run_url_audit(figma_url: str, git_repo_url: str, profile: str = "universal") -> Dict[str, Any]:
    """
    Orchestrates the UI audit for Figma and Git URLs.
    
    1. Resolves Figma URL to an image path (uses test image for now).
    2. Runs the SMARTUI_RL AI pipeline.
    3. Transforms output for the frontend.
    """
    
    # --- STEP 1: RESOLVE FIGMA URL ---
    # NOTE: Real Figma integration requiring a Personal Access Token is pending.
    # For now, we use a test image to demonstrate the AI pipeline flow.
    image_path = str(SMARTUI_RL_DIR / "test1.png")
    
    if not os.path.exists(image_path):
        # Fallback to test1.jpg if png doesn't exist
        image_path = str(SMARTUI_RL_DIR / "test1.jpg")

    # --- STEP 2: RUN AI AUDIT ---
    print(f"🚀 Starting AI Audit for: {figma_url}")
    raw_result = run_smart_audit(image_path, profile)

    if "error" in raw_result:
        return raw_result

    # --- STEP 3: TRANSFORM FOR FRONTEND ---
    # Map AI issues to a format compatible with VioletRulesPage
    transformed_violations = []
    
    # We can also include some standard heuristics that passed
    # For now, let's just focus on the real findings from the AI
    
    for i, element in enumerate(raw_result.get("elements", [])):
        for j, issue in enumerate(element.get("issues", [])):
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

    # If no violations found, maybe add some "Pass" markers for standard rules
    if not transformed_violations:
        # Dummy pass rules so the page isn't totally empty if everything is perfect
        pass
        
    final_response = {
        "meta": {
            **raw_result.get("meta", {}),
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
