import pytest
import sys
import pandas as pd
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, 'backend')
from app.database.base import Base
from app.services.data_pipeline import DataPipelineService
from app.models.domain import Hotel, RoomType, Booking, DataUpload

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_read_file_csv():
    csv_bytes = b"arrival_date,adr,room_type\n2025-05-01,150.0,Deluxe\n2025-05-02,160.0,Suite"
    df = DataPipelineService.read_file(csv_bytes, "test.csv")
    assert len(df) == 2
    assert "adr" in df.columns

def test_read_empty_file_raises_error():
    with pytest.raises(ValueError, match="contains no data"):
        DataPipelineService.read_file(b"", "empty.csv")

def test_read_unsupported_format_raises_error():
    with pytest.raises(ValueError, match="Unsupported file format"):
        DataPipelineService.read_file(b"content", "test.pdf")

def test_map_and_clean_component_dates():
    raw_df = pd.DataFrame([
        {
            'arrival_date_year': 2025,
            'arrival_date_month': 'July',
            'arrival_date_day_of_month': 15,
            'lead_time': 20,
            'adr': 175.5,
            'stays_in_weekend_nights': 1,
            'stays_in_week_nights': 2,
            'is_canceled': 0,
            'market_segment': 'Online TA',
            'distribution_channel': 'TA/TO',
            'reserved_room_type': 'Deluxe',
            'country': 'USA'
        }
    ])
    mapped_df, col_map, det = DataPipelineService.map_and_clean_data(raw_df)
    
    assert mapped_df.iloc[0]['arrival_date'] == '2025-07-15'
    assert mapped_df.iloc[0]['booking_date'] == '2025-06-25'  # 2025-07-15 minus 20 days
    assert mapped_df.iloc[0]['total_nights'] == 3
    assert mapped_df.iloc[0]['room_revenue'] == round(175.5 * 3, 2)
    assert mapped_df.iloc[0]['customer_segment'] == 'Online TA'
    assert mapped_df.iloc[0]['room_type'] == 'Deluxe'

def test_audit_data_quality():
    raw_df = pd.DataFrame([
        {'arrival_date': '2025-01-01', 'adr': 100.0, 'room_type': 'Standard', 'status': 'Confirmed'},
        {'arrival_date': '2025-01-02', 'adr': None, 'room_type': 'Deluxe', 'status': 'Confirmed'},
        {'arrival_date': '2025-01-01', 'adr': 100.0, 'room_type': 'Standard', 'status': 'Confirmed'} # Duplicate
    ])
    col_map = {'arrival_date': 'arrival_date', 'adr': 'adr', 'room_type': 'room_type', 'booking_status': 'status'}
    report = DataPipelineService.audit_data_quality(raw_df, col_map)

    assert report['total_rows'] == 3
    assert report['duplicate_rows'] == 1
    assert report['missing_values_count'] == 1
    assert 0.0 < report['quality_score'] <= 100.0

def test_persist_to_database(db_session):
    raw_df = pd.DataFrame([
        {
            'arrival_date_year': 2025,
            'arrival_date_month': 'May',
            'arrival_date_day_of_month': 10,
            'lead_time': 12,
            'adr': 140.0,
            'stays_in_weekend_nights': 1,
            'stays_in_week_nights': 1,
            'is_canceled': 0,
            'market_segment': 'Direct',
            'distribution_channel': 'Direct',
            'reserved_room_type': 'Suite',
            'country': 'GBR'
        }
    ])
    mapped_df, col_map, _ = DataPipelineService.map_and_clean_data(raw_df)
    quality = DataPipelineService.audit_data_quality(raw_df, col_map)
    
    result = DataPipelineService.persist_to_database(db_session, mapped_df, "test_upload.csv", quality)
    
    assert result['records_persisted'] == 1
    
    # Verify in DB session
    hotel = db_session.query(Hotel).first()
    assert hotel is not None
    assert hotel.code == "REV-GRAND"
    
    room_type = db_session.query(RoomType).filter(RoomType.name == "Suite").first()
    assert room_type is not None
    
    booking = db_session.query(Booking).first()
    assert booking is not None
    assert booking.adr == 140.0
    assert booking.total_nights == 2
    assert booking.room_revenue == 280.0
    
    upload_audit = db_session.query(DataUpload).first()
    assert upload_audit is not None
    assert upload_audit.filename == "test_upload.csv"
    assert upload_audit.rows_count == 1
