from fastapi import APIRouter, Body
from app.database.store import DatasetStore
from app.schemas.dto import AnomaliesResponse, DateRangeFilter
from app.kpi import filter_dataframe, compute_kpis_and_visualizations
from app.anomaly import detect_timeline_anomalies
from app.sample_generator import generate_sample_hotel_data
from app.ingestion import map_dataset_columns

router = APIRouter(prefix="/anomalies", tags=["Anomaly Detection"])
store = DatasetStore.get_instance()

def ensure_dataset():
    if store.mapped_df is None:
        raw = generate_sample_hotel_data()
        mapped, col_map, det = map_dataset_columns(raw)
        store.set_dataset(raw, mapped, col_map, det, "Synthetic_Demo_Hotel_Data.csv")

@router.post("", response_model=AnomaliesResponse)
def get_anomalies(filters: DateRangeFilter = Body(default=DateRangeFilter())):
    """Runs statistical rolling Z-score and IQR anomaly detection on revenue timelines."""
    ensure_dataset()
    filtered = filter_dataframe(
        store.mapped_df,
        start_date=str(filters.start_date) if filters.start_date else None,
        end_date=str(filters.end_date) if filters.end_date else None,
        room_types=filters.room_types,
        segments=filters.segments,
        channels=filters.channels,
        booking_status=filters.booking_status
    )
    res = compute_kpis_and_visualizations(filtered, default_daily_inventory=store.inventory_capacity)
    timeline = res["charts"]["timeline"]
    anomalies = detect_timeline_anomalies(timeline)
    return {
        "total_anomalies": len(anomalies),
        "anomalies": anomalies
    }
