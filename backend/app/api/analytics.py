from fastapi import APIRouter, Body
from app.api.revenue import get_revenue_analytics
from app.schemas.dto import RevenueAnalyticsResponse, DateRangeFilter

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.post("", response_model=RevenueAnalyticsResponse)
def get_analytics(filters: DateRangeFilter = Body(default=DateRangeFilter())):
    """General analytics endpoint mapping."""
    return get_revenue_analytics(filters)
