import pytest
import sys
sys.path.insert(0, 'backend')

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.base import Base
from app.models.domain import Hotel, RoomType, Booking, Anomaly, PricingRecommendation

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_hotel_and_room_type_creation(db_session):
    hotel = Hotel(name="Test Resort", code="RES-01", total_rooms=100)
    db_session.add(hotel)
    db_session.commit()
    
    room_type = RoomType(hotel_id=hotel.id, code="DLX", name="Deluxe Room", base_price=150.0)
    db_session.add(room_type)
    db_session.commit()
    
    assert hotel.id is not None
    assert len(hotel.room_types) == 1
    assert hotel.room_types[0].code == "DLX"

def test_anomaly_record_creation(db_session):
    from datetime import date
    anomaly = Anomaly(
        metric_name="cancellation_rate",
        anomaly_date=date(2025, 8, 15),
        observed_value=85.0,
        expected_value=22.0,
        z_score=3.4,
        severity="critical",
        explanation="Mid-August cancellation surge detected."
    )
    db_session.add(anomaly)
    db_session.commit()
    assert anomaly.id is not None
    assert anomaly.severity == "critical"
