# RevIntel – AI-Driven Revenue Intelligence Agent for Hotel Revenue Management

RevIntel is a professional, modular AI-driven Revenue Intelligence system designed for hotel revenue management. The system transitions hotel revenue management from reactive historical reporting to proactive, explainable decision-support intelligence.

---

## 🌟 System Architecture & Design Principles

```
DATA LAYER (CSV, Excel, PMS)
      ↓
ANALYTICS & KPI ENGINE (Occupancy, ADR, RevPAR, Cancellations)
      ↓
STATISTICAL & ML ANOMALY DETECTION (Rolling Z-score, IQR)
      ↓
MACHINE LEARNING FORECASTING (Demand, Occupancy, ADR)
      ↓
DECISION OPTIMIZATION (Dynamic Pricing, Capacity Allocation)
      ↓
AI REVENUE AGENT (Executive Briefings, Metric Citations, Reasoning)
      ↓
PRESENTATION LAYER (React SaaS Dashboard with 13 Dedicated Modules)
```

---

## 🗂 Project Folder Structure

```
RevIntel/
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI Router endpoints (13 routers)
│   │   ├── models/           # SQLAlchemy ORM Models (18 normalized tables)
│   │   ├── schemas/          # Pydantic Request & Response DTOs
│   │   ├── services/         # Ingestion, Cleaning & Pipeline Services
│   │   ├── analytics/        # KPI & Analytics Calculations
│   │   ├── ml/               # Machine Learning & Forecasting Models
│   │   ├── agent/            # AI Revenue Agent reasoning & decision layer
│   │   ├── database/         # Session management, DB engine, and caching store
│   │   ├── utils/            # Settings, logger, configuration
│   │   └── main.py           # FastAPI entrypoint
│   ├── requirements.txt
│   └── run_backend.py
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI widgets
│   │   ├── pages/            # 13 Planned SaaS Route Pages
│   │   ├── charts/           # Recharts visualization modules
│   │   ├── layouts/          # MainLayout with SaaS sidebar
│   │   ├── services/         # Axios API clients
│   │   ├── App.jsx           # React Router DOM configuration
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── data/
│   ├── raw/                  # Uploaded raw CSV / Excel files
│   ├── processed/            # Cleaned data
│   └── sample/               # Built-in sample hotel datasets
│       └── hotel_bookings_sample.csv
│
├── models/                   # Serialized ML model artifacts (.pkl, .joblib)
├── tests/                    # Pytest test suite for business logic
├── docs/                     # Full system specifications
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   └── ROADMAP.md
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## 🚀 How to Run the Project Locally

### 1. Backend (Python FastAPI)
```bash
# In project root or backend/
pip install -r backend/requirements.txt
python backend/run_backend.py
```
*Backend API runs at: `http://127.0.0.1:8000` (Swagger UI: `http://127.0.0.1:8000/docs`)*

### 2. Frontend (React + Vite)
```bash
# In frontend/
cd frontend
npm install
npm run dev
```
*Frontend runs at: `http://localhost:3000`*

### 3. Run Unit Tests
```bash
pytest tests/ -v
```

---

## 🛣 Phase-by-Phase Implementation Roadmap

- **Phase 1**: Foundation + Data Pipeline (Ready for Implementation)
- **Phase 2**: Revenue KPI Engine + Dashboard
- **Phase 3**: Booking & Customer Analytics
- **Phase 4**: Anomaly Detection Engine
- **Phase 5**: Demand Forecasting
- **Phase 6**: Dynamic Pricing Recommendation
- **Phase 7**: Room Inventory Allocation
- **Phase 8**: Revenue Decision Engine
- **Phase 9**: AI Revenue Intelligence Agent
- **Phase 10**: Alerts + Explainability + Recommendation History
- **Phase 11**: Testing + Security + Performance
- **Phase 12**: Final UI Polish + Deployment + Documentation
