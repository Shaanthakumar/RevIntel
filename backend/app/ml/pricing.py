from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BasePricingEngine(ABC):
    """Abstract interface for Dynamic Pricing Recommendation Engines."""
    
    @abstractmethod
    def evaluate_pricing(
        self,
        current_rates: Dict[str, float],
        forecast_occupancy: float,
        booking_pace: float,
        cancellation_rate: float,
        lead_time_days: int
    ) -> List[Dict[str, Any]]:
        """Generates dynamic price recommendations with rationale and expected impact."""
        pass


class RuleElasticityPricingEngine(BasePricingEngine):
    """
    Elasticity & Occupancy-threshold dynamic pricing engine.
    Establishes the transparent baseline before reinforcement learning / optimization in Phase 6.
    """
    def __init__(self, version: str = "v1.0"):
        self.version = version

    def evaluate_pricing(
        self,
        current_rates: Dict[str, float],
        forecast_occupancy: float,
        booking_pace: float,
        cancellation_rate: float,
        lead_time_days: int
    ) -> List[Dict[str, Any]]:
        recommendations = []
        for room_type, base_rate in current_rates.items():
            multiplier = 1.0
            reasons = []
            
            # High compression condition
            if forecast_occupancy > 80.0:
                multiplier += 0.15
                reasons.append(f"Forecast occupancy is high ({forecast_occupancy}%)")
            elif forecast_occupancy < 50.0 and lead_time_days < 7:
                multiplier -= 0.10
                reasons.append("Low forecast occupancy within 7-day pickup window")
                
            if booking_pace > 1.2:
                multiplier += 0.05
                reasons.append("Booking velocity +20% faster than historical baseline")
                
            rec_price = round(base_rate * multiplier, 2)
            diff = round(rec_price - base_rate, 2)
            
            recommendations.append({
                "room_type": room_type,
                "current_adr": base_rate,
                "recommended_adr": rec_price,
                "price_difference": diff,
                "expected_revenue_impact": round(diff * (forecast_occupancy * 0.8), 2),
                "reason": "; ".join(reasons) if reasons else "Rate maintained at baseline parity",
                "confidence_score": 0.85 if forecast_occupancy > 75 else 0.75,
                "risk_level": "Low" if abs(diff) < 30 else "Medium",
                "model_version": self.version
            })
        return recommendations
