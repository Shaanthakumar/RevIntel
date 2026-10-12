import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_sample_hotel_data(num_records: int = 1250, seed: int = 42) -> pd.DataFrame:
    """
    Generates a realistic synthetic hotel booking dataset for RevIntel.
    Includes seasonal trends, room types, segments, lead times, ADR variations, 
    cancellations, and synthetic statistical anomalies.
    """
    np.random.seed(seed)
    
    start_date = datetime(2025, 1, 1)
    date_range = [start_date + timedelta(days=i) for i in range(365)]
    
    room_types = ['Standard', 'Deluxe', 'Executive', 'Suite']
    room_weights = [0.45, 0.30, 0.15, 0.10]
    base_adr = {'Standard': 110, 'Deluxe': 160, 'Executive': 230, 'Suite': 380}
    
    segments = ['Leisure', 'Business', 'Group', 'Corporate', 'Direct']
    segment_weights = [0.40, 0.25, 0.15, 0.10, 0.10]
    
    channels = ['OTA', 'Direct', 'Travel Agent', 'Corporate', 'GDS']
    channel_weights = [0.50, 0.25, 0.12, 0.08, 0.05]
    
    countries = ['USA', 'UK', 'Germany', 'France', 'Canada', 'Spain', 'Japan', 'India', 'Australia']
    country_weights = [0.35, 0.20, 0.15, 0.08, 0.07, 0.05, 0.04, 0.03, 0.03]
    
    records = []
    
    # Pick arrival dates across the year with summer/holiday peak demand
    arrival_dates = np.random.choice(date_range, size=num_records)
    arrival_dates.sort()
    
    for idx, arr_date in enumerate(arrival_dates):
        booking_id = f"REV-{10000 + idx}"
        
        # Lead time: geometric / exponential distribution (0 to 120 days)
        lead_time = int(np.random.exponential(scale=25))
        lead_time = min(max(lead_time, 0), 180)
        
        book_date = arr_date - timedelta(days=lead_time)
        
        room_type = np.random.choice(room_types, p=room_weights)
        segment = np.random.choice(segments, p=segment_weights)
        channel = np.random.choice(channels, p=channel_weights)
        country = np.random.choice(countries, p=country_weights)
        
        # Seasonality factor for ADR (Summer Jun-Aug peak 1.35x, Winter Dec holiday 1.25x)
        month = arr_date.month
        day_of_week = arr_date.weekday() # 5,6 is weekend
        
        season_multiplier = 1.0
        if month in [6, 7, 8]:
            season_multiplier = 1.35
        elif month in [12]:
            season_multiplier = 1.25
        elif month in [4, 5, 9, 10]:
            season_multiplier = 1.10
            
        weekend_multiplier = 1.15 if day_of_week in [4, 5] else 1.0
        
        # Calculate ADR with random noise
        adr_mean = base_adr[room_type] * season_multiplier * weekend_multiplier
        adr = round(max(50.0, np.random.normal(adr_mean, adr_mean * 0.12)), 2)
        
        # Stay duration
        weekend_nights = np.random.choice([0, 1, 2], p=[0.3, 0.4, 0.3])
        week_nights = np.random.choice([1, 2, 3, 4, 5], p=[0.2, 0.3, 0.25, 0.15, 0.1])
        total_nights = weekend_nights + week_nights
        
        # Guests
        adults = np.random.choice([1, 2, 3], p=[0.35, 0.55, 0.10])
        children = np.random.choice([0, 1, 2], p=[0.80, 0.15, 0.05])
        
        # Cancellation logic
        # Base cancellation probability ~ 22%
        cancel_prob = 0.22
        if lead_time > 45:
            cancel_prob += 0.12
        if segment == 'Group':
            cancel_prob += 0.08
        if channel == 'OTA':
            cancel_prob += 0.05
            
        # Synthetic Anomalies injection for testing statistical anomaly detection
        # Anomaly 1: High cancellation surge around mid-August (2025-08-12 to 2025-08-16)
        if arr_date >= datetime(2025, 8, 12) and arr_date <= datetime(2025, 8, 16):
            cancel_prob = 0.85
            
        # Anomaly 2: Price spike on October 15-18 (2025-10-15 to 2025-10-18)
        if arr_date >= datetime(2025, 10, 15) and arr_date <= datetime(2025, 10, 18):
            adr = adr * 2.4
            
        is_canceled = 1 if np.random.random() < cancel_prob else 0
        if is_canceled:
            booking_status = 'Canceled' if np.random.random() > 0.15 else 'No-Show'
        else:
            booking_status = 'Confirmed'
            
        room_revenue = round(adr * total_nights, 2) if not is_canceled else 0.0
        
        records.append({
            'booking_id': booking_id,
            'booking_date': book_date.strftime('%Y-%m-%d'),
            'arrival_date': arr_date.strftime('%Y-%m-%d'),
            'lead_time': lead_time,
            'room_type': room_type,
            'adr': adr,
            'adults': adults,
            'children': children,
            'stays_in_weekend_nights': weekend_nights,
            'stays_in_week_nights': week_nights,
            'total_nights': total_nights,
            'booking_status': booking_status,
            'is_canceled': is_canceled,
            'customer_segment': segment,
            'distribution_channel': channel,
            'country': country,
            'room_revenue': room_revenue
        })
        
    df = pd.DataFrame(records)
    return df

if __name__ == "__main__":
    df = generate_sample_hotel_data()
    print(f"Generated synthetic hotel dataset with {len(df)} rows.")
    print(df.head())
