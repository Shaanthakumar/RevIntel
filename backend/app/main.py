from fastapi import FastAPI, File, UploadFile, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
import traceback

from app.sample_generator import generate_sample_hotel_data
from app.ingestion import parse_file_to_dataframe, map_dataset_columns
from app.cleaning import generate_data_quality_report
from app.kpi import filter_dataframe, compute_kpis_and_visualizations
from app.anomaly import detect_timeline_anomalies
from app.insights import RuleBasedInsightEngine
from app.database import DatasetStore

from app.api import api_router
from app.database.session import init_db

app = FastAPI(
    title="RevIntel API",
    description="AI-Driven Revenue Intelligence Agent for Hotel Revenue Management",
    version="1.0.0"
)

# Initialize database tables on app startup
@app.on_event("startup")
def on_startup():
    init_db()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount modular API router (/api/data, /api/kpis, /api/forecasts, /api/pricing, etc.)
app.include_router(api_router)

store = DatasetStore.get_instance()
insight_engine = RuleBasedInsightEngine()

class FilterRequest(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    room_types: Optional[List[str]] = None
    segments: Optional[List[str]] = None
    channels: Optional[List[str]] = None
    booking_status: Optional[str] = None

class InventoryConfigRequest(BaseModel):
    capacity: int

def ensure_dataset_loaded():
    """Auto-loads synthetic demo dataset if store is empty on launch."""
    if store.mapped_df is None:
        raw = generate_sample_hotel_data()
        mapped, col_map, det_fields = map_dataset_columns(raw)
        store.set_dataset(raw, mapped, col_map, det_fields, "Synthetic_Demo_Hotel_Data.csv")

import math

def clean_for_json(obj):
    """Recursively replaces NaN, Inf, -Inf and NumPy types with JSON-compliant Python values."""
    if obj is None:
        return None
    if isinstance(obj, (bool, np.bool_)):
        return bool(obj)
    if isinstance(obj, (int, np.integer)):
        return int(obj)
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return 0.0
        return round(obj, 4)
    if isinstance(obj, str):
        return obj
    if isinstance(obj, dict):
        return {str(k): clean_for_json(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple, set, np.ndarray, pd.Series)):
        return [clean_for_json(v) for v in obj]
    if isinstance(obj, (pd.Timestamp, pd.Period)):
        return str(obj)
        
    try:
        val = float(obj)
        if math.isnan(val) or math.isinf(val):
            return 0.0
        return round(val, 4)
    except Exception:
        return str(obj)

def sanitize_df_for_json(df: pd.DataFrame, limit: int = 15) -> list:
    """Replaces NaN, Inf, -Inf values with valid JSON types."""
    if df is None or df.empty:
        return []
    sliced = df.head(limit).copy()
    sliced = sliced.fillna("").replace([np.inf, -np.inf], 0.0)
    return clean_for_json(sliced.to_dict(orient="records"))

@app.get("/api/health")
def health_check():
    return {"status": "ok", "system": "RevIntel Revenue Intelligence API v1.0"}

@app.post("/api/load-sample")
def load_sample_dataset():
    """Loads synthetic hotel dataset into active state."""
    try:
        raw = generate_sample_hotel_data()
        mapped, col_map, det_fields = map_dataset_columns(raw)
        store.set_dataset(raw, mapped, col_map, det_fields, "Synthetic_Demo_Hotel_Data.csv")
        quality = generate_data_quality_report(raw, col_map)
        return clean_for_json({
            "message": "Sample dataset loaded successfully",
            "filename": store.filename,
            "quality_report": quality,
            "sample_preview": sanitize_df_for_json(mapped, 10)
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """Uploads CSV/Excel file, cleans data, and updates active state."""
    try:
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty (0 bytes).")
            
        raw = parse_file_to_dataframe(contents, file.filename)
        mapped, col_map, det_fields = map_dataset_columns(raw)
        store.set_dataset(raw, mapped, col_map, det_fields, file.filename)
        
        quality = generate_data_quality_report(raw, col_map)
        
        return clean_for_json({
            "message": "File uploaded and processed successfully",
            "filename": file.filename,
            "quality_report": quality,
            "detected_fields": det_fields,
            "column_mapping": col_map,
            "sample_preview": sanitize_df_for_json(mapped, 10)
        })
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to process dataset: {str(e)}")

@app.get("/api/dataset-status")
def get_dataset_status():
    """Returns active dataset status, metadata, and quality summary."""
    ensure_dataset_loaded()
    quality = generate_data_quality_report(store.raw_df, store.column_mapping)
    preview = sanitize_df_for_json(store.mapped_df, 15)
    
    return clean_for_json({
        "filename": store.filename,
        "inventory_capacity": store.inventory_capacity,
        "quality_report": quality,
        "detected_fields": store.detected_fields,
        "column_mapping": store.column_mapping,
        "preview": preview
    })

@app.post("/api/inventory-config")
def update_inventory_config(config: InventoryConfigRequest):
    """Updates standard daily room inventory capacity assumption."""
    if config.capacity <= 0:
        raise HTTPException(status_code=400, detail="Inventory capacity must be greater than 0.")
    store.set_inventory_capacity(config.capacity)
    return {"message": f"Daily room inventory assumption set to {config.capacity} rooms."}

@app.post("/api/analytics")
def get_analytics(filters: FilterRequest = Body(...)):
    """Computes filtered KPIs, comparison metrics, and Recharts series."""
    ensure_dataset_loaded()
    
    filtered_df = filter_dataframe(
        store.mapped_df,
        start_date=filters.start_date,
        end_date=filters.end_date,
        room_types=filters.room_types,
        segments=filters.segments,
        channels=filters.channels,
        booking_status=filters.booking_status
    )
    
    results = compute_kpis_and_visualizations(filtered_df, default_daily_inventory=store.inventory_capacity)
    return clean_for_json(results)

@app.post("/api/insights")
def get_insights_and_anomalies(filters: FilterRequest = Body(...)):
    """Generates intelligent data insights and statistical anomalies for active selection."""
    ensure_dataset_loaded()
    
    filtered_df = filter_dataframe(
        store.mapped_df,
        start_date=filters.start_date,
        end_date=filters.end_date,
        room_types=filters.room_types,
        segments=filters.segments,
        channels=filters.channels,
        booking_status=filters.booking_status
    )
    
    analytics = compute_kpis_and_visualizations(filtered_df, default_daily_inventory=store.inventory_capacity)
    timeline = analytics['charts'].get('timeline', [])
    
    anomalies = detect_timeline_anomalies(timeline)
    insights_res = insight_engine.generate_insights(analytics, anomalies)
    
    return clean_for_json({
        "anomalies": anomalies,
        "insights": insights_res["insights"],
        "strongest_period": insights_res["strongest_period"],
        "weakest_period": insights_res["weakest_period"],
        "engine_type": insights_res["engine_type"]
    })
