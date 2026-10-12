import pandas as pd
import numpy as np
from typing import Dict, Any

CORE_EXPECTED_COLUMNS = ['arrival_date', 'adr', 'room_type', 'booking_status', 'customer_segment', 'distribution_channel']

def generate_data_quality_report(raw_df: pd.DataFrame, column_mapping: Dict[str, str]) -> Dict[str, Any]:
    """
    Analyzes raw and mapped dataset data quality metrics.
    """
    total_rows = len(raw_df)
    total_cols = len(raw_df.columns)
    
    if total_rows == 0:
        return {
            'total_rows': 0,
            'total_columns': 0,
            'missing_value_pct': 0.0,
            'duplicate_rows': 0,
            'invalid_numeric_count': 0,
            'missing_core_columns': CORE_EXPECTED_COLUMNS,
            'quality_score': 0.0,
            'columns_found': list(raw_df.columns)
        }
        
    # Missing values
    total_cells = total_rows * total_cols
    missing_cells = int(raw_df.isna().sum().sum())
    missing_pct = round((missing_cells / total_cells) * 100, 2) if total_cells > 0 else 0.0
    
    # Duplicate rows
    duplicate_rows = int(raw_df.duplicated().sum())
    
    # Invalid numeric values check
    numeric_cols = raw_df.select_dtypes(include=[np.number]).columns
    invalid_numerics = 0
    for col in numeric_cols:
        invalid_numerics += int(raw_df[col].isna().sum())
        # Check negative prices or impossible rates if present
        if any(term in col.lower() for term in ['adr', 'rate', 'price', 'revenue']):
            invalid_numerics += int((raw_df[col] < 0).sum())
            
    # Check missing core columns
    missing_core = []
    for std_col in CORE_EXPECTED_COLUMNS:
        if std_col not in column_mapping or not column_mapping[std_col]:
            missing_core.append(std_col)
            
    # Calculate Data Quality Health Score (0-100)
    score = 100.0
    score -= min(30.0, missing_pct)
    score -= min(20.0, (duplicate_rows / total_rows) * 100)
    score -= len(missing_core) * 8.0
    quality_score = max(10.0, min(100.0, round(score, 1)))
    
    return {
        'total_rows': total_rows,
        'total_columns': total_cols,
        'missing_values_count': missing_cells,
        'missing_value_pct': missing_pct,
        'duplicate_rows': duplicate_rows,
        'invalid_numeric_count': invalid_numerics,
        'missing_core_columns': missing_core,
        'quality_score': quality_score,
        'columns_found': list(raw_df.columns)
    }
