from fastapi import APIRouter
from datetime import datetime
from app.schemas.dto import AlertsResponse

router = APIRouter(prefix="/alerts", tags=["Alerts & Notifications"])

@router.get("", response_model=AlertsResponse)
def get_alerts():
    """Returns active revenue management alerts."""
    now = datetime.now()
    alerts = [
        {
            "id": 1,
            "alert_type": "Anomaly",
            "title": "High Cancellation Surge Detected",
            "message": "August mid-month cancellations spiked past 3 standard deviations above baseline.",
            "severity": "critical",
            "is_read": False,
            "is_resolved": False,
            "created_at": now
        },
        {
            "id": 2,
            "alert_type": "Pricing",
            "title": "Uncaptured Weekend Demand Opportunity",
            "message": "Upcoming Friday pace indicates potential +$25 ADR increase for Deluxe rooms.",
            "severity": "warning",
            "is_read": False,
            "is_resolved": False,
            "created_at": now
        },
        {
            "id": 3,
            "alert_type": "Ingestion",
            "title": "Dataset Processing Complete",
            "message": "1,250 reservation records successfully ingested with 95% data health score.",
            "severity": "info",
            "is_read": True,
            "is_resolved": True,
            "created_at": now
        }
    ]
    return {
        "unread_count": 2,
        "items": alerts
    }
