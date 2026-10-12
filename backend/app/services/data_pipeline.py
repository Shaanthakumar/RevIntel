import pandas as pd
import numpy as np
import io
import re
from datetime import datetime, timedelta
from typing import Dict, Any, Tuple, List, Optional
from sqlalchemy.orm import Session

from app.models.domain import Hotel, RoomType, Customer, Booking, DataUpload
from app.database.store import DatasetStore
from app.utils.logger import logger

MONTH_NAME_TO_NUM = {
    'january': 1, 'february': 2, 'march': 3, 'april': 4,
    'may': 5, 'june': 6, 'july': 7, 'august': 8,
    'september': 9, 'october': 10, 'november': 11, 'december': 12
}

SYNONYM_MAP = {
    'arrival_date': ['arrival_date', 'date', 'arrival', 'reservation_status_date', 'stay_date', 'checkin_date'],
    'booking_date': ['booking_date', 'reservation_date', 'created_at', 'booking_time'],
    'lead_time': ['lead_time', 'leadtime', 'days_advance', 'booking_lead_time', 'days_in_advance'],
    'room_type': ['reserved_room_type', 'assigned_room_type', 'room_type', 'room', 'room_category'],
    'adr': ['adr', 'average_daily_rate', 'daily_rate', 'rate', 'price_per_night', 'price', 'room_rate'],
    'booking_status': ['booking_status', 'reservation_status', 'status'],
    'is_canceled': ['is_canceled', 'cancellation_status', 'canceled', 'cancellations', 'is_cancelled'],
    'customer_segment': ['market_segment', 'customer_segment', 'guest_type', 'segment', 'customer_type'],
    'distribution_channel': ['distribution_channel', 'booking_channel', 'channel', 'dist_channel'],
    'country': ['country', 'guest_country', 'origin', 'nationality'],
    'room_revenue': ['room_revenue', 'revenue', 'total_revenue', 'room_revenue_all'],
    'stays_weekend_nights': ['stays_in_weekend_nights', 'weekend_nights', 'stays_weekend_nights'],
    'stays_week_nights': ['stays_in_week_nights', 'week_nights', 'stays_week_nights'],
    'adults': ['adults', 'number_of_adults', 'adult_count'],
    'children': ['children', 'number_of_children', 'child_count', 'kids'],
    'available_rooms': ['available_rooms', 'inventory', 'total_rooms', 'capacity']
}

CORE_EXPECTED_FIELDS = ['arrival_date', 'adr', 'room_type', 'booking_status', 'customer_segment', 'distribution_channel']


class DataPipelineService:
    """
    Enterprise Hotel Data Ingestion, Cleaning, Quality Auditing, and Database Persistence Pipeline.
    """

    @staticmethod
    def read_file(file_bytes: bytes, filename: str) -> pd.DataFrame:
        """Reads CSV, Excel (.xlsx, .xls) files into a Pandas DataFrame."""
        if not file_bytes or len(file_bytes.strip()) == 0:
            raise ValueError("The uploaded file contains no data (0 rows).")

        ext = filename.split('.')[-1].lower()
        if ext in ['csv', 'txt']:
            try:
                df = pd.read_csv(io.BytesIO(file_bytes))
            except Exception:
                try:
                    df = pd.read_csv(io.BytesIO(file_bytes), sep=None, engine='python')
                except Exception:
                    raise ValueError("The uploaded file contains no data (0 rows).")
        elif ext in ['xlsx', 'xls']:
            df = pd.read_excel(io.BytesIO(file_bytes))
        else:
            raise ValueError(f"Unsupported file format '.{ext}'. Supported: CSV (.csv), Excel (.xlsx, .xls)")

        if df.empty:
            raise ValueError("The uploaded file contains no data (0 rows).")

        return df

    @staticmethod
    def normalize_col_name(col: str) -> str:
        s = str(col).strip().lower()
        return re.sub(r'[\s\-_]+', '_', s)

    @classmethod
    def map_and_clean_data(cls, raw_df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, str], Dict[str, Any]]:
        """
        Detects standard columns, handles year/month/day components,
        normalizes numeric fields, validates dates, and synthesizes missing attributes.
        """
        df = raw_df.copy()
        norm_cols = {cls.normalize_col_name(c): c for c in df.columns}
        
        column_mapping = {}
        detected_fields = {}

        for std_field, synonyms in SYNONYM_MAP.items():
            found_orig = None
            for syn in synonyms:
                norm_syn = cls.normalize_col_name(syn)
                if norm_syn in norm_cols:
                    found_orig = norm_cols[norm_syn]
                    break
            column_mapping[std_field] = found_orig
            detected_fields[std_field] = found_orig

        # 1. Arrival Date Resolution
        # Check if year, month, day components are provided (common in hotel demand datasets)
        has_year = any(k in norm_cols for k in ['arrival_date_year', 'year'])
        has_month = any(k in norm_cols for k in ['arrival_date_month', 'month'])
        has_day = any(k in norm_cols for k in ['arrival_date_day_of_month', 'day_of_month', 'day'])

        if has_year and has_month and has_day:
            year_col = next(norm_cols[k] for k in ['arrival_date_year', 'year'] if k in norm_cols)
            month_col = next(norm_cols[k] for k in ['arrival_date_month', 'month'] if k in norm_cols)
            day_col = next(norm_cols[k] for k in ['arrival_date_day_of_month', 'day_of_month', 'day'] if k in norm_cols)

            def make_date(row):
                try:
                    y = int(row[year_col])
                    m_val = str(row[month_col]).strip().lower()
                    m = MONTH_NAME_TO_NUM.get(m_val, int(m_val) if m_val.isdigit() else 1)
                    d = int(row[day_col])
                    return f"{y:04d}-{m:02d}-{d:02d}"
                except Exception:
                    return None

            df['arrival_date'] = df.apply(make_date, axis=1)
            column_mapping['arrival_date'] = f"Combined({year_col}, {month_col}, {day_col})"
            detected_fields['arrival_date'] = column_mapping['arrival_date']
        elif column_mapping.get('arrival_date'):
            orig_col = column_mapping['arrival_date']
            df['arrival_date'] = pd.to_datetime(df[orig_col], errors='coerce').dt.strftime('%Y-%m-%d')
        else:
            # Fallback date generation
            start_date = pd.to_datetime('2025-01-01')
            df['arrival_date'] = [(start_date + pd.Timedelta(days=i % 365)).strftime('%Y-%m-%d') for i in range(len(df))]
            column_mapping['arrival_date'] = 'Synthesized (Sequence)'

        # Fill any unresolved null dates
        df['arrival_date'] = df['arrival_date'].fillna('2025-01-01')

        # 2. Lead Time Resolution
        lead_col = column_mapping.get('lead_time')
        if lead_col and lead_col in df.columns:
            df['lead_time'] = pd.to_numeric(df[lead_col], errors='coerce').fillna(14).astype(int)
            df['lead_time'] = df['lead_time'].apply(lambda x: max(0, min(x, 365)))
        else:
            df['lead_time'] = 14

        # 3. Booking Date Resolution
        book_col = column_mapping.get('booking_date')
        if book_col and book_col in df.columns:
            df['booking_date'] = pd.to_datetime(df[book_col], errors='coerce').dt.strftime('%Y-%m-%d')
        else:
            # Calculate booking_date = arrival_date - lead_time
            def derive_book_date(row):
                try:
                    arr = datetime.strptime(row['arrival_date'], '%Y-%m-%d')
                    return (arr - timedelta(days=int(row['lead_time']))).strftime('%Y-%m-%d')
                except Exception:
                    return '2025-01-01'
            df['booking_date'] = df.apply(derive_book_date, axis=1)

        # 4. ADR (Average Daily Rate) Validation
        adr_col = column_mapping.get('adr')
        if adr_col and adr_col in df.columns:
            df['adr'] = pd.to_numeric(df[adr_col], errors='coerce').fillna(120.0)
            df['adr'] = df['adr'].apply(lambda x: max(10.0, float(x)))
            df['adr'] = df['adr'].round(2)
        else:
            df['adr'] = 120.0

        # 5. Stays & Nights Validation
        wknd_col = column_mapping.get('stays_weekend_nights')
        wk_col = column_mapping.get('stays_week_nights')
        
        df['stays_weekend_nights'] = pd.to_numeric(df[wknd_col], errors='coerce').fillna(0).astype(int) if wknd_col else 0
        df['stays_week_nights'] = pd.to_numeric(df[wk_col], errors='coerce').fillna(1).astype(int) if wk_col else 1
        df['total_nights'] = df['stays_weekend_nights'] + df['stays_week_nights']
        df['total_nights'] = df['total_nights'].apply(lambda n: max(1, n))

        # 6. Cancellation & Booking Status Validation
        cancel_col = column_mapping.get('is_canceled')
        status_col = column_mapping.get('booking_status')

        if cancel_col and cancel_col in df.columns:
            df['is_canceled'] = pd.to_numeric(df[cancel_col], errors='coerce').fillna(0).astype(int)
        elif status_col and status_col in df.columns:
            df['is_canceled'] = df[status_col].astype(str).str.lower().apply(
                lambda s: 1 if any(x in s for x in ['cancel', 'no-show', 'noshow']) else 0
            )
        else:
            df['is_canceled'] = 0

        if not status_col or status_col not in df.columns:
            df['booking_status'] = df['is_canceled'].apply(lambda c: 'Canceled' if c == 1 else 'Confirmed')
        else:
            df['booking_status'] = df[status_col].astype(str)

        # 7. Room Revenue Calculation
        rev_col = column_mapping.get('room_revenue')
        if rev_col and rev_col in df.columns:
            df['room_revenue'] = pd.to_numeric(df[rev_col], errors='coerce').fillna(0.0)
        else:
            df['room_revenue'] = (df['adr'] * df['total_nights']).round(2)
        
        # If canceled, room revenue is 0
        df.loc[df['is_canceled'] == 1, 'room_revenue'] = 0.0

        # 8. Room Type, Customer Segment, Distribution Channel, Country
        room_col = column_mapping.get('room_type')
        df['room_type'] = df[room_col].astype(str).str.strip() if room_col else 'Standard'
        df['room_type'] = df['room_type'].replace({'': 'Standard', 'nan': 'Standard', 'None': 'Standard'})

        seg_col = column_mapping.get('customer_segment')
        df['customer_segment'] = df[seg_col].astype(str).str.strip() if seg_col else 'Leisure'
        df['customer_segment'] = df['customer_segment'].replace({'': 'Leisure', 'nan': 'Leisure', 'None': 'Leisure'})

        chan_col = column_mapping.get('distribution_channel')
        df['distribution_channel'] = df[chan_col].astype(str).str.strip() if chan_col else 'Direct'
        df['distribution_channel'] = df['distribution_channel'].replace({'': 'Direct', 'nan': 'Direct', 'None': 'Direct'})

        country_col = column_mapping.get('country')
        df['country'] = df[country_col].astype(str).str.strip() if country_col else 'Unknown'
        df['country'] = df['country'].replace({'': 'Unknown', 'nan': 'Unknown', 'None': 'Unknown'})

        adults_col = column_mapping.get('adults')
        children_col = column_mapping.get('children')
        df['adults'] = pd.to_numeric(df[adults_col], errors='coerce').fillna(1).astype(int) if adults_col else 1
        df['children'] = pd.to_numeric(df[children_col], errors='coerce').fillna(0).astype(int) if children_col else 0

        # Unique Booking ID
        if 'booking_id' not in df.columns:
            df['booking_id'] = [f"REV-{10000 + i}" for i in range(len(df))]

        return df, column_mapping, detected_fields

    @classmethod
    def audit_data_quality(cls, raw_df: pd.DataFrame, column_mapping: Dict[str, str]) -> Dict[str, Any]:
        """
        Audits data quality metrics: missing values, duplicates, invalid numerics,
        missing core fields, and Data Health Score.
        """
        total_rows = len(raw_df)
        total_cols = len(raw_df.columns)
        
        if total_rows == 0:
            return {
                'total_rows': 0, 'total_columns': 0, 'missing_values_count': 0,
                'missing_value_pct': 0.0, 'duplicate_rows': 0, 'invalid_numeric_count': 0,
                'missing_core_columns': CORE_EXPECTED_FIELDS, 'quality_score': 0.0,
                'columns_found': []
            }

        total_cells = total_rows * total_cols
        missing_cells = int(raw_df.isna().sum().sum())
        missing_pct = round((missing_cells / total_cells) * 100, 2) if total_cells > 0 else 0.0
        duplicate_rows = int(raw_df.duplicated().sum())

        invalid_numerics = 0
        numeric_cols = raw_df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            invalid_numerics += int(raw_df[col].isna().sum())
            if any(term in col.lower() for term in ['adr', 'rate', 'price', 'revenue']):
                invalid_numerics += int((raw_df[col] < 0).sum())

        missing_core = [
            field for field in CORE_EXPECTED_FIELDS
            if not column_mapping.get(field) or column_mapping[field].startswith('Synthesized')
        ]

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

    @classmethod
    def persist_to_database(
        cls,
        db: Session,
        mapped_df: pd.DataFrame,
        filename: str,
        quality_report: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Persists normalized data into PostgreSQL/SQLite database tables:
        hotels, room_types, customers, bookings, and data_uploads.
        """
        # 1. Get or Create Default Hotel
        hotel = db.query(Hotel).filter(Hotel.code == "REV-GRAND").first()
        if not hotel:
            hotel = Hotel(
                name="Grand RevIntel Resort & Spa",
                code="REV-GRAND",
                total_rooms=150,
                city="Miami",
                country="USA",
                currency="USD"
            )
            db.add(hotel)
            db.commit()
            db.refresh(hotel)

        # 2. Upsert Room Types
        unique_rooms = mapped_df['room_type'].dropna().unique()
        room_type_map = {}
        for r_name in unique_rooms:
            rt = db.query(RoomType).filter(RoomType.hotel_id == hotel.id, RoomType.name == str(r_name)).first()
            if not rt:
                rt = RoomType(
                    hotel_id=hotel.id,
                    code=str(r_name)[:10].upper(),
                    name=str(r_name),
                    base_price=120.0,
                    capacity=2
                )
                db.add(rt)
                db.commit()
                db.refresh(rt)
            room_type_map[str(r_name)] = rt.id

        # 3. Create or Match Customer Profiles
        unique_segments = mapped_df[['customer_segment', 'country']].drop_duplicates()
        customer_map = {}
        for _, row in unique_segments.iterrows():
            seg = str(row['customer_segment'])
            ctry = str(row['country'])
            key = f"{seg}_{ctry}"
            cust = db.query(Customer).filter(Customer.customer_type == seg, Customer.country == ctry).first()
            if not cust:
                cust = Customer(customer_type=seg, country=ctry)
                db.add(cust)
                db.commit()
                db.refresh(cust)
            customer_map[key] = cust.id

        # 4. Batch Insert Bookings (Chunks of 250 for high performance)
        bookings_to_insert = []
        for _, row in mapped_df.iterrows():
            key = f"{row['customer_segment']}_{row['country']}"
            cust_id = customer_map.get(key)
            rt_id = room_type_map.get(str(row['room_type']))

            arr_dt = datetime.strptime(row['arrival_date'], '%Y-%m-%d').date()
            book_dt = datetime.strptime(row['booking_date'], '%Y-%m-%d').date()

            b = Booking(
                hotel_id=hotel.id,
                booking_reference=str(row['booking_id']),
                customer_id=cust_id,
                room_type_id=rt_id,
                booking_date=book_dt,
                arrival_date=arr_dt,
                lead_time=int(row['lead_time']),
                adults=int(row['adults']),
                children=int(row['children']),
                stays_weekend_nights=int(row['stays_weekend_nights']),
                stays_week_nights=int(row['stays_week_nights']),
                total_nights=int(row['total_nights']),
                adr=float(row['adr']),
                room_revenue=float(row['room_revenue']),
                total_revenue=float(row['room_revenue']),
                booking_status=str(row['booking_status']),
                is_canceled=bool(row['is_canceled']),
                market_segment=str(row['customer_segment']),
                distribution_channel=str(row['distribution_channel'])
            )
            bookings_to_insert.append(b)

        # Bulk save
        chunk_size = 250
        for i in range(0, len(bookings_to_insert), chunk_size):
            db.bulk_save_objects(bookings_to_insert[i:i + chunk_size])
        db.commit()

        # 5. Record Data Upload Audit
        upload_record = DataUpload(
            hotel_id=hotel.id,
            filename=filename,
            file_size_bytes=0,
            rows_count=len(mapped_df),
            columns_count=len(mapped_df.columns),
            missing_values_pct=float(quality_report.get('missing_value_pct', 0.0)),
            duplicates_count=int(quality_report.get('duplicate_rows', 0)),
            quality_score=float(quality_report.get('quality_score', 100.0)),
            status="Processed & Saved to DB",
            uploaded_at=datetime.utcnow()
        )
        db.add(upload_record)
        db.commit()

        logger.info(f"Successfully persisted {len(bookings_to_insert)} bookings from '{filename}' into database.")

        return {
            "hotel_id": hotel.id,
            "hotel_name": hotel.name,
            "records_persisted": len(bookings_to_insert),
            "upload_audit_id": upload_record.id
        }
