from fastapi import APIRouter
from app.api.data import router as data_router
from app.api.hotels import router as hotels_router
from app.api.bookings import router as bookings_router
from app.api.kpis import router as kpis_router
from app.api.revenue import router as revenue_router
from app.api.analytics import router as analytics_router
from app.api.anomalies import router as anomalies_router
from app.api.forecasts import router as forecasts_router
from app.api.pricing import router as pricing_router
from app.api.inventory import router as inventory_router
from app.api.recommendations import router as recommendations_router
from app.api.agent import router as agent_router
from app.api.alerts import router as alerts_router

api_router = APIRouter(prefix="/api")

api_router.include_router(data_router)
api_router.include_router(hotels_router)
api_router.include_router(bookings_router)
api_router.include_router(kpis_router)
api_router.include_router(revenue_router)
api_router.include_router(analytics_router)
api_router.include_router(anomalies_router)
api_router.include_router(forecasts_router)
api_router.include_router(pricing_router)
api_router.include_router(inventory_router)
api_router.include_router(recommendations_router)
api_router.include_router(agent_router)
api_router.include_router(alerts_router)
