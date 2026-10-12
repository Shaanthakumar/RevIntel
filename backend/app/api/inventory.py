from fastapi import APIRouter
from datetime import datetime, timedelta
from app.schemas.dto import InventoryRecommendationsResponse

router = APIRouter(prefix="/inventory", tags=["Inventory Allocation"])

@router.get("/recommendations", response_model=InventoryRecommendationsResponse)
def get_inventory_recommendations():
    """Returns optimal channel allocation and capacity protection recommendations."""
    today = datetime.now()
    recs = [
        {
            "recommendation_id": "REC-INV-201",
            "room_type": "Standard",
            "target_date": (today + timedelta(days=2)).strftime("%Y-%m-%d"),
            "channel": "Direct",
            "allocated_rooms": 35,
            "allocation_pct": 70.0,
            "strategy": "Direct Booking Margin Protection",
            "rationale": "High direct conversion trend avoids 18% OTA commission fees on high-compression date.",
            "confidence_score": 0.85,
            "status": "Pending"
        },
        {
            "recommendation_id": "REC-INV-202",
            "room_type": "Deluxe",
            "target_date": (today + timedelta(days=4)).strftime("%Y-%m-%d"),
            "channel": "OTA",
            "allocated_rooms": 15,
            "allocation_pct": 30.0,
            "strategy": "Selective OTA Capping",
            "rationale": "Cap third-party allocations to protect inventory for multi-night direct guests.",
            "confidence_score": 0.81,
            "status": "Pending"
        }
    ]
    return {
        "total_recommendations": len(recs),
        "items": recs
    }
