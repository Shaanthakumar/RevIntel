from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Date, DateTime, Text, ForeignKey, JSON, Index
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base

class Hotel(Base):
    __tablename__ = "hotels"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)
    total_rooms = Column(Integer, default=150, nullable=False)
    city = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    currency = Column(String(10), default="USD", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    rooms = relationship("Room", back_populates="hotel", cascade="all, delete-orphan")
    room_types = relationship("RoomType", back_populates="hotel", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="hotel")
    daily_metrics = relationship("DailyHotelMetric", back_populates="hotel")


class RoomType(Base):
    __tablename__ = "room_types"
    
    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False, index=True)
    code = Column(String(50), nullable=False)
    name = Column(String(100), nullable=False)
    base_price = Column(Float, default=100.0, nullable=False)
    capacity = Column(Integer, default=2, nullable=False)
    description = Column(Text, nullable=True)
    
    hotel = relationship("Hotel", back_populates="room_types")
    rooms = relationship("Room", back_populates="room_type")
    bookings = relationship("Booking", back_populates="room_type")


class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False, index=True)
    room_type_id = Column(Integer, ForeignKey("room_types.id", ondelete="SET NULL"), nullable=True)
    room_number = Column(String(20), nullable=False)
    floor = Column(Integer, default=1)
    status = Column(String(30), default="Available")  # Available, Occupied, Maintenance
    
    hotel = relationship("Hotel", back_populates="rooms")
    room_type = relationship("RoomType", back_populates="rooms")


class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_type = Column(String(50), default="Transient")  # Transient, Contract, Group, etc.
    country = Column(String(100), default="Unknown")
    email = Column(String(150), nullable=True, index=True)
    phone = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    bookings = relationship("Booking", back_populates="customer")


class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=True, index=True)
    booking_reference = Column(String(100), index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    room_type_id = Column(Integer, ForeignKey("room_types.id"), nullable=True)
    
    booking_date = Column(Date, nullable=False, index=True)
    arrival_date = Column(Date, nullable=False, index=True)
    departure_date = Column(Date, nullable=True)
    lead_time = Column(Integer, default=0, nullable=False)
    
    adults = Column(Integer, default=1)
    children = Column(Integer, default=0)
    babies = Column(Integer, default=0)
    
    stays_weekend_nights = Column(Integer, default=0)
    stays_week_nights = Column(Integer, default=1)
    total_nights = Column(Integer, default=1)
    
    adr = Column(Float, default=0.0, nullable=False)
    room_revenue = Column(Float, default=0.0, nullable=False)
    total_revenue = Column(Float, default=0.0, nullable=False)
    
    booking_status = Column(String(50), default="Confirmed", index=True)
    is_canceled = Column(Boolean, default=False, index=True)
    cancellation_date = Column(Date, nullable=True)
    
    market_segment = Column(String(50), default="Leisure", index=True)
    distribution_channel = Column(String(50), default="Direct", index=True)
    deposit_type = Column(String(50), default="No Deposit")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    hotel = relationship("Hotel", back_populates="bookings")
    customer = relationship("Customer", back_populates="bookings")
    room_type = relationship("RoomType", back_populates="bookings")
    guests = relationship("BookingGuest", back_populates="booking", cascade="all, delete-orphan")


class BookingGuest(Base):
    __tablename__ = "booking_guests"
    
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, index=True)
    guest_name = Column(String(150), nullable=True)
    is_primary = Column(Boolean, default=True)
    age_group = Column(String(20), default="Adult")
    
    booking = relationship("Booking", back_populates="guests")


class DailyHotelMetric(Base):
    __tablename__ = "daily_hotel_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=True, index=True)
    date = Column(Date, nullable=False, index=True)
    
    available_rooms = Column(Integer, default=150, nullable=False)
    rooms_sold = Column(Integer, default=0, nullable=False)
    occupancy_rate = Column(Float, default=0.0, nullable=False)
    
    total_revenue = Column(Float, default=0.0, nullable=False)
    room_revenue = Column(Float, default=0.0, nullable=False)
    adr = Column(Float, default=0.0, nullable=False)
    revpar = Column(Float, default=0.0, nullable=False)
    
    bookings_count = Column(Integer, default=0, nullable=False)
    cancellations_count = Column(Integer, default=0, nullable=False)
    cancellation_rate = Column(Float, default=0.0, nullable=False)
    avg_lead_time = Column(Float, default=0.0, nullable=False)
    
    hotel = relationship("Hotel", back_populates="daily_metrics")
    
    __table_args__ = (
        Index("idx_daily_hotel_date", "hotel_id", "date", unique=True),
    )


class DailyRoomMetric(Base):
    __tablename__ = "daily_room_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=True, index=True)
    room_type_id = Column(Integer, ForeignKey("room_types.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    
    available_rooms = Column(Integer, default=50, nullable=False)
    rooms_sold = Column(Integer, default=0, nullable=False)
    occupancy_rate = Column(Float, default=0.0, nullable=False)
    adr = Column(Float, default=0.0, nullable=False)
    revenue = Column(Float, default=0.0, nullable=False)


class RevenueMetric(Base):
    __tablename__ = "revenue_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=True, index=True)
    metric_date = Column(Date, nullable=False, index=True)
    period_type = Column(String(20), default="daily")  # daily, weekly, monthly
    metric_name = Column(String(50), nullable=False)
    metric_value = Column(Float, nullable=False)
    previous_value = Column(Float, nullable=True)
    change_pct = Column(Float, nullable=True)


class Forecast(Base):
    __tablename__ = "forecasts"
    
    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=True, index=True)
    target_date = Column(Date, nullable=False, index=True)
    forecast_type = Column(String(50), nullable=False)  # demand, occupancy, adr, revpar
    forecasted_value = Column(Float, nullable=False)
    lower_bound = Column(Float, nullable=True)
    upper_bound = Column(Float, nullable=True)
    confidence_interval = Column(Float, default=0.95)
    model_name = Column(String(100), default="Baseline-Prophet")
    model_version = Column(String(50), default="v1.0")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class PricingRecommendation(Base):
    __tablename__ = "pricing_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    recommendation_id = Column(String(100), unique=True, index=True, nullable=False)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=True, index=True)
    room_type = Column(String(50), nullable=False)
    target_date = Column(Date, nullable=False, index=True)
    
    current_adr = Column(Float, nullable=False)
    recommended_adr = Column(Float, nullable=False)
    price_difference = Column(Float, nullable=False)
    expected_revenue_impact = Column(Float, nullable=True)
    
    reason = Column(Text, nullable=False)
    supporting_metrics = Column(JSON, nullable=True)
    confidence_score = Column(Float, default=0.85)
    risk_level = Column(String(20), default="Low")  # Low, Medium, High
    status = Column(String(20), default="Pending")  # Pending, Accepted, Rejected, Expired
    model_version = Column(String(50), default="v1.0")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class InventoryRecommendation(Base):
    __tablename__ = "inventory_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    recommendation_id = Column(String(100), unique=True, index=True, nullable=False)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=True, index=True)
    room_type = Column(String(50), nullable=False)
    target_date = Column(Date, nullable=False, index=True)
    
    channel = Column(String(50), nullable=False)  # Direct, OTA, Corporate
    allocated_rooms = Column(Integer, nullable=False)
    allocation_pct = Column(Float, nullable=False)
    strategy = Column(String(100), default="Yield Protection")
    rationale = Column(Text, nullable=False)
    confidence_score = Column(Float, default=0.80)
    status = Column(String(20), default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Anomaly(Base):
    __tablename__ = "anomalies"
    
    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=True, index=True)
    metric_name = Column(String(50), nullable=False)
    anomaly_date = Column(Date, nullable=False, index=True)
    
    observed_value = Column(Float, nullable=False)
    expected_value = Column(Float, nullable=False)
    baseline_value = Column(Float, nullable=True)
    z_score = Column(Float, nullable=True)
    severity = Column(String(20), default="warning")  # warning, high, critical
    detection_method = Column(String(50), default="Rolling-ZScore")
    explanation = Column(Text, nullable=False)
    status = Column(String(20), default="Active")
    detected_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=True, index=True)
    alert_type = Column(String(50), nullable=False)  # Anomaly, Pricing, Demand, Ingestion
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), default="info")  # info, warning, critical
    is_read = Column(Boolean, default=False)
    is_resolved = Column(Boolean, default=False)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class AgentInsight(Base):
    __tablename__ = "agent_insights"
    
    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=True, index=True)
    insight_type = Column(String(50), nullable=False)  # opportunity, risk, strategic, executive
    title = Column(String(200), nullable=False)
    summary = Column(Text, nullable=False)
    detailed_explanation = Column(Text, nullable=True)
    supporting_metrics = Column(JSON, nullable=True)
    confidence_level = Column(Float, default=0.90)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class RecommendationHistory(Base):
    __tablename__ = "recommendation_history"
    
    id = Column(Integer, primary_key=True, index=True)
    recommendation_id = Column(String(100), index=True, nullable=False)
    recommendation_type = Column(String(50), default="pricing")  # pricing, inventory
    old_status = Column(String(20), nullable=False)
    new_status = Column(String(20), nullable=False)
    action_taken_by = Column(String(100), default="system")
    feedback_notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)


class DataUpload(Base):
    __tablename__ = "data_uploads"
    
    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    rows_count = Column(Integer, default=0)
    columns_count = Column(Integer, default=0)
    missing_values_pct = Column(Float, default=0.0)
    duplicates_count = Column(Integer, default=0)
    quality_score = Column(Float, default=100.0)
    status = Column(String(50), default="Completed")
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="revenue_manager")  # admin, revenue_manager, viewer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
