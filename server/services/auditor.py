import os
import cv2
import faiss
import numpy as np

from server.config import FAISS_INDEX_PATH, IMAGE_PATHS_FILE, UPLOAD_DIR
from server.services.detector import detect_components
from server.services.vectorizer import vectorize_crop

# ---------------------------------------------------------------------------
# Load FAISS index and image-path mapping ONCE at import time
# ---------------------------------------------------------------------------
_index = faiss.read_index(str(FAISS_INDEX_PATH))

with open(str(IMAGE_PATHS_FILE), "r") as _f:
    _image_paths = [line.strip() for line in _f.readlines()]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def run_audit(image_path: str) -> dict:
    """
    Full audit pipeline:
      1. Detect UI components with YOLOv8  (via detector service)
      2. Vectorize each crop with CLIP     (via vectorizer service)
      3. Search FAISS for the nearest expert match
      4. Return scores and generate an annotated report image

    Returns a dict suitable for JSON serialisation.
    """
    img = cv2.imread(image_path)
    if img is None:
        return {"error": "Could not read image"}

    # --- Step 1: Detect components ---
    result = detect_components(image_path)
    boxes = result.boxes

    if len(boxes) == 0:
        return {"error": "No UI components detected", "components": []}

    components = []
    annotated = img.copy()

    for box in boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
        cls_id = int(box.cls[0])
        cls_name = result.names[cls_id]
        conf = float(box.conf[0])

        # Crop the detected element
        crop = img[y1:y2, x1:x2]
        if crop.size == 0:
            continue

        # --- Step 2: Vectorize ---
        vector = vectorize_crop(crop)

        # --- Step 3: Search FAISS ---
        distances, indices = _index.search(vector, k=1)
        similarity = float(1 / (1 + distances[0][0]))  # distance → similarity
        similarity_pct = round(similarity * 100, 1)

        matched_path = (
            _image_paths[indices[0][0]]
            if indices[0][0] < len(_image_paths)
            else "unknown"
        )

        components.append(
            {
                "class": cls_name,
                "confidence": round(conf, 3),
                "bbox": [x1, y1, x2, y2],
                "similarity_score": similarity_pct,
                "matched_expert": os.path.basename(matched_path),
            }
        )

        # Annotate image with colour-coded bounding boxes
        if similarity_pct >= 70:
            color = (0, 255, 0)       # green  – good
        elif similarity_pct >= 50:
            color = (0, 165, 255)     # orange – okay
        else:
            color = (0, 0, 255)       # red    – needs work

        cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
        cv2.putText(
            annotated,
            f"{cls_name}: {similarity_pct}%",
            (x1, y1 - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            color,
            2,
        )

    # --- Overall score & grade ---
    avg_score = round(
        float(np.mean([c["similarity_score"] for c in components])), 1
    )
    if avg_score >= 80:
        grade = "EXCELLENT"
    elif avg_score >= 60:
        grade = "GOOD"
    else:
        grade = "NEEDS WORK"

    # Save annotated report image
    report_id = os.path.splitext(os.path.basename(image_path))[0]
    report_path = os.path.join(str(UPLOAD_DIR), f"{report_id}_report.jpg")
    cv2.imwrite(report_path, annotated)

    return {
        "report_id": report_id,
        "overall_score": avg_score,
        "grade": grade,
        "total_components": len(components),
        "components": components,
        "report_image_url": f"/audit/report/{report_id}",
    }
