from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseInsightEngine(ABC):
    """Abstract interface for RevIntel Revenue Intelligence engines."""
    
    @abstractmethod
    def generate_insights(self, kpi_data: Dict[str, Any], anomalies: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generates structured revenue insights and alerts."""
        pass


class RuleBasedInsightEngine(BaseInsightEngine):
    """
    Intelligent Data Insights Engine (Rule-based implementation).
    Analyzes processed hotel revenue KPIs, channel contributions, and trends 
    to produce actionable revenue insights.
    """

    def generate_insights(self, kpi_data: Dict[str, Any], anomalies: List[Dict[str, Any]]) -> Dict[str, Any]:
        kpis = kpi_data.get('kpis', {})
        charts = kpi_data.get('charts', {})
        timeline = charts.get('timeline', [])
        segments = charts.get('segment_analysis', [])
        channels = charts.get('channel_performance', [])
        
        insights = []
        strongest_period = None
        weakest_period = None

        if not kpis:
            return {
                'insights': [],
                'strongest_period': None,
                'weakest_period': None,
                'engine_type': 'Rule-Based Engine v1.0'
            }

        # 1. Occupancy & RevPAR Insights
        occ = kpis.get('occupancy_rate', {})
        occ_val = occ.get('value', 0)
        occ_change = occ.get('change_pct', 0)

        adr = kpis.get('adr', {})
        adr_val = adr.get('value', 0)
        adr_change = adr.get('change_pct', 0)

        revpar = kpis.get('revpar', {})
        revpar_val = revpar.get('value', 0)
        revpar_change = revpar.get('change_pct', 0)

        canc = kpis.get('cancellation_rate', {})
        canc_val = canc.get('value', 0)

        if occ_change > 5.0:
            insights.append({
                'category': 'Occupancy Growth',
                'type': 'positive',
                'title': 'Strong Occupancy Expansion',
                'description': f"Occupancy increased significantly by {occ_change}% during the selected period, reaching {occ_val}%."
            })
        elif occ_change < -5.0:
            insights.append({
                'category': 'Occupancy Drop',
                'type': 'warning',
                'title': 'Occupancy Softening',
                'description': f"Occupancy dropped by {abs(occ_change)}% compared to the previous baseline, settling at {occ_val}%."
            })

        # 2. Price Elasticity / ADR vs Occupancy
        if adr_change > 3.0 and occ_change < -3.0:
            insights.append({
                'category': 'Pricing Strategy',
                'type': 'info',
                'title': 'Rate Surge Compensation',
                'description': f"ADR increased (+{adr_change}%) while occupancy decreased ({occ_change}%). High ADR compensated for lower volume."
            })
        elif adr_change > 0 and occ_change > 0:
            insights.append({
                'category': 'Revenue Yield',
                'type': 'positive',
                'title': 'Dual Yield Growth',
                'description': f"Both ADR (+{adr_change}%) and Occupancy (+{occ_change}%) grew, lifting overall RevPAR to ${revpar_val}."
            })

        # 3. Cancellation Risk Alert
        if canc_val > 30.0:
            insights.append({
                'category': 'Cancellation Risk',
                'type': 'alert',
                'title': 'Unusually High Cancellation Rate',
                'description': f"Cancellation rate is critically high at {canc_val}%. Review non-refundable policy terms and booking lead times."
            })
        elif canc_val > 20.0:
            insights.append({
                'category': 'Cancellation Risk',
                'type': 'warning',
                'title': 'Moderate Cancellation Exposure',
                'description': f"Cancellation rate is elevated at {canc_val}%. Recommend monitoring OTA distribution channels."
            })

        # 4. Segment & Channel Dominance
        if segments:
            top_seg = max(segments, key=lambda x: x.get('bookings', 0))
            if top_seg.get('share_pct', 0) > 40:
                insights.append({
                    'category': 'Customer Concentration',
                    'type': 'info',
                    'title': f"High Concentration in {top_seg['segment']} Segment",
                    'description': f"The {top_seg['segment']} segment contributes {top_seg['share_pct']}% of all bookings (${top_seg['revenue']:,.2f} revenue)."
                })

        if channels:
            ota_chan = next((c for c in channels if c['channel'].upper() == 'OTA'), None)
            if ota_chan and ota_chan.get('share_pct', 0) > 45:
                insights.append({
                    'category': 'Channel Dependency',
                    'type': 'warning',
                    'title': 'Heavy OTA Channel Dependency',
                    'description': f"OTA channels drive {ota_chan['share_pct']}% of bookings. Consider direct booking incentive campaigns to save commission."
                })

        # 5. Identify Strongest & Weakest Revenue Days in Timeline
        if timeline:
            sorted_by_rev = sorted(timeline, key=lambda x: x['revenue'], reverse=True)
            strongest_period = sorted_by_rev[0]
            weakest_period = sorted_by_rev[-1]

            insights.append({
                'category': 'Revenue Peak',
                'type': 'positive',
                'title': 'Peak Revenue Day Identified',
                'description': f"Strongest single day was {strongest_period['date']} generating ${strongest_period['revenue']:,.2f} room revenue."
            })

        return {
            'insights': insights,
            'strongest_period': strongest_period,
            'weakest_period': weakest_period,
            'engine_type': 'Rule-Based Insight Engine (ML Agent Extensible)'
        }
