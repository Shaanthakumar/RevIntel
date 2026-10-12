from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from pathlib import Path
from typing import List

from app.database.session import get_db
from app.database.store import DatasetStore
from app.models.domain import DataUpload
from app.schemas.dto import (
    DataUploadResponse, 
    DataQualityReportResponse, 
    UploadHistoryResponse, 
    UploadHistoryItem, 
    SchemaMappingResponse
)
from app.services.data_pipeline import DataPipelineService, CORE_EXPECTED_FIELDS

router = APIRouter(prefix="/data", tags=["Data Management"])
store = DatasetStore.get_instance()

def sanitize_preview(df, limit=15):
    if df is None or df.empty:
        return []
    import numpy as np
    sliced = df.head(limit).copy()
    return sliced.fillna("").replace([np.inf, -np.inf], 0.0).to_dict(orient="records")

@router.post("/upload", response_model=DataUploadResponse)
async def upload_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Ingests CSV or Excel file, validates dates & numbers, maps column synonyms,
    audits quality score, and persists records to normalized database tables.
    """
    try:
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty (0 bytes).")
            
        raw_df = DataPipelineService.read_file(contents, file.filename)
        mapped_df, col_map, det_fields = DataPipelineService.map_and_clean_data(raw_df)
        quality_report = DataPipelineService.audit_data_quality(raw_df, col_map)
        
        # Persist to normalized database tables (Hotels, RoomTypes, Customers, Bookings, DataUploads)
        db_result = DataPipelineService.persist_to_database(db, mapped_df, file.filename, quality_report)
        
        # Cache in memory store for immediate analytics query acceleration
        store.set_dataset(raw_df, mapped_df, col_map, det_fields, file.filename)
        
        return {
            "message": f"Dataset '{file.filename}' successfully validated and saved to database.",
            "filename": file.filename,
            "quality_report": quality_report,
            "detected_fields": det_fields,
            "column_mapping": col_map,
            "sample_preview": sanitize_preview(mapped_df, 15),
            "db_persisted_count": db_result.get("records_persisted")
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data pipeline error: {str(e)}")

@router.get("/quality", response_model=DataQualityReportResponse)
def get_data_quality():
    """Returns active dataset data health score and quality metrics."""
    if store.raw_df is None:
        # Load sample dataset automatically if store is empty
        sample_path = Path("data/sample/hotel_bookings_sample.csv")
        if sample_path.exists():
            import pandas as pd
            raw_df = pd.read_csv(sample_path)
        else:
            from app.sample_generator import generate_sample_hotel_data
            raw_df = generate_sample_hotel_data()
        mapped_df, col_map, det_fields = DataPipelineService.map_and_clean_data(raw_df)
        store.set_dataset(raw_df, mapped_df, col_map, det_fields, "hotel_bookings_sample.csv")
        
    return DataPipelineService.audit_data_quality(store.raw_df, store.column_mapping)

@router.post("/sample", response_model=DataUploadResponse)
def load_sample_dataset(db: Session = Depends(get_db)):
    """Loads and persists the standard Kaggle-style 1,200 booking sample dataset."""
    sample_path = Path("data/sample/hotel_bookings_sample.csv")
    if sample_path.exists():
        import pandas as pd
        raw_df = pd.read_csv(sample_path)
    else:
        from app.sample_generator import generate_sample_hotel_data
        raw_df = generate_sample_hotel_data()
        
    mapped_df, col_map, det_fields = DataPipelineService.map_and_clean_data(raw_df)
    quality_report = DataPipelineService.audit_data_quality(raw_df, col_map)
    db_result = DataPipelineService.persist_to_database(db, mapped_df, "hotel_bookings_sample.csv", quality_report)
    store.set_dataset(raw_df, mapped_df, col_map, det_fields, "hotel_bookings_sample.csv")
    
    return {
        "message": "Sample dataset (1,200 records) loaded, validated, and persisted to database.",
        "filename": "hotel_bookings_sample.csv",
        "quality_report": quality_report,
        "detected_fields": det_fields,
        "column_mapping": col_map,
        "sample_preview": sanitize_preview(mapped_df, 15),
        "db_persisted_count": db_result.get("records_persisted")
    }

@router.get("/history", response_model=UploadHistoryResponse)
def get_upload_history(db: Session = Depends(get_db)):
    """Returns historical list of ingested datasets from database audit logs."""
    records = db.query(DataUpload).order_by(DataUpload.uploaded_at.desc()).limit(20).all()
    return {
        "total_uploads": len(records),
        "items": records
    }

@router.get("/schema-mapping", response_model=SchemaMappingResponse)
def get_schema_mapping():
    """Returns detected column synonyms and mapping status against standard hotel schema."""
    det = store.detected_fields or {}
    unmapped = [f for f in CORE_EXPECTED_FIELDS if not det.get(f)]
    return {
        "standard_fields": list(CORE_EXPECTED_FIELDS),
        "detected_mapping": det,
        "unmapped_required_fields": unmapped
    }
