from fastapi import APIRouter, Path
from typing import List, Dict, Any
from app.schemas.dto import RecommendationActionRequest, MessageResponse

router = APIRouter(prefix="/recommendations", tags=["Recommendations Management"])

# In-memory recommendation status cache for demo actions
rec_status_map = {}

@router.post("/{rec_id}/action", response_model=MessageResponse)
def handle_recommendation_action(
    action: RecommendationActionRequest,
    rec_id: str = Path(...)
):
    """Allows revenue managers to Accept or Reject pricing/inventory recommendations."""
    rec_status_map[rec_id] = action.status
    return {
        "message": f"Recommendation {rec_id} status updated to {action.status}",
        "status": "success"
    }
