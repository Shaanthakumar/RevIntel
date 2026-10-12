# RevIntel – Normalized Database Schema

RevIntel defines **18 normalized database tables** managed via SQLAlchemy ORM in `backend/app/models/domain.py`.

---

## 1. Core Property & Inventory Tables

### `hotels`
Primary profile for each managed property.
- `id` (PK, Integer)
- `name` (String 150)
- `code` (String 50, Unique Index)
- `total_rooms` (Integer, Default 150)
- `city` (String 100)
- `country` (String 100)
- `currency` (String 10, Default "USD")
- `created_at` (DateTime)

### `room_types`
Configured room categories per hotel.
- `id` (PK, Integer)
- `hotel_id` (FK -> `hotels.id`)
- `code` (String 50) e.g., 'DLX', 'STE', 'STD'
- `name` (String 100)
- `base_price` (Float)
- `capacity` (Integer)
- `description` (Text)

### `rooms`
Physical room units.
- `id` (PK, Integer)
- `hotel_id` (FK -> `hotels.id`)
- `room_type_id` (FK -> `room_types.id`)
- `room_number` (String 20)
- `floor` (Integer)
- `status` (String 30: 'Available', 'Occupied', 'Maintenance')

---

## 2. Guests & Bookings Tables

### `customers`
Guest profiles for behavioral segmentation.
- `id` (PK, Integer)
- `customer_type` (String 50: 'Transient', 'Contract', 'Group')
- `country` (String 100)
- `email` (String 150)
- `phone` (String 50)
- `created_at` (DateTime)

### `bookings`
Transactional hotel reservation records.
- `id` (PK, Integer)
- `hotel_id` (FK -> `hotels.id`)
- `booking_reference` (String 100, Index)
- `customer_id` (FK -> `customers.id`)
- `room_type_id` (FK -> `room_types.id`)
- `booking_date` (Date, Index)
- `arrival_date` (Date, Index)
- `departure_date` (Date)
- `lead_time` (Integer)
- `adults`, `children`, `babies` (Integer)
- `stays_weekend_nights`, `stays_week_nights`, `total_nights` (Integer)
- `adr` (Float)
- `room_revenue`, `total_revenue` (Float)
- `booking_status` (String 50: 'Confirmed', 'Canceled', 'No-Show')
- `is_canceled` (Boolean, Index)
- `cancellation_date` (Date)
- `market_segment` (String 50)
- `distribution_channel` (String 50)
- `deposit_type` (String 50)
- `created_at` (DateTime)

### `booking_guests`
Individual guest occupants per booking.
- `id` (PK, Integer)
- `booking_id` (FK -> `bookings.id`)
- `guest_name` (String 150)
- `is_primary` (Boolean)
- `age_group` (String 20)

---

## 3. Operational & Analytics Metrics Tables

### `daily_hotel_metrics`
Aggregated property-level daily operational indicators.
- `id` (PK, Integer)
- `hotel_id` (FK -> `hotels.id`)
- `date` (Date, Index)
- `available_rooms`, `rooms_sold` (Integer)
- `occupancy_rate` (Float)
- `total_revenue`, `room_revenue` (Float)
- `adr`, `revpar` (Float)
- `bookings_count`, `cancellations_count` (Integer)
- `cancellation_rate`, `avg_lead_time` (Float)

### `daily_room_metrics`
Room-type level daily metrics.
- `id` (PK, Integer)
- `hotel_id`, `room_type_id` (FKs)
- `date` (Date, Index)
- `available_rooms`, `rooms_sold` (Integer)
- `occupancy_rate`, `adr`, `revenue` (Float)

### `revenue_metrics`
Periodic revenue metrics (daily, weekly, monthly).
- `id` (PK, Integer)
- `hotel_id` (FK)
- `metric_date` (Date)
- `period_type` (String 20)
- `metric_name` (String 50)
- `metric_value`, `previous_value`, `change_pct` (Float)

---

## 4. Machine Learning & Predictive Tables

### `forecasts`
Future time-series predictions.
- `id` (PK, Integer)
- `hotel_id` (FK)
- `target_date` (Date, Index)
- `forecast_type` (String 50: 'demand', 'occupancy', 'adr', 'revpar')
- `forecasted_value`, `lower_bound`, `upper_bound` (Float)
- `confidence_interval` (Float, Default 0.95)
- `model_name`, `model_version` (String)
- `created_at` (DateTime)

### `pricing_recommendations`
AI dynamic price proposals.
- `id` (PK, Integer)
- `recommendation_id` (String 100, Unique)
- `hotel_id` (FK)
- `room_type` (String 50)
- `target_date` (Date, Index)
- `current_adr`, `recommended_adr`, `price_difference`, `expected_revenue_impact` (Float)
- `reason` (Text)
- `supporting_metrics` (JSON)
- `confidence_score` (Float)
- `risk_level` (String 20: 'Low', 'Medium', 'High')
- `status` (String 20: 'Pending', 'Accepted', 'Rejected', 'Expired')
- `model_version` (String 50)
- `created_at` (DateTime)

### `inventory_recommendations`
Channel allocation proposals.
- `id` (PK, Integer)
- `recommendation_id` (String 100, Unique)
- `hotel_id` (FK)
- `room_type`, `channel` (String 50)
- `target_date` (Date)
- `allocated_rooms` (Integer)
- `allocation_pct` (Float)
- `strategy`, `rationale` (Text)
- `confidence_score` (Float)
- `status` (String 20)
- `created_at` (DateTime)

---

## 5. Anomaly Detection & AI Decision Support Tables

### `anomalies`
Statistical and ML detected events.
- `id` (PK, Integer)
- `hotel_id` (FK)
- `metric_name` (String 50)
- `anomaly_date` (Date, Index)
- `observed_value`, `expected_value`, `baseline_value`, `z_score` (Float)
- `severity` (String 20: 'warning', 'high', 'critical')
- `detection_method` (String 50)
- `explanation` (Text)
- `status` (String 20)
- `detected_at` (DateTime)

### `alerts`
Notification feed.
- `id` (PK, Integer)
- `hotel_id` (FK)
- `alert_type`, `title` (String)
- `message` (Text)
- `severity` (String 20: 'info', 'warning', 'critical')
- `is_read`, `is_resolved` (Boolean)
- `metadata_json` (JSON)
- `created_at` (DateTime)

### `agent_insights`
Structured insights generated by AI agent.
- `id` (PK, Integer)
- `hotel_id` (FK)
- `insight_type` (String 50)
- `title`, `summary`, `detailed_explanation` (Text)
- `supporting_metrics` (JSON)
- `confidence_level` (Float)
- `created_at` (DateTime)

### `recommendation_history`
Audit log for accepted/rejected recommendations.
- `id` (PK, Integer)
- `recommendation_id` (String 100, Index)
- `recommendation_type` (String 50)
- `old_status`, `new_status` (String 20)
- `action_taken_by` (String 100)
- `feedback_notes` (Text)
- `timestamp` (DateTime)

### `data_uploads`
Dataset ingestion logs.
- `id` (PK, Integer)
- `hotel_id` (FK)
- `filename` (String 255)
- `file_size_bytes`, `rows_count`, `columns_count`, `duplicates_count` (Integer)
- `missing_values_pct`, `quality_score` (Float)
- `status` (String 50)
- `uploaded_at` (DateTime)

### `users`
Authentication and RBAC profiles.
- `id` (PK, Integer)
- `username`, `email` (Unique String)
- `hashed_password` (String 255)
- `role` (String 50: 'admin', 'revenue_manager', 'viewer')
- `is_active` (Boolean)
- `created_at` (DateTime)
