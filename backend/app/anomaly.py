import pandas as pd
import numpy as np
from typing import List, Dict, Any

def detect_timeline_anomalies(timeline_data: List[Dict[str, Any]], z_threshold: float = 2.2) -> List[Dict[str, Any]]:
    """
    Applies statistical anomaly detection (Rolling Z-score & IQR) 
    to daily revenue timelines for ADR, Cancellation Rate, Booking Volume, and Occupancy.
    """
    if not timeline_data or len(timeline_data) < 5:
        return []

    df = pd.DataFrame(timeline_data)
    anomalies = []

    metrics_config = [
        {'key': 'cancellation_rate', 'label': 'Cancellation Rate', 'unit': '%', 'high_is_bad': True},
        {'key': 'adr', 'label': 'ADR (Average Daily Rate)', 'unit': '$', 'high_is_bad': False},
        {'key': 'bookings', 'label': 'Booking Volume', 'unit': ' bookings', 'high_is_bad': False},
        {'key': 'occupancy_rate', 'label': 'Occupancy Rate', 'unit': '%', 'high_is_bad': False}
    ]

    for cfg in metrics_config:
        key = cfg['key']
        label = cfg['label']
        unit = cfg['unit']

        series = df[key].astype(float)
        
        # Calculate Rolling Mean and Rolling Std with min_periods=3
        rolling_mean = series.rolling(window=7, min_periods=3, center=True).mean()
        rolling_std = series.rolling(window=7, min_periods=3, center=True).std().fillna(series.std() or 1.0)
        
        # IQR method bounds for baseline sanity
        q25 = series.quantile(0.25)
        q75 = series.quantile(0.75)
        iqr = q75 - q25
        iqr_upper = q75 + (1.8 * iqr)
        iqr_lower = max(0, q25 - (1.8 * iqr))

        for i, val in enumerate(series):
            mean_val = rolling_mean.iloc[i]
            std_val = rolling_std.iloc[i]
            date_str = df.iloc[i]['date']

            if std_val == 0 or np.isnan(std_val):
                std_val = 1.0

            z_score = (val - mean_val) / std_val

            # Flag as anomaly if Z-score > z_threshold OR exceeds IQR bounds significantly
            is_anomaly = False
            anomaly_type = None

            if z_score > z_threshold or val > iqr_upper:
                is_anomaly = True
                anomaly_type = 'SPIKE'
            elif z_score < -z_threshold or (iqr_lower > 0 and val < iqr_lower):
                is_anomaly = True
                anomaly_type = 'DROP'

            if is_anomaly:
                severity = 'high' if abs(z_score) > 3.0 else 'medium'
                
                if anomaly_type == 'SPIKE':
                    msg = f"⚠ High {label} anomaly detected on {date_str} ({val}{unit} vs baseline {round(mean_val, 1)}{unit})."
                else:
                    msg = f"⚠ Sudden drop in {label} detected on {date_str} ({val}{unit} vs baseline {round(mean_val, 1)}{unit})."

                anomalies.append({
                    'id': f"anom-{key}-{i}",
                    'date': date_str,
                    'metric': label,
                    'key': key,
                    'type': anomaly_type,
                    'value': round(val, 2),
                    'baseline': round(mean_val, 2),
                    'z_score': round(z_score, 2),
                    'severity': severity,
                    'message': msg
                })

    # Sort anomalies by date descending
    anomalies.sort(key=lambda x: x['date'], reverse=True)
    return anomalies
