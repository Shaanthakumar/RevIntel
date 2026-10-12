from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.store import DatasetStore
from app.schemas.dto import BookingListResponse
from app.sample_generator import generate_sample_hotel_data
from app.ingestion import map_dataset_columns

router = APIRouter(prefix="/bookings", tags=["Bookings"])
store = DatasetStore.get_instance()

def ensure_dataset():
    if store.mapped_df is None:
        raw = generate_sample_hotel_data()
        mapped, col_map, det = map_dataset_columns(raw)
        store.set_dataset(raw, mapped, col_map, det, "Synthetic_Demo_Hotel_Data.csv")

@router.get("", response_model=BookingListResponse)
def list_bookings(page: int = Query(1, ge=1), limit: int = Query(25, ge=1, le=100)):
    """Paginated list of active hotel booking reservations."""
    ensure_dataset()
    df = store.mapped_df
    total = len(df)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    
    sliced = df.iloc[start_idx:end_idx]
    items = []
    for idx, row in sliced.iterrows():
        items.append({
            "id": int(idx) + 1,
            "booking_reference": str(row.get("booking_id", f"REV-{10000+idx}")),
            "arrival_date": str(row.get("arrival_date", "2025-01-01")),
            "lead_time": int(row.get("lead_time", 14)),
            "adr": float(row.get("adr", 120.0)),
            "room_revenue": float(row.get("room_revenue", 120.0)),
            "booking_status": str(row.get("booking_status", "Confirmed")),
            "market_segment": str(row.get("customer_segment", "Leisure")),
            "distribution_channel": str(row.get("distribution_channel", "Direct")),
            "total_nights": int(row.get("total_nights", 1)),
            "adults": int(row.get("adults", 1)),
            "children": int(row.get("children", 0))
        })
        
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": items
    }
