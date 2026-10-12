import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional

def filter_dataframe(
    df: pd.DataFrame,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    room_types: Optional[List[str]] = None,
    segments: Optional[List[str]] = None,
    channels: Optional[List[str]] = None,
    booking_status: Optional[str] = None
) -> pd.DataFrame:
    """Filters dataframe by date range, room type, segment, channel, and status."""
    filtered = df.copy()
    
    if start_date:
        filtered = filtered[filtered['arrival_date'] >= start_date]
    if end_date:
        filtered = filtered[filtered['arrival_date'] <= end_date]
    if room_types and len(room_types) > 0 and 'All' not in room_types:
        filtered = filtered[filtered['room_type'].isin(room_types)]
    if segments and len(segments) > 0 and 'All' not in segments:
        filtered = filtered[filtered['customer_segment'].isin(segments)]
    if channels and len(channels) > 0 and 'All' not in channels:
        filtered = filtered[filtered['distribution_channel'].isin(channels)]
    if booking_status and booking_status != 'All':
        filtered = filtered[filtered['booking_status'].str.lower() == booking_status.lower()]
        
    return filtered

def compute_kpis_and_visualizations(
    df: pd.DataFrame,
    default_daily_inventory: int = 150
) -> Dict[str, Any]:
    """
    Computes all core revenue KPIs, period-over-period comparisons, 
    and visualization series for the frontend charts.
    """
    if df.empty:
        return {
            'kpis': {},
            'charts': {},
            'filter_options': {}
        }
        
    # Sort by arrival date
    df['arrival_date_dt'] = pd.to_datetime(df['arrival_date'], errors='coerce')
    df = df.sort_values('arrival_date_dt')
    
    # Filter options available in active dataset
    filter_options = {
        'min_date': df['arrival_date'].min() if not df.empty else '2025-01-01',
        'max_date': df['arrival_date'].max() if not df.empty else '2025-12-31',
        'room_types': sorted(df['room_type'].dropna().unique().tolist()),
        'customer_segments': sorted(df['customer_segment'].dropna().unique().tolist()),
        'distribution_channels': sorted(df['distribution_channel'].dropna().unique().tolist()),
        'booking_statuses': sorted(df['booking_status'].dropna().unique().tolist())
    }
    
    # Total Days in dataset/filter
    unique_dates = df['arrival_date'].unique()
    num_days = max(1, len(unique_dates))
    
    total_available_rooms = num_days * default_daily_inventory
    
    # Active confirmed vs canceled
    confirmed_df = df[df['is_canceled'] == 0]
    canceled_df = df[df['is_canceled'] == 1]
    
    total_bookings = len(df)
    confirmed_bookings = len(confirmed_df)
    canceled_bookings = len(canceled_df)
    
    # If dataset has explicit total_nights or rooms sold metric, use it; else count confirmed bookings
    if 'total_nights' in df.columns:
        rooms_sold = int(confirmed_df['total_nights'].sum())
    else:
        rooms_sold = confirmed_bookings
        
    # Ensure available rooms covers rooms_sold dynamically if inventory assumption was too low
    if rooms_sold > total_available_rooms:
        total_available_rooms = rooms_sold + (num_days * 20)
        
    total_room_revenue = float(confirmed_df['room_revenue'].sum())
    
    # KPI Calculations
    occupancy_rate = round((rooms_sold / total_available_rooms) * 100, 2) if total_available_rooms > 0 else 0.0
    adr = round(total_room_revenue / rooms_sold, 2) if rooms_sold > 0 else round(float(confirmed_df['adr'].mean() or 0.0), 2)
    revpar = round(total_room_revenue / total_available_rooms, 2) if total_available_rooms > 0 else 0.0
    cancellation_rate = round((canceled_bookings / total_bookings) * 100, 2) if total_bookings > 0 else 0.0
    avg_lead_time = round(float(df['lead_time'].mean() or 0.0), 1)
    
    # Period-Over-Period Comparison logic (Split active range into 1st half and 2nd half)
    half_index = len(df) // 2
    if half_index > 0:
        prev_df = df.iloc[:half_index]
        curr_df = df.iloc[half_index:]
        
        prev_num_days = max(1, len(prev_df['arrival_date'].unique()))
        curr_num_days = max(1, len(curr_df['arrival_date'].unique()))
        
        prev_avail = prev_num_days * default_daily_inventory
        curr_avail = curr_num_days * default_daily_inventory
        
        prev_conf = prev_df[prev_df['is_canceled'] == 0]
        curr_conf = curr_df[curr_df['is_canceled'] == 0]
        
        prev_sold = len(prev_conf)
        curr_sold = len(curr_conf)
        
        prev_rev = float(prev_conf['room_revenue'].sum())
        curr_rev = float(curr_conf['room_revenue'].sum())
        
        prev_occ = (prev_sold / prev_avail) * 100 if prev_avail > 0 else 0
        curr_occ = (curr_sold / curr_avail) * 100 if curr_avail > 0 else 0
        
        prev_adr_val = prev_rev / prev_sold if prev_sold > 0 else 0
        curr_adr_val = curr_rev / curr_sold if curr_sold > 0 else 0
        
        prev_revpar_val = prev_rev / prev_avail if prev_avail > 0 else 0
        curr_revpar_val = curr_rev / curr_avail if curr_avail > 0 else 0
        
        prev_canc = (len(prev_df[prev_df['is_canceled'] == 1]) / len(prev_df)) * 100 if len(prev_df) > 0 else 0
        curr_canc = (len(curr_df[curr_df['is_canceled'] == 1]) / len(curr_df)) * 100 if len(curr_df) > 0 else 0
    else:
        prev_occ = curr_occ = occupancy_rate
        prev_adr_val = curr_adr_val = adr
        prev_revpar_val = curr_revpar_val = revpar
        prev_canc = curr_canc = cancellation_rate
        
    def pct_change(curr, prev):
        if prev == 0:
            return 0.0
        return round(((curr - prev) / prev) * 100, 1)

    kpis = {
        'occupancy_rate': {
            'value': occupancy_rate,
            'unit': '%',
            'prev_value': round(prev_occ, 2),
            'change_pct': pct_change(curr_occ, prev_occ),
            'trend': 'up' if curr_occ >= prev_occ else 'down'
        },
        'adr': {
            'value': adr,
            'unit': '$',
            'prev_value': round(prev_adr_val, 2),
            'change_pct': pct_change(curr_adr_val, prev_adr_val),
            'trend': 'up' if curr_adr_val >= prev_adr_val else 'down'
        },
        'revpar': {
            'value': revpar,
            'unit': '$',
            'prev_value': round(prev_revpar_val, 2),
            'change_pct': pct_change(curr_revpar_val, prev_revpar_val),
            'trend': 'up' if curr_revpar_val >= prev_revpar_val else 'down'
        },
        'cancellation_rate': {
            'value': cancellation_rate,
            'unit': '%',
            'prev_value': round(prev_canc, 2),
            'change_pct': pct_change(curr_canc, prev_canc),
            'trend': 'down' if curr_canc <= prev_canc else 'up' # lower cancellation is good
        },
        'total_bookings': {
            'value': total_bookings,
            'unit': '',
            'prev_value': len(prev_df) if half_index > 0 else total_bookings,
            'change_pct': pct_change(len(curr_df), len(prev_df)) if half_index > 0 else 0.0,
            'trend': 'up' if (len(curr_df) >= len(prev_df) if half_index > 0 else True) else 'down'
        },
        'avg_lead_time': {
            'value': avg_lead_time,
            'unit': 'days',
            'prev_value': round(float(prev_df['lead_time'].mean() or 0.0), 1) if half_index > 0 else avg_lead_time,
            'change_pct': pct_change(curr_df['lead_time'].mean(), prev_df['lead_time'].mean()) if half_index > 0 else 0.0,
            'trend': 'up'
        },
        'total_revenue': round(total_room_revenue, 2),
        'rooms_sold': rooms_sold,
        'available_rooms': total_available_rooms
    }
    
    # Visualizations Timeline Aggregation (Daily or Weekly depending on date span)
    daily_grp = df.groupby('arrival_date')
    daily_timeline = []
    
    for date_str, group in daily_grp:
        grp_conf = group[group['is_canceled'] == 0]
        grp_canc = group[group['is_canceled'] == 1]
        
        day_sold = len(grp_conf)
        day_rev = float(grp_conf['room_revenue'].sum())
        day_total_bk = len(group)
        day_canc_cnt = len(grp_canc)
        
        day_occ = round((day_sold / default_daily_inventory) * 100, 2)
        day_adr = round(day_rev / day_sold, 2) if day_sold > 0 else round(float(group['adr'].mean() or 0.0), 2)
        day_revpar = round(day_rev / default_daily_inventory, 2)
        day_canc_rate = round((day_canc_cnt / day_total_bk) * 100, 2) if day_total_bk > 0 else 0.0
        
        daily_timeline.append({
            'date': date_str,
            'occupancy_rate': day_occ,
            'adr': day_adr,
            'revpar': day_revpar,
            'bookings': day_total_bk,
            'confirmed': day_sold,
            'cancellations': day_canc_cnt,
            'cancellation_rate': day_canc_rate,
            'revenue': round(day_rev, 2)
        })
        
    daily_timeline_df = pd.DataFrame(daily_timeline)
    
    # 5. Customer Segment Breakdown
    segment_grp = df.groupby('customer_segment')
    segment_data = []
    for seg_name, group in segment_grp:
        seg_conf = group[group['is_canceled'] == 0]
        seg_rev = float(seg_conf['room_revenue'].sum())
        seg_bookings = len(group)
        seg_adr = round(seg_rev / len(seg_conf), 2) if len(seg_conf) > 0 else round(float(group['adr'].mean() or 0.0), 2)
        segment_data.append({
            'segment': seg_name,
            'bookings': seg_bookings,
            'revenue': round(seg_rev, 2),
            'adr': seg_adr,
            'share_pct': round((seg_bookings / total_bookings) * 100, 1) if total_bookings > 0 else 0
        })
        
    # 6. Room Type Performance
    room_grp = df.groupby('room_type')
    room_data = []
    for r_name, group in room_grp:
        r_conf = group[group['is_canceled'] == 0]
        r_canc = group[group['is_canceled'] == 1]
        r_rev = float(r_conf['room_revenue'].sum())
        r_bookings = len(group)
        r_adr = round(r_rev / len(r_conf), 2) if len(r_conf) > 0 else round(float(group['adr'].mean() or 0.0), 2)
        r_canc_rate = round((len(r_canc) / r_bookings) * 100, 1) if r_bookings > 0 else 0.0
        
        room_data.append({
            'room_type': r_name,
            'bookings': r_bookings,
            'revenue': round(r_rev, 2),
            'adr': r_adr,
            'cancellation_rate': r_canc_rate
        })
        
    # 7. Booking Pace (Lead Time Buckets)
    bins = [-1, 7, 14, 30, 60, 120, 999]
    labels = ['0-7 Days', '8-14 Days', '15-30 Days', '31-60 Days', '61-120 Days', '120+ Days']
    df['lead_bucket'] = pd.cut(df['lead_time'], bins=bins, labels=labels)
    pace_grp = df.groupby('lead_bucket', observed=False)
    pace_data = []
    for bucket_label, group in pace_grp:
        pace_data.append({
            'bucket': bucket_label,
            'bookings': len(group),
            'cancellation_rate': round((len(group[group['is_canceled'] == 1]) / max(1, len(group))) * 100, 1)
        })

    # 8. Distribution Channel Performance
    chan_grp = df.groupby('distribution_channel')
    channel_data = []
    for c_name, group in chan_grp:
        c_conf = group[group['is_canceled'] == 0]
        c_rev = float(c_conf['room_revenue'].sum())
        channel_data.append({
            'channel': c_name,
            'bookings': len(group),
            'revenue': round(c_rev, 2),
            'share_pct': round((len(group) / total_bookings) * 100, 1) if total_bookings > 0 else 0
        })

    return {
        'kpis': kpis,
        'charts': {
            'timeline': daily_timeline,
            'segment_analysis': segment_data,
            'room_performance': room_data,
            'booking_pace': pace_data,
            'channel_performance': channel_data
        },
        'filter_options': filter_options
    }
