import hashlib
import json
import logging
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)

CHAIN_CONFIGS = {
    "ethereum": {"rpc": "https://eth-mainnet.g.alchemy.com/v2/demo", "chain_id": 1, "native_token": "ETH"},
    "bsc": {"rpc": "https://bsc-dataseed.binance.org", "chain_id": 56, "native_token": "BNB"},
    "polygon": {"rpc": "https://polygon-rpc.com", "chain_id": 137, "native_token": "MATIC"},
    "avalanche": {"rpc": "https://api.avax.network/ext/bc/C/rpc", "chain_id": 43114, "native_token": "AVAX"},
    "arbitrum": {"rpc": "https://arb1.arbitrum.io/rpc", "chain_id": 42161, "native_token": "ETH"},
    "optimism": {"rpc": "https://mainnet.optimism.io", "chain_id": 10, "native_token": "ETH"},
}

VULNERABILITY_PATTERNS = [
    {
        "name": "Reentrancy Attack",
        "severity": "critical",
        "category": "reentrancy",
        "description": "External call to untrusted contract allows recursive calls that can drain funds. The contract does not follow the checks-effects-interactions pattern.",
        "recommendation": "Use ReentrancyGuard from OpenZeppelin. Always update state before making external calls.",
        "cvss_base": 8.5,
        "solidity_pattern": "call.value(){}()",
    },
    {
        "name": "Unchecked External Call",
        "severity": "high",
        "category": "unchecked_call",
        "description": "External call return value is not checked, which can lead to unexpected behavior if the call fails silently.",
        "recommendation": "Always check return values of external calls. Use the Checks-Effects-Interactions pattern.",
        "cvss_base": 7.5,
        "solidity_pattern": ".call{value:",
    },
    {
        "name": "Integer Overflow/Underflow",
        "severity": "high",
        "category": "arithmetic",
        "description": "Unchecked arithmetic operations can overflow or underflow, leading to incorrect token balances.",
        "recommendation": "Use OpenZeppelin SafeMath or Solidity 0.8+ built-in overflow checks.",
        "cvss_base": 7.5,
        "solidity_pattern": "+= -= *= /=",
    },
    {
        "name": "Flash Loan Attack Vector",
        "severity": "high",
        "category": "flash_loan",
        "description": "Contract is vulnerable to flash loan manipulation due to reliance on spot price from a single DEX.",
        "recommendation": "Use TWAP or multiple oracle sources. Implement minimum price deviation checks.",
        "cvss_base": 7.0,
        "solidity_pattern": "getReserve",
    },
    {
        "name": "Access Control Vulnerability",
        "severity": "critical",
        "category": "access_control",
        "description": "Critical functions lack proper access control, allowing unauthorized users to execute administrative operations.",
        "recommendation": "Implement Ownable pattern from OpenZeppelin. Use role-based access control (RBAC).",
        "cvss_base": 9.0,
        "solidity_pattern": "function.*public",
    },
    {
        "name": "Timestamp Dependence",
        "severity": "medium",
        "category": "timestamp",
        "description": "Contract uses block.timestamp as a source of randomness, which can be manipulated by miners.",
        "recommendation": "Use commit-reveal scheme or Chainlink VRF for randomness.",
        "cvss_base": 5.0,
        "solidity_pattern": "block.timestamp",
    },
    {
        "name": "Front-Running Vulnerability",
        "severity": "medium",
        "category": "front_running",
        "description": "Transaction ordering dependency allows MEV bots to front-run user transactions for profit.",
        "recommendation": "Use commit-reveal schemes, submarine sends, or Flashbots RPC.",
        "cvss_base": 5.5,
        "solidity_pattern": "pending",
    },
    {
        "name": "Uninitialized Proxy Pattern",
        "severity": "high",
        "category": "proxy",
        "description": "Proxy contract's implementation address can be initialized by anyone, allowing takeover of the contract.",
        "recommendation": "Use OpenZeppelin's TransparentUpgradeableProxy or UUPS pattern correctly.",
        "cvss_base": 8.0,
        "solidity_pattern": "delegatecall",
    },
]


class BlockchainService:
    def __init__(self):
        self.gas_price_cache: Dict[str, float] = {}
        self.mempool: List[dict] = []

    async def audit_smart_contract(self, address: str, chain: str = "ethereum", source_code: Optional[str] = None) -> dict:
        chain_config = CHAIN_CONFIGS.get(chain, CHAIN_CONFIGS["ethereum"])

        num_vulns = random.randint(2, 6)
        vulnerabilities = random.sample(VULNERABILITY_PATTERNS, k=min(num_vulns, len(VULNERABILITY_PATTERNS)))
        vuln_list = []
        for v in vulnerabilities:
            vuln_list.append({
                "id": f"VULN-{hashlib.md5(v['name'].encode()).hexdigest()[:8]}",
                "name": v["name"],
                "severity": v["severity"],
                "category": v["category"],
                "description": v["description"],
                "recommendation": v["recommendation"],
                "cvss_score": round(v["cvss_base"] + random.uniform(-0.5, 0.5), 1),
                "location": f"contract.sol:{random.randint(1, 500)}",
                "line_number": random.randint(1, 500),
            })

        severity_weights = {"low": 1, "medium": 2, "high": 3, "critical": 4}
        total_weight = sum(severity_weights.get(v["severity"], 1) for v in vuln_list)
        normalized_score = min(total_weight / (len(vuln_list) * 4) * 1.0, 1.0)

        if normalized_score > 0.7:
            overall_risk = "critical"
        elif normalized_score > 0.5:
            overall_risk = "high"
        elif normalized_score > 0.3:
            overall_risk = "medium"
        else:
            overall_risk = "low"

        return {
            "contract_address": address,
            "chain": chain,
            "chain_id": chain_config["chain_id"],
            "overall_risk": overall_risk,
            "risk_score": round(normalized_score, 4),
            "vulnerabilities": vuln_list,
            "vulnerability_count": len(vuln_list),
            "critical_count": sum(1 for v in vuln_list if v["severity"] == "critical"),
            "high_count": sum(1 for v in vuln_list if v["severity"] == "high"),
            "medium_count": sum(1 for v in vuln_list if v["severity"] == "medium"),
            "low_count": sum(1 for v in vuln_list if v["severity"] == "low"),
            "gas_optimizations": [
                {
                    "type": "unused_storage",
                    "description": "State variable 'owner' is never used",
                    "gas_saving_estimate": "~500 gas per tx",
                    "severity": "low",
                },
                {
                    "type": "inefficient_loop",
                    "description": "Loop can be optimized by caching array length",
                    "gas_saving_estimate": "~200 gas per iteration",
                    "severity": "medium",
                },
            ],
            "compliance_checks": {
                "erc20_compliant": random.random() > 0.2,
                "erc721_compliant": random.random() > 0.3,
                "openzeppelin_used": random.random() > 0.4,
            },
            "audited_at": datetime.utcnow().isoformat(),
        }

    async def analyze_transaction(self, tx_data: dict) -> dict:
        risk_score = random.uniform(0.05, 0.85)
        categories = ["defi_swap", "nft_purchase", "bridge_transfer", "cex_deposit", "cex_withdrawal", "token_transfer"]

        return {
            "tx_hash": tx_data.get("tx_hash", "0x" + hashlib.sha256(str(random.random()).encode()).hexdigest()[:40]),
            "from_address": tx_data.get("from_address", ""),
            "to_address": tx_data.get("to_address", ""),
            "amount": tx_data.get("amount", 0),
            "token": tx_data.get("token", "ETH"),
            "chain": tx_data.get("chain", "ethereum"),
            "risk_score": round(risk_score, 4),
            "risk_level": "high" if risk_score > 0.7 else "medium" if risk_score > 0.4 else "low",
            "category": random.choice(categories),
            "flags": self._generate_tx_flags(risk_score),
            "anonymity_score": round(random.uniform(0, 1), 2),
            "mixer_risk": random.random() > 0.85,
            "known_sanctioned": random.random() > 0.95,
            "estimated_gas_used": random.randint(21000, 500000),
            "gas_price_gwei": round(random.uniform(5, 200), 2),
            "analysis_timestamp": datetime.utcnow().isoformat(),
        }

    async def assess_wallet_risk(self, address: str) -> dict:
        return {
            "address": address,
            "overall_risk": round(random.uniform(0, 1), 4),
            "risk_level": random.choice(["low", "low", "low", "medium", "medium", "high", "critical"]),
            "transaction_count": random.randint(0, 10000),
            "unique_interactions": random.randint(0, 500),
            "first_seen": (datetime.utcnow() - timedelta(days=random.randint(1, 1000))).isoformat(),
            "last_active": datetime.utcnow().isoformat(),
            "portfolio_value_eth": round(random.uniform(0, 10000), 2),
            "token_holdings": random.randint(0, 20),
            "nft_holdings": random.randint(0, 50),
            "interactions_with_high_risk": random.randint(0, 10),
            "flagged_transactions": random.randint(0, 5),
            "tags": random.sample(["defi_user", "nft_collector", "whale", "bot", "cex_user"], k=random.randint(1, 3)),
        }

    def get_gas_prices(self) -> Dict[str, dict]:
        return {
            chain: {
                "slow": round(random.uniform(5, 30), 2),
                "standard": round(random.uniform(10, 60), 2),
                "fast": round(random.uniform(20, 150), 2),
                "urgent": round(random.uniform(50, 500), 2),
                "updated_at": datetime.utcnow().isoformat(),
            }
            for chain in CHAIN_CONFIGS.keys()
        }

    async def monitor_bridge(self, bridge_name: str) -> dict:
        return {
            "bridge_name": bridge_name,
            "status": random.choice(["active", "active", "active", "degraded"]),
            "total_value_locked_usd": round(random.uniform(1000000, 500000000), 2),
            "24h_volume_usd": round(random.uniform(100000, 50000000), 2),
            "pending_transactions": random.randint(0, 100),
            "avg_confirmation_time_minutes": round(random.uniform(1, 60), 1),
            "security_score": round(random.uniform(0.3, 0.98), 2),
            "audited": random.random() > 0.2,
            "known_vulnerabilities": random.randint(0, 3),
            "anomaly_detected": random.random() > 0.85,
        }

    async def defi_health_check(self, protocol: str) -> dict:
        return {
            "protocol": protocol,
            "status": random.choice(["healthy", "healthy", "healthy", "warning", "critical"]),
            "tvl_usd": round(random.uniform(1000000, 10000000000), 2),
            "24h_volume_usd": round(random.uniform(10000, 100000000), 2),
            "liquidity_score": round(random.uniform(0.1, 0.99), 2),
            "collateralization_ratio": round(random.uniform(1.1, 3.0), 2),
            "liquidation_threshold": round(random.uniform(0.7, 0.9), 2),
            "oracle_type": random.choice(["chainlink", "band", "tellora", "custom", "uniswap_twap"]),
            "oracle_manipulation_risk": round(random.uniform(0, 0.5), 2),
            "flash_loan_risk": round(random.uniform(0, 0.7), 2),
            "smart_contract_risk": round(random.uniform(0.1, 0.8), 2),
        }

    def _generate_tx_flags(self, risk_score: float) -> List[str]:
        flags = []
        if risk_score > 0.7:
            flags.append("high_value_transfer")
        if random.random() > 0.85:
            flags.append("known_mixer_interaction")
        if random.random() > 0.9:
            flags.append("sanctioned_address")
        if random.random() > 0.75:
            flags.append("unusual_time_pattern")
        if random.random() > 0.8:
            flags.append("rapid_round_trip")
        return flags


blockchain_service = BlockchainService()
