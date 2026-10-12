# RevIntel – System Architecture & Design Specification

## 1. System Vision
RevIntel is an AI-driven Revenue Intelligence system for hotel revenue management. The system monitors operations, computes core revenue KPIs, analyzes booking behavior, detects statistical anomalies, forecasts future demand and occupancy, recommends dynamic room pricing, optimizes room inventory allocation, and generates actionable, explainable insights through an AI Revenue Agent.

---

## 2. Logical Layered Architecture

```
                    HOTEL TRANSACTIONAL DATA (CSV / Excel / PMS)
                                      |
                                      v
                        [DATA INGESTION & PIPELINE]
                         • Flexible Synonym Parser
                         • Date & Numeric Validation
                         • Missing Field Synthesis
                                      |
                                      v
                           [DATA QUALITY ENGINE]
                         • Health Scoring (0–100%)
                         • Duplicate & Outlier Auditing
                                      |
                                      v
                        [DATABASE (PostgreSQL / SQLite)]
                         • 18 Normalized Domain Tables
                                      |
            +-------------------------+-------------------------+
            |                         |                         |
            v                         v                         v
     [KPI ENGINE]            [ANALYTICS ENGINE]        [DATA QUALITY AUDIT]
     • Occupancy Rate         • Pace Analysis           • Validation Reports
     • ADR & RevPAR           • Channel Yield Matrix    • Ingestion History
     • Cancellation %         • Segment Contribution
            |                         |
            +-------------------------+
                         |
                         v
              [ANOMALY DETECTION ENGINE]
               • Rolling Mean + Std Dev (Z-score)
               • Interquartile Range (IQR) Outliers
                         |
                         v
             [DEMAND FORECASTING ENGINE]
               • Baseline: Seasonal Exponential Smoothing
               • ML: Prophet / SARIMAX / LSTM
                         |
            +------------+------------+
            |                         |
            v                         v
   [DYNAMIC PRICING ENGINE]   [INVENTORY ALLOCATION ENGINE]
   • Price Elasticity          • EMSR Heuristic / Nested Allocations
   • Market Compression        • Direct Channel Yield Protection
            |                         |
            +------------+------------+
                         |
                         v
            [REVENUE DECISION ENGINE]
             • Multi-Objective Optimization
             • Rule & Constraint Validation
                         |
                         v
           [AI REVENUE INTELLIGENCE AGENT]
             • Structured Metric Citations
             • Executive Summary & Risk/Opportunity Synthesis
             • Natural Language Explanations
                         |
                         v
      [PRESENTATION LAYER: REACT SAAS DASHBOARD]
       • 13 Professional Enterprise Routes
       • Recharts Interactive Visualizations
       • Actionable Recommendation Management
```

---

## 3. Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide Icons, React Router DOM.
- **Backend**: Python 3.11, FastAPI, Pydantic v2, Pydantic Settings.
- **Database & ORM**: SQLAlchemy 2.0 ORM with PostgreSQL (Production) / SQLite (Local Development).
- **Data Processing**: Pandas, NumPy.
- **Machine Learning**: Scikit-learn, Statsmodels, Prophet (planned Phase 5).
- **Decision & AI Layer**: Rule-based baseline with pluggable LLM interface (OpenAI, Anthropic, Gemini).
