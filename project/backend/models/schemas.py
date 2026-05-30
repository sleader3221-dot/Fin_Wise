from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Any
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, EmailStr, validator


class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()), description="Unique user identifier")
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    email: str = Field(..., description="Email address")
    full_name: str = Field(default="", description="Full name")
    role: str = Field(default="user", description="User role: user, admin, analyst")
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, examples=["jdoe"])
    email: str = Field(..., examples=["john@example.com"])
    password: str = Field(..., min_length=8, max_length=128, examples=["SecurePass123!"])
    full_name: str = Field(default="", max_length=100, examples=["John Doe"])


class UserLogin(BaseModel):
    username: str = Field(..., examples=["jdoe"])
    password: str = Field(..., examples=["SecurePass123!"])


class TokenResponse(BaseModel):
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer")
    expires_in: int = Field(default=3600, description="Token expiry in seconds")
    user: Optional[User] = None


class ThreatCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, examples=["SQL Injection Attack"])
    description: str = Field(..., examples=["Attempt to exploit SQL injection vulnerability in login endpoint"])
    severity: str = Field(default="medium", examples=["high", "medium", "low", "critical"])
    source_ip: Optional[str] = Field(default=None, examples=["192.168.1.100"])
    threat_type: str = Field(default="unknown", examples=["malware", "phishing", "ddos", "sql_injection", "xss"])
    target: Optional[str] = Field(default=None, examples=["api.example.com/login"])
    indicators: Optional[List[str]] = Field(default=None, examples=[["192.168.1.100", "malware.exe"]])


class Threat(ThreatCreate):
    id: str = Field(default_factory=lambda: str(uuid4()))
    status: str = Field(default="active")
    score: float = Field(default=0.0, ge=0.0, le=1.0)
    mitre_id: Optional[str] = Field(default=None)
    detected_at: datetime = Field(default_factory=datetime.utcnow)
    analyzed_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None


class ThreatAnalysis(BaseModel):
    threat_id: str
    analysis_results: dict
    recommended_actions: List[str] = Field(default=[])
    confidence_score: float = Field(default=0.0, ge=0.0, le=1.0)


class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    tx_hash: str = Field(..., examples=["0xabc123..."])
    from_address: str = Field(..., examples=["0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18"])
    to_address: str = Field(..., examples=["0x8Ba1f109551bD432803012645Ac136ddd64DBA72"])
    amount: float = Field(..., gt=0, description="Transaction amount in token units")
    token: str = Field(default="ETH", examples=["ETH", "USDT", "BTC"])
    chain: str = Field(default="ethereum", examples=["ethereum", "bsc", "polygon"])
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="pending", examples=["pending", "confirmed", "failed"])
    risk_score: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    category: Optional[str] = Field(default=None, examples=["defi", "nft", "cex", "bridge"])


class TransactionCreate(BaseModel):
    tx_hash: str = Field(..., examples=["0xabc123..."])
    from_address: str = Field(..., examples=["0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18"])
    to_address: str = Field(..., examples=["0x8Ba1f109551bD432803012645Ac136ddd64DBA72"])
    amount: float = Field(..., gt=0)
    token: str = Field(default="ETH")
    chain: str = Field(default="ethereum")


class Alert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    title: str = Field(..., description="Alert title")
    description: str = Field(..., description="Alert description")
    severity: str = Field(default="info", examples=["critical", "high", "medium", "low", "info"])
    category: str = Field(default="general", examples=["security", "fraud", "compliance", "system", "general"])
    source: str = Field(default="system", examples=["threat_intel", "blockchain", "fintech", "system"])
    status: str = Field(default="unread", examples=["unread", "read", "acknowledged", "resolved"])
    created_at: datetime = Field(default_factory=datetime.utcnow)
    acknowledged_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = None
    metadata: Optional[dict] = Field(default=None)


class AlertCreate(BaseModel):
    title: str = Field(..., max_length=200)
    description: str = Field(..., max_length=2000)
    severity: str = Field(default="info")
    category: str = Field(default="general")
    source: str = Field(default="system")


class RiskScore(BaseModel):
    overall_score: float = Field(..., ge=0.0, le=1.0, description="Overall risk score 0-1")
    factors: dict = Field(default={}, description="Risk factors breakdown")
    category: str = Field(default="general")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    recommendations: List[str] = Field(default=[])


class RiskAssessment(BaseModel):
    entity_id: str
    entity_type: str = Field(..., examples=["user", "transaction", "wallet", "contract"])
    risk_score: RiskScore
    historical_scores: Optional[List[float]] = None
    trend: str = Field(default="stable", examples=["improving", "stable", "deteriorating"])


class SmartContract(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    address: str = Field(..., examples=["0x1234..."])
    chain: str = Field(default="ethereum")
    name: Optional[str] = Field(default=None)
    bytecode_hash: Optional[str] = None
    source_code: Optional[str] = None
    compiler_version: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Vulnerability(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    name: str = Field(..., examples=["Reentrancy Attack"])
    severity: str = Field(..., examples=["critical", "high", "medium", "low", "informational"])
    category: str = Field(..., examples=["reentrancy", "access_control", "arithmetic", "unchecked_call"])
    description: str = Field(...)
    location: Optional[str] = Field(default=None, examples=["contract.sol:42"])
    recommendation: str = Field(...)
    cvss_score: Optional[float] = Field(default=None, ge=0.0, le=10.0)


class AuditResult(BaseModel):
    contract_id: str
    contract_address: str
    chain: str
    overall_risk: str = Field(..., examples=["low", "medium", "high", "critical"])
    risk_score: float = Field(..., ge=0.0, le=1.0)
    vulnerabilities: List[Vulnerability] = Field(default=[])
    gas_optimizations: List[dict] = Field(default=[])
    compliance_checks: dict = Field(default={})
    audited_at: datetime = Field(default_factory=datetime.utcnow)


class InsurancePolicy(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    policy_holder: str = Field(..., description="Policy holder name/address")
    asset_type: str = Field(..., examples=["crypto", "nft", "defi_position"])
    asset_value: float = Field(..., gt=0, description="Covered asset value in USD")
    premium: float = Field(..., gt=0, description="Annual premium in USD")
    coverage_amount: float = Field(..., gt=0, description="Coverage amount in USD")
    deductible: float = Field(default=0.0)
    status: str = Field(default="active", examples=["active", "expired", "claimed", "cancelled"])
    start_date: datetime = Field(default_factory=datetime.utcnow)
    end_date: Optional[datetime] = None
    risk_score: Optional[float] = Field(default=None)


class Claim(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    policy_id: str = Field(...)
    amount: float = Field(..., gt=0)
    description: str = Field(...)
    evidence: Optional[List[str]] = Field(default=None)
    status: str = Field(default="submitted", examples=["submitted", "under_review", "approved", "rejected"])
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = None
    approved_amount: Optional[float] = None
    rejection_reason: Optional[str] = None


class DashboardStats(BaseModel):
    total_threats: int = 0
    active_threats: int = 0
    blocked_attacks: int = 0
    total_transactions: int = 0
    flagged_transactions: int = 0
    total_alerts: int = 0
    unread_alerts: int = 0
    avg_risk_score: float = 0.0
    network_uptime: float = 99.9
    active_nodes: int = 0
    smart_contracts_audited: int = 0
    vulnerabilities_found: int = 0
    insurance_policies: int = 0
    total_claims: int = 0
    pending_claims: int = 0
    threat_trend: List[dict] = Field(default=[], description="Time-series threat data")
    transaction_volume: List[dict] = Field(default=[], description="Time-series transaction data")


class PredictionResult(BaseModel):
    prediction: Any
    confidence: float = Field(..., ge=0.0, le=1.0)
    model_name: str
    features_used: List[str] = Field(default=[])
    explanation: Optional[dict] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class FraudDetectionResult(BaseModel):
    transaction_id: str
    is_fraudulent: bool
    fraud_score: float = Field(..., ge=0.0, le=1.0)
    risk_factors: List[str] = Field(default=[])
    model_confidence: float = Field(..., ge=0.0, le=1.0)
    recommendation: str = Field(default="approve")


class ComplianceResult(BaseModel):
    entity_id: str
    checks: List[dict] = Field(default=[], description="List of compliance checks with results")
    overall_status: str = Field(..., examples=["compliant", "partially_compliant", "non_compliant"])
    score: float = Field(default=1.0, ge=0.0, le=1.0)
    violations: List[str] = Field(default=[])
    recommendations: List[str] = Field(default=[])


class NetworkStatus(BaseModel):
    status: str = Field(default="operational", examples=["operational", "degraded", "down"])
    active_nodes: int = 0
    total_nodes: int = 0
    avg_latency_ms: float = 0.0
    throughput_tps: float = 0.0
    connected_peers: int = 0
    block_height: Optional[int] = None
    gas_price_gwei: Optional[float] = None
    services: dict = Field(default={}, description="Per-service status")


class WebSocketMessage(BaseModel):
    type: str = Field(..., examples=["threat_alert", "transaction_update", "risk_update", "system_status"])
    data: dict = Field(default={})
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class PaginatedResponse(BaseModel):
    items: List[Any] = Field(default=[])
    total: int = 0
    page: int = 1
    page_size: int = 20
    total_pages: int = 0
