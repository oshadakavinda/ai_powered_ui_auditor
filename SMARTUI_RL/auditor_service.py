import os
import sys

# --- PROTECT AGAINST SEGFAULTS ON MACOS ---
# These MUST be set before importing torch or cv2
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"

import cv2
import torch
# Disable OpenCV multi-threading which often conflicts with Torch/OpenMP
cv2.setNumThreads(0)
torch.set_num_threads(1)

import numpy as np
from ultralytics import YOLO, settings
from ctransformers import AutoModelForCausalLM
from SMARTUI_RL.rule_engine import RuleEngine
from SMARTUI_RL.audit_utils import analyze_element_content, _get_reader

# --- STABILITY SETTINGS ---
# Prevent OpenMP and Threading conflicts on macOS
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["OMP_NUM_THREADS"] = "1"
torch.set_num_threads(1)

# Disable Ultralytics telemetry and updates to prevent blocking
try:
    settings.update({'sync': False, 'uuid': '0', 'api_key': ''})
except Exception as e:
    print(f"⚠️ Could not update all Ultralytics settings: {e}")

# --- GLOBAL MODELS (Singletons) ---
models = {
    "vision": None,
    "llm": None,
    "engine": None
}

# Pre-resolve paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "ui_model.pt")
LLM_PATH = os.path.join(BASE_DIR, "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf")
EXCEL_PATH = os.path.join(BASE_DIR, "UI_RULE_SETS.xlsx")

def get_vision_model():
    """Lazy loader for YOLOv5."""
    if models["vision"] is None:
        print(f"📥 Loading Vision Model: {MODEL_PATH}...")
        # Force CPU and single thread for stability
        models["vision"] = YOLO(MODEL_PATH)
    return models["vision"]

def get_llm():
    """Lazy loader for TinyLlama."""
    if models["llm"] is None:
        print(f"📥 Loading LLM Model: {LLM_PATH}...")
        models["llm"] = AutoModelForCausalLM.from_pretrained(
            "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF",
            model_file=LLM_PATH,
            model_type="llama",
            threads=1, # Safer for background threads
            gpu_layers=0
        )
    return models["llm"]

def get_engine():
    """Lazy loader for Rule Engine."""
    if models["engine"] is None:
        print(f"📥 Loading Rule Engine: {EXCEL_PATH}...")
        models["engine"] = RuleEngine(excel_file=EXCEL_PATH)
    return models["engine"]

def run_smart_audit(image_path: str, profile: str = "universal") -> dict:
    """
    Runs the full SMARTUI_RL audit pipeline on a single image.
    1. YOLO element detection
    2. Deep inspection (OCR, Colors, Contrast)
    3. Rule engine check
    4. LLM consultation
    """
    engine = get_engine()
    vision_model = get_vision_model()

    if not vision_model:
        return {"error": "Vision model could not be initialized"}

    # Load profile rules
    engine.load_rules(profile)
    MIN_BTN = engine.get("min_button_height")
    MIN_FIELD = engine.get("min_field_height")

    # 1. Vision Detection
    if not os.path.exists(image_path):
        return {"error": f"Image file not found at: {image_path}"}
        
    print(f"👁️ Running YOLO Detection on: {image_path}...")
    try:
        # Simplest possible call, forcing CPU
        results = vision_model(image_path, conf=0.15, verbose=False, device='cpu')
        num_boxes = len(results[0].boxes) if results else 0
        print(f"✅ Detection complete. Found {num_boxes} elements.")
    except Exception as e:
        print(f"❌ YOLO Inference Error: {e}")
        return {"error": f"YOLO Inference failed: {str(e)}"}

    if not results or len(results[0].boxes) == 0:
        return {"summary": {"score": 100, "violations": 0}, "elements": [], "message": "No UI elements detected."}

    # Load Image for Color Analysis
    original_img = cv2.imread(image_path)
    if original_img is None:
        return {"error": f"Could not read image at {image_path}"}

    boxes = results[0].boxes.xyxy.cpu().numpy()
    classes = results[0].boxes.cls.cpu().numpy()
    
    stats = {"violations_list": [], "total": len(boxes)}
    elements = []

    print(f"🔍 Analyzing {len(boxes)} elements with deep inspection...")

    for i, box in enumerate(boxes):
        print(f"   [{i+1}/{len(boxes)}] Analyzing element at {box}...")
        cls_id = int(classes[i])
        x1, y1, x2, y2 = map(int, box)
        height = y2 - y1
        
        # --- Deep Inspection ---
        h_img, w_img = original_img.shape[:2]
        crop = original_img[max(0, y1):min(h_img, y2), max(0, x1):min(w_img, x2)]
        
        element_data = {"text": "Unknown", "contrast": None}
        if crop.size > 0:
            element_data = analyze_element_content(crop)
        
        text_found = element_data.get("text", "Unknown")
        contrast = element_data.get("contrast")
        
        issues = []
        status = "PASS"

        # --- Rule Checks ---
        # 1. Size Check
        if cls_id == 0: # Button
            if height < MIN_BTN:
                desc = f"Button '{text_found}' is too small ({height}px vs {MIN_BTN}px)."
                issues.append({"rule": "min_button_height", "desc": desc})
                stats["violations_list"].append(desc)
                status = "FAIL"
            
            # 2. Contrast Check
            if contrast and contrast < 4.5:
                desc = f"Accessibility: Button '{text_found}' has low contrast ({contrast}:1). Hard to read."
                issues.append({"rule": "contrast_ratio", "desc": desc})
                stats["violations_list"].append(desc)
                status = "FAIL"
        
        elif cls_id == 2: # Field/Input
            if height < MIN_FIELD:
                desc = f"Input '{text_found}' is too small ({height}px vs {MIN_FIELD}px)."
                issues.append({"rule": "min_field_height", "desc": desc})
                stats["violations_list"].append(desc)
                status = "FAIL"

        elements.append({
            "id": i,
            "type": "detected_object",
            "cls_id": cls_id,
            "bbox": [x1, y1, x2, y2],
            "content": element_data,
            "issues": issues,
            "status": status
        })

    # Summary Text for LLM
    num_violations = len(stats["violations_list"])
    summary_text = f"""
    - AUDIT PROFILE: {profile.upper()}
    - Total Elements Scanned: {stats['total']}
    - VIOLATIONS FOUND: {num_violations}
    """

    # 4. LLM Consultation
    llm_analysis = "LLM analysis not available"
    llm = get_llm()
    if llm:
        extra_context = ""
        if engine.text_rules:
            short_rules = [r[:100] + "..." if len(r) > 100 else r for r in engine.text_rules[:2]]
            extra_context = "\nPOLICY HIGHLIGHTS:\n" + "\n".join(f"- {r}" for r in short_rules)

        history = f"""
Hook: Senior UX Auditor. Topic: {profile} App.
DATA: {summary_text} {extra_context}
ERRORS: {stats['violations_list'][:2]}
Task: Explain why these errors matter for {profile}. Mention the Policies if relevant. Keep it short (2 sentences max per point).
"""
        print(f"🤖 AI Consultant: Analyzing Rules using TinyLlama (this may take 30-60s on CPU)...")
        try:
            llm_analysis = llm(history, max_new_tokens=128, temperature=0.6)
            print("✅ LLM Analysis complete.")
        except Exception as e:
            print(f"LLM Error: {e}")
            llm_analysis = f"Error during AI analysis: {str(e)}"

    # Final Report
    report = {
        "meta": {
            "profile": profile,
            "timestamp": str(np.datetime64('now'))
        },
        "summary": {
            "score": max(0, 100 - (num_violations * 10)),
            "violations": num_violations
        },
        "elements": elements,
        "llm_analysis": llm_analysis
    }

    return report
