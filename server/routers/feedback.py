from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from SMARTUI_RL.auditor_service import get_rl

router = APIRouter(prefix="/audit/feedback", tags=["feedback"])

class FeedbackRequest(BaseModel):
    profile: str
    rule_name: str
    feedback: int # +1 for agree, -1 for disagree

@router.post("", summary="Submit RL feedback for a rule violation")
async def submit_feedback(request: FeedbackRequest):
    """
    Submits user feedback to the Reinforcement Learning module.
    Feedback of +1 strengthens the rule, -1 relaxes it.
    """
    try:
        print(f"\n--- [API POST /audit/feedback] ---")
        print(f"User Feedback: Rule={request.rule_name}, Feedback={request.feedback} (+1=Agree, -1=Disagree)")
        
        rl = get_rl()
        message = rl.update_policy(
            profile=request.profile,
            rule_name=request.rule_name,
            user_feedback=request.feedback
        )
        print(f"RL Policy Result: {message}")
        return {"status": "success", "message": message}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
