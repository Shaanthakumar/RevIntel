import pandas as pd
import numpy as np
import io
import re
from typing import Dict, Any, Tuple

SYNONYM_MAP = {
    'arrival_date': ['arrival_date', 'date', 'arrival', 'reservation_status_date', 'stay_date', 'checkin_date'],
    'booking_date': ['booking_date', 'reservation_date', 'created_at', 'booking_time'],
    'lead_time': ['lead_time', 'leadtime', 'days_advance', 'booking_lead_time'],
    'room_type': ['room_type', 'reserved_room_type', 'assigned_room_type', 'room'],
    'adr': ['adr', 'average_daily_rate', 'daily_rate', 'rate', 'price_per_night'],
    'booking_status': ['booking_status', 'reservation_status', 'status'],
    'is_canceled': ['is_canceled', 'cancellation_status', 'canceled', 'cancellations', 'is_cancelled'],
    'customer_segment': ['customer_segment', 'market_segment', 'guest_type', 'segment', 'customer_type'],
    'distribution_channel': ['distribution_channel', 'booking_channel', 'channel', 'dist_channel'],
    'country': ['country', 'guest_country', 'origin', 'nationality'],
    'room_revenue': ['room_revenue', 'revenue', 'total_revenue', 'room_revenue_all'],
    'adults': ['adults', 'number_of_adults', 'adult_count'],
    'children': ['children', 'number_of_children', 'child_count', 'kids'],
    'available_rooms': ['available_rooms', 'inventory', 'total_rooms', 'capacity'],
    'occupancy_rate': ['occupancy_rate', 'occupancy', 'occ', 'occupancy_pct']
}

def parse_file_to_dataframe(file_bytes: bytes, filename: str) -> pd.DataFrame:
    """Reads CSV or Excel bytes into a Pandas DataFrame."""
    ext = filename.split('.')[-1].lower()
    if ext in ['csv', 'txt']:
        try:
            df = pd.read_csv(io.BytesIO(file_bytes))
        except Exception:
            # Fallback delimiter try
            df = pd.read_csv(io.BytesIO(file_bytes), sep=None, engine='python')
    elif ext in ['xlsx', 'xls']:
        df = pd.read_excel(io.BytesIO(file_bytes))
    else:
        raise ValueError(f"Unsupported file extension: .{ext}. Please upload a CSV or Excel file.")
    
    if df.empty:
        raise ValueError("The uploaded file contains no data (0 rows).")
        
    return df

def normalize_column_name(col: str) -> str:
    """Normalizes column names for fuzzy matching."""
    s = str(col).strip().lower()
    s = re.sub(r'[\s\-_]+', '_', s)
    return s

def map_dataset_columns(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, str], Dict[str, Any]]:
    """
    Intelligently maps dataset columns to standard RevIntel field names.
    Returns:
      - Cleaned/standardized DataFrame
      - Mapping dictionary (standard_name -> original_column)
      - Detection status dictionary
    """
    mapped_df = df.copy()
    norm_cols = {normalize_column_name(c): c for c in df.columns}
    
    column_mapping = {}
    detected_fields = {}
    
    for std_field, synonyms in SYNONYM_MAP.items():
        found_orig = None
        for syn in synonyms:
            norm_syn = normalize_column_name(syn)
            if norm_syn in norm_cols:
                found_orig = norm_cols[norm_syn]
                break
        
        if found_orig:
            column_mapping[std_field] = found_orig
            detected_fields[std_field] = found_orig
        else:
            detected_fields[std_field] = None
            
    # Normalize arrival_date to standard YYYY-MM-DD
    arrival_col = column_mapping.get('arrival_date')
    if arrival_col:
        try:
            mapped_df['arrival_date'] = pd.to_datetime(mapped_df[arrival_col], errors='coerce').dt.strftime('%Y-%m-%d')
        except Exception:
            pass
    else:
        # Fallback date synthesis if missing
        start_date = pd.to_datetime('2025-01-01')
        mapped_df['arrival_date'] = [ (start_date + pd.Timedelta(days=i % 365)).strftime('%Y-%m-%d') for i in range(len(mapped_df)) ]
        column_mapping['arrival_date'] = 'Synthetic Date'

    # Ensure adr is numeric
    adr_col = column_mapping.get('adr')
    if adr_col and adr_col in mapped_df.columns:
        mapped_df['adr'] = pd.to_numeric(mapped_df[adr_col], errors='coerce').fillna(0.0)
    else:
        mapped_df['adr'] = 120.0
        
    # Ensure room_revenue is numeric or calculated
    rev_col = column_mapping.get('room_revenue')
    if rev_col and rev_col in mapped_df.columns:
        mapped_df['room_revenue'] = pd.to_numeric(mapped_df[rev_col], errors='coerce').fillna(0.0)
    else:
        mapped_df['room_revenue'] = mapped_df['adr']

    # Ensure booking_status and is_canceled
    cancel_col = column_mapping.get('is_canceled')
    status_col = column_mapping.get('booking_status')
    
    if cancel_col and cancel_col in mapped_df.columns:
        mapped_df['is_canceled'] = pd.to_numeric(mapped_df[cancel_col], errors='coerce').fillna(0).astype(int)
    elif status_col and status_col in mapped_df.columns:
        mapped_df['is_canceled'] = mapped_df[status_col].astype(str).str.lower().apply(
            lambda s: 1 if any(x in s for x in ['cancel', 'no-show', 'noshow']) else 0
        )
    else:
        mapped_df['is_canceled'] = 0
        
    if not status_col or status_col not in mapped_df.columns:
        mapped_df['booking_status'] = mapped_df['is_canceled'].apply(lambda c: 'Canceled' if c == 1 else 'Confirmed')
    else:
        mapped_df['booking_status'] = mapped_df[status_col].astype(str)

    # Defaults for optional categorical columns if absent
    if 'room_type' not in column_mapping or not column_mapping['room_type']:
        mapped_df['room_type'] = 'Standard'
    else:
        mapped_df['room_type'] = mapped_df[column_mapping['room_type']].astype(str).fillna('Standard')

    if 'customer_segment' not in column_mapping or not column_mapping['customer_segment']:
        mapped_df['customer_segment'] = 'Leisure'
    else:
        mapped_df['customer_segment'] = mapped_df[column_mapping['customer_segment']].astype(str).fillna('Leisure')

    if 'distribution_channel' not in column_mapping or not column_mapping['distribution_channel']:
        mapped_df['distribution_channel'] = 'Direct'
    else:
        mapped_df['distribution_channel'] = mapped_df[column_mapping['distribution_channel']].astype(str).fillna('Direct')

    if 'country' not in column_mapping or not column_mapping['country']:
        mapped_df['country'] = 'Unknown'
    else:
        mapped_df['country'] = mapped_df[column_mapping['country']].astype(str).fillna('Unknown')

    if 'lead_time' not in column_mapping or not column_mapping['lead_time']:
        mapped_df['lead_time'] = 14
    else:
        mapped_df['lead_time'] = pd.to_numeric(mapped_df[column_mapping['lead_time']], errors='coerce').fillna(14).astype(int)

    return mapped_df, column_mapping, detected_fields
