import cv2
from ultralytics import YOLO
import json
import os
import time
import PIL.Image
from google import genai
import uuid

from server.config import GEMINI_API_KEY, UPLOAD_DIR

client = genai.Client(api_key=GEMINI_API_KEY)

# --- HELPER FUNCTIONS ---

def draw_exact_format(img, bbox, error_text, fix_text):
    """Draws Red/Green boxes and labels on the image."""
    x1, y1, x2, y2 = map(int, bbox)
    RED, GREEN, WHITE = (0, 0, 255), (0, 150, 0), (255, 255, 255)
    
    cv2.rectangle(img, (x1, y1), (x2, y2), RED, 4)
    cv2.rectangle(img, (x1 + 6, y1 + 6), (x2 - 6, y2 - 6), GREEN, 2)

    def put_label(label, x, y, bg_color, is_top):
        (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        draw_y = (y - 10) if is_top else (y + h + 10)
        cv2.rectangle(img, (x, draw_y - h - 5), (x + w + 5, draw_y + 5), bg_color, -1)
        cv2.putText(img, label, (x + 2, draw_y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, WHITE, 1)

    if error_text: put_label(f"ERR: {error_text}", x1, y1, RED, is_top=True)
    if fix_text: put_label(f"FIX: {fix_text}", x1, y2, GREEN, is_top=False)

def ask_gemini(prompt, img_path):
    """Sends request to Gemini with a safety delay to avoid 429 errors."""
    try:
        time.sleep(4) 
        img = PIL.Image.open(img_path)
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=[prompt, img]
        )
        return response.text.strip().replace('"', '').replace("'", "")[:30]
    except Exception as e:
        print(f"⚠️ Gemini Error: {e}")
        return "Optimize Design"

def get_full_response(prompt, img_path):
    try:
        time.sleep(2)
        img = PIL.Image.open(img_path)
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=[prompt, img]
        )
        return response.text.strip()
    except Exception as e:
        return "Modern UI Interface"

# --- MAIN SERVICE PIPELINE ---

def run_feedback_pipeline(ui_image_path: str, json_file_path: str, yolo_model_path: str = "yolov8n.pt"):
    """
    Runs the multi-phase UI audit and saves annotated images.
    Returns the paths to the generated images and the final prompt.
    """
    processed_bboxes = [] 
    collected_issues = []  

    try:
        model = YOLO(yolo_model_path)
    except:
        model = YOLO("yolov8n.pt")

    img_raw = cv2.imread(ui_image_path)
    if img_raw is None:
        return {"error": f"Image {ui_image_path} not found"}

    img_p1, img_p2, img_p3 = img_raw.copy(), img_raw.copy(), img_raw.copy()

    def is_duplicate(new_box, threshold=40):
        for box in processed_bboxes:
            if all(abs(new_box[i] - box[i]) < threshold for i in range(4)):
                return True
        return False

    # --- PHASE 1: TECHNICAL ---
    if os.path.exists(json_file_path):
        with open(json_file_path, 'r') as f:
            data = json.load(f)
            elements = data.get('elements', [])
            failures = [el for el in elements if el.get('status') == 'FAIL']
        
        for v in failures[:5]: 
            if 'bbox' not in v: continue
            
            issues = v.get('issues', [])
            raw_err = issues[0]['desc'] if (issues and 'desc' in issues[0]) else "UI Failure"
            bbox = v['bbox']
            
            prompt = f"EXACTLY 3 words ONLY. IGNORE all form context, IGNORE what the UI shows. ONLY fix THIS technical measurement issue: '{raw_err}'. If it says 'Height', suggest height fix. If it says 'Contrast', suggest contrast fix. Address ONLY the technical spec mentioned. Format: 'Word Word Word'. NO form suggestions, NO generic advice. THREE WORDS ONLY."
            fix_short = ask_gemini(prompt, ui_image_path)
            
            collected_issues.append(f"- Fix technical error: '{raw_err}' by applying: '{fix_short}'")
            draw_exact_format(img_p1, bbox, raw_err, fix_short)
            draw_exact_format(img_p3, bbox, raw_err, fix_short)
            processed_bboxes.append(bbox)
            
    # --- PHASE 2: AESTHETIC ---
    results = model(ui_image_path)
    temp_annotated = os.path.join(UPLOAD_DIR, f"temp_annotated_{uuid.uuid4().hex[:8]}.jpg")
    cv2.imwrite(temp_annotated, results[0].plot()) 
    
    count = 0
    for box in results[0].boxes.xyxy.cpu().numpy():
        if count >= 3: break
        if is_duplicate(box): continue 
        
        prompt = "EXACTLY 3 words ONLY. Suggest one style/spacing fix for this UI element. Answer format: 'Word Word Word'. NO extra words, NO punctuation. THREE WORDS ONLY."
        fix_short = ask_gemini(prompt, temp_annotated)
        collected_issues.append(f"- Improve aesthetics: {fix_short}")
        
        draw_exact_format(img_p2, box, "Similarity Mismatch", fix_short)
        draw_exact_format(img_p3, box, "Similarity Mismatch", fix_short)
        processed_bboxes.append(box)
        count += 1

    # --- PHASE 3: SYNTHESIS ---
    final_prompt = "EXACTLY 4 words ONLY. What is the top UX priority? Answer format: 'Word Word Word Word'. NO extra words, NO punctuation. FOUR WORDS ONLY."
    synthesis_msg = ask_gemini(final_prompt, temp_annotated)
    
    cv2.rectangle(img_p3, (0,0), (img_p3.shape[1], 60), (150, 0, 0), -1)
    cv2.putText(img_p3, f"SYNTHESIS: {synthesis_msg}", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (255,255,255), 2)

    # Clean up temp file
    if os.path.exists(temp_annotated):
        os.remove(temp_annotated)

    # Save outputs with unique IDs
    req_id = uuid.uuid4().hex[:8]
    out1_path = os.path.join(UPLOAD_DIR, f"{req_id}_p1.jpg")
    out2_path = os.path.join(UPLOAD_DIR, f"{req_id}_p2.jpg")
    out3_path = os.path.join(UPLOAD_DIR, f"{req_id}_p3.jpg")
    
    cv2.imwrite(out1_path, img_p1)
    cv2.imwrite(out2_path, img_p2)
    cv2.imwrite(out3_path, img_p3)

    # --- PHASE 4: PROMPT GENERATION ---
    issues_text = "\n".join(collected_issues)
    prompt_req = f"""
    You are an expert Prompt Engineer for Midjourney and Stable Diffusion.
    I have a UI interface (attached) that has these specific flaws:
    {issues_text}
    
    The main goal is: {synthesis_msg}
    
    Write a detailed text-to-image prompt to generate a fixed, high-quality version of this UI.
    Include specific details on:
    1. Modern clean layout (solving the clutter).
    2. Color palette and Typography.
    3. Correcting the specific technical errors listed above.
    
    Return ONLY the prompt string.
    """
    
    final_prompt_text = get_full_response(prompt_req, ui_image_path)
    
    return {
        "status": "success",
        "images": {
            "phase1_technical": f"/feedback/report/{req_id}_p1",
            "phase2_aesthetic": f"/feedback/report/{req_id}_p2",
            "phase3_synthesis": f"/feedback/report/{req_id}_p3"
        },
        "synthesis_message": synthesis_msg,
        "generator_prompt": final_prompt_text
    }
