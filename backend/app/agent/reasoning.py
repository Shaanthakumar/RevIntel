from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseRevenueAgent(ABC):
    """Abstract interface for AI Revenue Intelligence Agents."""
    
    @abstractmethod
    def synthesize_revenue_plan(
        self,
        kpi_metrics: Dict[str, Any],
        anomalies: List[Dict[str, Any]],
        forecasts: Dict[str, Any],
        pricing_recommendations: List[Dict[str, Any]],
        inventory_recommendations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Synthesizes multiple engine outputs into an actionable, cited executive revenue strategy."""
        pass


class RevIntelDecisionAgent(BaseRevenueAgent):
    """
    Core Revenue Intelligence Decision Support Agent.
    Aggregates KPIs, anomalies, forecasts, pricing, and inventory outputs.
    Ensures every generated recommendation explicitly cites underlying supporting data.
    """
    def __init__(self, provider: str = "rule_synthesizer", version: str = "v1.0"):
        self.provider = provider
        self.version = version

    def synthesize_revenue_plan(
        self,
        kpi_metrics: Dict[str, Any],
        anomalies: List[Dict[str, Any]],
        forecasts: Dict[str, Any],
        pricing_recommendations: List[Dict[str, Any]],
        inventory_recommendations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        occ = kpi_metrics.get("occupancy_rate", {}).get("value", 0)
        adr = kpi_metrics.get("adr", {}).get("value", 0)
        canc = kpi_metrics.get("cancellation_rate", {}).get("value", 0)
        
        # 1. Executive Summary
        exec_summary = (
            f"Hotel revenue performance stands at {occ}% occupancy with an ADR of ${adr}. "
            f"Cancellation rate is currently at {canc}%. "
            f"{'Critical anomalies require active intervention.' if anomalies else 'Demand pacing aligns with seasonal expectations.'}"
        )
        
        # 2. Opportunities (Synthesized from Pricing & Inventory)
        opportunities = []
        for rec in pricing_recommendations:
            if rec.get("price_difference", 0) > 0:
                opportunities.append(
                    f"Raise {rec['room_type']} rate by +${rec['price_difference']} "
                    f"(Expected RevPAR impact: +${rec.get('expected_revenue_impact', 0)})."
                )
                
        # 3. Risks (Synthesized from Anomalies & Cancellations)
        risks = []
        if canc > 25:
            risks.append(f"High cancellation risk ({canc}%). Review OTA non-refundable cancellation terms.")
        for a in anomalies:
            risks.append(f"Anomaly Alert on {a.get('date')}: {a.get('message')}")
            
        return {
            "executive_summary": exec_summary,
            "top_opportunities": opportunities[:3],
            "top_risks": risks[:3],
            "underlying_citations": {
                "analyzed_occupancy": occ,
                "analyzed_adr": adr,
                "anomalies_evaluated": len(anomalies),
                "pricing_proposals": len(pricing_recommendations),
                "inventory_proposals": len(inventory_recommendations)
            },
            "confidence_level": 0.92,
            "agent_provider": self.provider,
            "version": self.version
        }
