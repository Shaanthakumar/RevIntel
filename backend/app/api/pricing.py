from fastapi import APIRouter
from datetime import datetime, timedelta
from app.schemas.dto import PricingRecommendationsResponse

router = APIRouter(prefix="/pricing", tags=["Dynamic Pricing"])

@router.get("/recommendations", response_model=PricingRecommendationsResponse)
def get_pricing_recommendations():
    """Returns dynamic rate recommendations per room type and date."""
    today = datetime.now()
    recs = [
        {
            "recommendation_id": "REC-PRC-101",
            "room_type": "Deluxe",
            "target_date": (today + timedelta(days=3)).strftime("%Y-%m-%d"),
            "current_adr": 160.0,
            "recommended_adr": 185.0,
            "price_difference": 25.0,
            "expected_revenue_impact": 1850.0,
            "reason": "High forecasted weekend demand and rapid booking velocity observed in previous 48 hours.",
            "supporting_metrics": {"lead_time_pace": "+24%", "market_compression": "High"},
            "confidence_score": 0.88,
            "risk_level": "Low",
            "status": "Pending",
            "model_version": "v1.0"
        },
        {
            "recommendation_id": "REC-PRC-102",
            "room_type": "Executive Suite",
            "target_date": (today + timedelta(days=5)).strftime("%Y-%m-%d"),
            "current_adr": 310.0,
            "recommended_adr": 345.0,
            "price_difference": 35.0,
            "expected_revenue_impact": 1400.0,
            "reason": "Corporate segment pickup surge exceeding seasonal threshold.",
            "supporting_metrics": {"segment_velocity": "+18%", "remaining_inventory": 4},
            "confidence_score": 0.92,
            "risk_level": "Low",
            "status": "Pending",
            "model_version": "v1.0"
        }
    ]
    return {
        "total_recommendations": len(recs),
        "items": recs
    }
