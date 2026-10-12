from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import date, datetime

# --- General & Common Models ---
class MessageResponse(BaseModel):
    message: str
    status: str = "success"

class DateRangeFilter(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    room_types: Optional[List[str]] = None
    segments: Optional[List[str]] = None
    channels: Optional[List[str]] = None
    booking_status: Optional[str] = None


# --- 1. Data Ingestion & Quality ---
class DataQualityReportResponse(BaseModel):
    total_rows: int
    total_columns: int
    missing_values_count: int
    missing_value_pct: float
    duplicate_rows: int
    invalid_numeric_count: int
    missing_core_columns: List[str]
    quality_score: float
    columns_found: List[str]

class DataUploadResponse(BaseModel):
    message: str
    filename: str
    quality_report: DataQualityReportResponse
    detected_fields: Dict[str, Optional[str]]
    column_mapping: Dict[str, str]
    sample_preview: List[Dict[str, Any]]
    db_persisted_count: Optional[int] = None

class UploadHistoryItem(BaseModel):
    id: int
    filename: str
    rows_count: int
    columns_count: int
    missing_values_pct: float
    duplicates_count: int
    quality_score: float
    status: str
    uploaded_at: datetime
    class Config:
        from_attributes = True

class UploadHistoryResponse(BaseModel):
    total_uploads: int
    items: List[UploadHistoryItem]

class SchemaMappingResponse(BaseModel):
    standard_fields: List[str]
    detected_mapping: Dict[str, Optional[str]]
    unmapped_required_fields: List[str]


# --- 2. Hotels & Rooms ---
class HotelBase(BaseModel):
    name: str
    code: str
    total_rooms: int = 150
    city: Optional[str] = None
    country: Optional[str] = None
    currency: str = "USD"

class HotelCreate(HotelBase):
    pass

class HotelResponse(HotelBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True


# --- 3. Bookings ---
class BookingResponse(BaseModel):
    id: int
    booking_reference: str
    arrival_date: date
    lead_time: int
    adr: float
    room_revenue: float
    booking_status: str
    market_segment: str
    distribution_channel: str
    total_nights: int
    adults: int
    children: int
    class Config:
        from_attributes = True

class BookingListResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[BookingResponse]


# --- 4. KPIs & Revenue ---
class KPIMetric(BaseModel):
    value: float
    unit: str
    prev_value: float
    change_pct: float
    trend: str  # up, down, neutral

class CoreKPIsResponse(BaseModel):
    occupancy_rate: KPIMetric
    adr: KPIMetric
    revpar: KPIMetric
    cancellation_rate: KPIMetric
    total_bookings: KPIMetric
    avg_lead_time: KPIMetric
    total_revenue: float
    rooms_sold: int
    available_rooms: int

class RevenueAnalyticsResponse(BaseModel):
    kpis: CoreKPIsResponse
    timeline: List[Dict[str, Any]]
    segment_analysis: List[Dict[str, Any]]
    room_performance: List[Dict[str, Any]]
    booking_pace: List[Dict[str, Any]]
    channel_performance: List[Dict[str, Any]]


# --- 5. Anomalies ---
class AnomalyItem(BaseModel):
    id: str
    date: str
    metric: str
    key: str
    type: str  # SPIKE or DROP
    value: float
    baseline: float
    z_score: float
    severity: str  # warning, high, critical
    message: str

class AnomaliesResponse(BaseModel):
    total_anomalies: int
    anomalies: List[AnomalyItem]


# --- 6. Forecasts ---
class ForecastItem(BaseModel):
    target_date: str
    forecast_type: str  # demand, occupancy, adr, revpar
    forecasted_value: float
    lower_bound: float
    upper_bound: float
    confidence_interval: float = 0.95
    model_name: str
    model_version: str

class ForecastsResponse(BaseModel):
    forecast_horizon_days: int
    model_summary: Dict[str, Any]
    items: List[ForecastItem]


# --- 7. Dynamic Pricing ---
class PricingRecommendationItem(BaseModel):
    recommendation_id: str
    room_type: str
    target_date: str
    current_adr: float
    recommended_adr: float
    price_difference: float
    expected_revenue_impact: float
    reason: str
    supporting_metrics: Dict[str, Any]
    confidence_score: float
    risk_level: str  # Low, Medium, High
    status: str = "Pending"  # Pending, Accepted, Rejected, Expired
    model_version: str

class PricingRecommendationsResponse(BaseModel):
    total_recommendations: int
    items: List[PricingRecommendationItem]


# --- 8. Inventory Allocation ---
class InventoryRecommendationItem(BaseModel):
    recommendation_id: str
    room_type: str
    target_date: str
    channel: str
    allocated_rooms: int
    allocation_pct: float
    strategy: str
    rationale: str
    confidence_score: float
    status: str = "Pending"

class InventoryRecommendationsResponse(BaseModel):
    total_recommendations: int
    items: List[InventoryRecommendationItem]


# --- 9. Recommendation Action ---
class RecommendationActionRequest(BaseModel):
    status: str  # Accepted, Rejected
    feedback_notes: Optional[str] = None
    action_taken_by: str = "revenue_manager"


# --- 10. AI Revenue Agent ---
class AgentInsightItem(BaseModel):
    category: str
    type: str  # positive, warning, alert, info
    title: str
    description: str

class AIAgentResponse(BaseModel):
    executive_summary: str
    top_opportunities: List[str]
    top_risks: List[str]
    insights: List[AgentInsightItem]
    strongest_period: Optional[Dict[str, Any]]
    weakest_period: Optional[Dict[str, Any]]
    confidence_level: float
    engine_type: str


# --- 11. Alerts ---
class AlertItem(BaseModel):
    id: int
    alert_type: str
    title: str
    message: str
    severity: str  # info, warning, critical
    is_read: bool
    is_resolved: bool
    created_at: datetime
    class Config:
        from_attributes = True

class AlertsResponse(BaseModel):
    unread_count: int
    items: List[AlertItem]
