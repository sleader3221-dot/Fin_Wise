import logging
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)


class FintechService:
    def __init__(self):
        self.active_policies: List[dict] = []
        self.claims: List[dict] = []

    async def calculate_portfolio_risk(self, portfolio_data: dict) -> dict:
        total_value = portfolio_data.get("total_value", 100000)
        allocations = portfolio_data.get("allocations", {})

        risk_factors = {
            "market_volatility": random.uniform(0.1, 0.8),
            "concentration_risk": random.uniform(0.1, 0.9),
            "liquidity_risk": random.uniform(0.1, 0.6),
            "counterparty_risk": random.uniform(0.1, 0.5),
            "regulatory_risk": random.uniform(0.1, 0.7),
            "technology_risk": random.uniform(0.1, 0.6),
        }

        weights = {"market_volatility": 0.3, "concentration_risk": 0.2, "liquidity_risk": 0.15,
                   "counterparty_risk": 0.15, "regulatory_risk": 0.1, "technology_risk": 0.1}
        overall_risk = sum(risk_factors[k] * weights[k] for k in weights)

        var_95 = total_value * (overall_risk * 0.15)
        var_99 = total_value * (overall_risk * 0.25)

        return {
            "overall_risk_score": round(overall_risk, 4),
            "risk_level": "high" if overall_risk > 0.7 else "medium" if overall_risk > 0.4 else "low",
            "portfolio_value_usd": total_value,
            "risk_factors": risk_factors,
            "value_at_risk_95pct": round(var_95, 2),
            "value_at_risk_99pct": round(var_99, 2),
            "sharpe_ratio": round(random.uniform(0.5, 3.0), 2),
            "sortino_ratio": round(random.uniform(0.5, 2.5), 2),
            "max_drawdown_pct": round(random.uniform(5, 40), 1),
            "beta": round(random.uniform(0.5, 1.8), 2),
            "diversification_score": round(random.uniform(0.2, 0.95), 2),
            "recommendations": self._generate_portfolio_recommendations(overall_risk, allocations),
            "calculated_at": datetime.utcnow().isoformat(),
        }

    def _generate_portfolio_recommendations(self, risk: float, allocations: dict) -> List[str]:
        recs = []
        if risk > 0.7:
            recs.append("Reduce exposure to high-risk assets")
            recs.append("Increase stablecoin allocation")
            recs.append("Consider hedging with derivatives")
        elif risk > 0.4:
            recs.append("Rebalance to maintain target allocation")
            recs.append("Diversify across uncorrelated assets")
        else:
            recs.append("Consider increasing yield-generating positions")
        recs.append("Set stop-loss orders on volatile positions")
        recs.append("Review and update risk parameters monthly")
        return recs

    async def create_insurance_policy(self, policy_data: dict) -> dict:
        risk_score = random.uniform(0.1, 0.8)
        asset_value = policy_data.get("asset_value", 10000)
        premium_rate = 0.02 + (risk_score * 0.05)
        premium = max(50, asset_value * premium_rate)

        return {
            "id": f"POL-{random.randint(100000, 999999)}",
            "policy_holder": policy_data.get("policy_holder", ""),
            "asset_type": policy_data.get("asset_type", "crypto"),
            "asset_value": asset_value,
            "premium": round(premium, 2),
            "coverage_amount": policy_data.get("coverage_amount", asset_value * 0.8),
            "deductible": round(asset_value * 0.01, 2),
            "risk_score": round(risk_score, 4),
            "status": "active",
            "start_date": datetime.utcnow().isoformat(),
            "end_date": (datetime.utcnow() + timedelta(days=365)).isoformat(),
            "terms": [
                "Coverage is limited to smart contract failures and hacks",
                "Social engineering attacks are excluded",
                "Private key compromise is excluded",
                "Claim must be filed within 7 days of incident",
            ],
        }

    async def submit_claim(self, claim_data: dict) -> dict:
        approved = random.random() > 0.3
        return {
            "id": f"CLM-{random.randint(100000, 999999)}",
            "policy_id": claim_data.get("policy_id", ""),
            "amount": claim_data.get("amount", 0),
            "description": claim_data.get("description", ""),
            "status": "under_review",
            "submitted_at": datetime.utcnow().isoformat(),
            "estimated_approval_days": random.randint(3, 14),
            "preliminary_assessment": {
                "valid_claim": approved,
                "estimated_payout_pct": round(random.uniform(0.5, 1.0), 2) if approved else 0,
                "investigation_required": random.random() > 0.5,
            },
        }

    async def kyc_verify(self, user_data: dict) -> dict:
        passed = random.random() > 0.15
        return {
            "verified": passed,
            "verification_level": 2 if passed else 1,
            "identity_confidence": round(random.uniform(0.7, 0.99), 2) if passed else round(random.uniform(0.3, 0.6), 2),
            "checks_performed": [
                {"name": "identity_document_validation", "passed": passed or random.random() > 0.5},
                {"name": "liveness_check", "passed": passed},
                {"name": "aml_screening", "passed": passed or random.random() > 0.7},
                {"name": "pep_screening", "passed": passed or random.random() > 0.8},
                {"name": "sanctions_check", "passed": passed or random.random() > 0.9},
                {"name": "address_verification", "passed": passed or random.random() > 0.6},
            ],
            "risk_level": random.choice(["low", "low", "medium", "medium", "high"]) if not passed else "low",
            "verified_at": datetime.utcnow().isoformat(),
        }

    async def check_compliance(self, entity_data: dict, frameworks: List[str] = None) -> dict:
        if frameworks is None:
            frameworks = ["gdpr", "soc2", "pci-dss"]

        checks = []
        violations = []
        total_checks = 0
        passed_checks = 0

        framework_controls = {
            "gdpr": ["data_processing_consent", "right_to_access", "data_portability", "breach_notification", "data_minimization"],
            "soc2": ["access_controls", "encryption_at_rest", "encryption_in_transit", "audit_logging", "incident_response"],
            "pci-dss": ["firewall_configuration", "cardholder_data_protection", "access_control_measures", "network_monitoring", "security_testing"],
        }

        for framework in frameworks:
            fw_name = framework.lower()
            controls = framework_controls.get(fw_name, ["general_control"])
            for control in controls:
                total_checks += 1
                passed = random.random() > 0.2
                if passed:
                    passed_checks += 1
                else:
                    violations.append(f"{fw_name.upper()}: {control.replace('_', ' ').title()}")

                checks.append({
                    "framework": fw_name.upper(),
                    "control": control.replace("_", " ").title(),
                    "status": "passed" if passed else "failed",
                    "score": round(random.uniform(0.5, 1.0), 2) if passed else round(random.uniform(0.1, 0.4), 2),
                })

        overall_score = passed_checks / max(total_checks, 1)
        if overall_score >= 0.9:
            overall_status = "compliant"
        elif overall_score >= 0.7:
            overall_status = "partially_compliant"
        else:
            overall_status = "non_compliant"

        recommendations = [
            "Implement multi-factor authentication across all systems",
            "Enable comprehensive audit logging",
            "Conduct quarterly security assessments",
            "Update data retention policies",
            "Review third-party vendor compliance",
        ]

        return {
            "entity_id": entity_data.get("entity_id", "unknown"),
            "overall_status": overall_status,
            "score": round(overall_score, 4),
            "checks": checks,
            "violations": violations[:10],
            "recommendations": random.sample(recommendations, k=random.randint(2, 4)),
            "frameworks_assessed": frameworks,
            "assessed_at": datetime.utcnow().isoformat(),
        }

    async def detect_fraud(self, transaction_data: dict) -> dict:
        amount = transaction_data.get("amount", 0)
        risk_factors = []

        if amount > 10000:
            risk_factors.append("high_amount")
        if random.random() > 0.8:
            risk_factors.append("new_recipient")
        if random.random() > 0.7:
            risk_factors.append("unusual_velocity")
        if random.random() > 0.85:
            risk_factors.append("known_fraud_pattern")
        if random.random() > 0.8:
            risk_factors.append("geographic_mismatch")
        if amount > 50000 and random.random() > 0.3:
            risk_factors.append("structuring_attempt")

        fraud_score = min(sum(hash(f) % 10 * 0.02 for f in risk_factors) + random.uniform(0, 0.3), 1.0)
        is_fraudulent = fraud_score > 0.7

        return {
            "transaction_id": transaction_data.get("id", "unknown"),
            "is_fraudulent": is_fraudulent,
            "fraud_score": round(fraud_score, 4),
            "risk_factors": risk_factors,
            "model_confidence": round(random.uniform(0.7, 0.95), 2),
            "recommendation": "block" if is_fraudulent else "review" if fraud_score > 0.4 else "approve",
            "fraud_type": random.choice(["unauthorized_access", "account_takeover", "synthetic_identity", "payment_fraud", "money_laundering"]) if is_fraudulent else None,
            "analysis_timestamp": datetime.utcnow().isoformat(),
        }

    async def financial_health_score(self, profile_data: dict) -> dict:
        income = profile_data.get("income", 50000)
        expenses = profile_data.get("expenses", 30000)
        savings = profile_data.get("savings", 10000)
        debt = profile_data.get("debt", 5000)

        savings_ratio = savings / max(income, 1)
        debt_ratio = debt / max(income, 1)
        expense_ratio = expenses / max(income, 1)

        score = min(max(
            (savings_ratio * 30) +
            ((1 - debt_ratio) * 25) +
            ((1 - expense_ratio) * 25) +
            random.uniform(5, 15),
            0
        ), 100)

        return {
            "overall_score": round(score, 1),
            "grade": "A" if score >= 80 else "B" if score >= 60 else "C" if score >= 40 else "D" if score >= 20 else "F",
            "metrics": {
                "savings_ratio": round(savings_ratio, 2),
                "debt_to_income": round(debt_ratio, 2),
                "expense_to_income": round(expense_ratio, 2),
                "emergency_fund_months": round(savings / max(expenses / 12, 1), 1),
            },
            "risk_level": "low" if score >= 70 else "medium" if score >= 40 else "high",
            "recommendations": self._generate_financial_recommendations(score),
        }

    def _generate_financial_recommendations(self, score: float) -> List[str]:
        if score < 40:
            return [
                "Create an emergency fund covering 3-6 months of expenses",
                "Reduce non-essential spending",
                "Consider debt consolidation",
                "Explore additional income sources",
            ]
        elif score < 70:
            return [
                "Increase emergency fund to 6 months of expenses",
                "Diversify investment portfolio",
                "Review insurance coverage",
            ]
        return [
            "Consider advanced investment strategies",
            "Optimize tax efficiency",
            "Review portfolio rebalancing schedule",
        ]


fintech_service = FintechService()
