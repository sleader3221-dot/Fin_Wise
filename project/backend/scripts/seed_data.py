import json
import logging
import random
import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__))))

from api.auth import hash_password, fake_users_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SEED_USERS = [
    {"username": "admin", "email": "admin@shieldnet.io", "password": "Admin@1234", "full_name": "System Administrator", "role": "admin"},
    {"username": "analyst", "email": "analyst@shieldnet.io", "password": "Analyst@1234", "full_name": "Security Analyst", "role": "analyst"},
    {"username": "jdoe", "email": "john@shieldnet.io", "password": "User@1234", "full_name": "John Doe", "role": "user"},
    {"username": "asmith", "email": "alice@shieldnet.io", "password": "User@1234", "full_name": "Alice Smith", "role": "user"},
    {"username": "bob", "email": "bob@shieldnet.io", "password": "User@1234", "full_name": "Bob Johnson", "role": "user"},
]

SEED_THREATS = [
    {"title": "SQL Injection Attempt on API Gateway", "description": "Multiple SQL injection attempts detected from IP 185.220.101.x targeting the /api/v1/users endpoint with UNION-based payloads.", "severity": "high", "threat_type": "sql_injection", "source_ip": "185.220.101.45", "target": "api.shieldnet.io/v1/users"},
    {"title": "Phishing Campaign Targeting Employees", "description": "Spear-phishing emails impersonating IT department requesting password reset via malicious link. Campaign targeted 50+ employees.", "severity": "critical", "threat_type": "phishing", "source_ip": "91.121.87.34", "target": "mail.shieldnet.io"},
    {"title": "DDoS Attack on DNS Infrastructure", "description": "Amplification DDoS attack using DNS reflection targeting authoritative name servers. Traffic peaked at 120 Gbps.", "severity": "critical", "threat_type": "ddos", "source_ip": "103.238.225.12", "target": "ns1.shieldnet.io"},
    {"title": "XSS Vulnerability in Dashboard", "description": "Stored XSS vulnerability discovered in the analytics dashboard allowing injection of malicious scripts via unsanitized input fields.", "severity": "high", "threat_type": "xss", "source_ip": "45.33.32.156", "target": "dashboard.shieldnet.io"},
    {"title": "Ransomware Detection on Endpoint", "description": "Endpoint protection detected ransomware behavior on workstation DEV-042. File encryption activity blocked by EDR.", "severity": "critical", "threat_type": "ransomware", "source_ip": "10.0.1.42", "target": "workstation-dev-042"},
    {"title": "Brute Force Attack on SSH Servers", "description": "Coordinated brute force attack targeting SSH servers with common username/password combinations from distributed botnet.", "severity": "medium", "threat_type": "credential_access", "source_ip": "192.168.1.100", "target": "ssh-gateway.shieldnet.io"},
    {"title": "Malware Download Detected", "description": "User downloaded and executed trojan disguised as invoice PDF. Malware established C2 communication with known malicious domain.", "severity": "high", "threat_type": "malware", "source_ip": "10.0.2.15", "target": "mail-gateway"},
    {"title": "Data Exfiltration Attempt", "description": "Large outbound data transfer detected from database server to external IP during non-business hours. 50GB transferred.", "severity": "critical", "threat_type": "exfiltration", "source_ip": "10.0.0.50", "target": "db-primary.shieldnet.io"},
    {"title": "Supply Chain Vulnerability Scan", "description": "Dependency scanning revealed critical vulnerabilities in third-party libraries used by the authentication service.", "severity": "high", "threat_type": "vulnerability", "source_ip": "N/A", "target": "auth-service"},
    {"title": "Lateral Movement Detected", "description": "Suspicious lateral movement between internal servers using pass-the-hash technique detected by network monitoring.", "severity": "critical", "threat_type": "lateral_movement", "source_ip": "10.0.1.100", "target": "internal-network"},
]

SEED_TRANSACTIONS = [
    {"tx_hash": "0xabc123def456", "from_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18", "to_address": "0x8Ba1f109551bD432803012645Ac136ddd64DBA72", "amount": 15.5, "token": "ETH", "chain": "ethereum", "category": "defi_swap", "status": "confirmed"},
    {"tx_hash": "0xdef789abc012", "from_address": "0x1234567890abcdef1234567890abcdef12345678", "to_address": "0xabcdef1234567890abcdef1234567890abcdef12", "amount": 25000, "token": "USDT", "chain": "ethereum", "category": "cex_withdrawal", "status": "confirmed"},
    {"tx_hash": "0x111222333444", "from_address": "0xaaaabbbbccccddddeeeeffffgggghhhhiiiijjjj", "to_address": "0xkkkkllllmmmmnnnnooooppppqqqqrrrrsssstttt", "amount": 1.2, "token": "ETH", "chain": "polygon", "category": "nft_purchase", "status": "confirmed"},
    {"tx_hash": "0x555666777888", "from_address": "0x1111222233334444555566667777888899990000", "to_address": "0xaaaabbbbccccddddeeeeffffgggghhhhiiiijjjj", "amount": 5000, "token": "USDC", "chain": "arbitrum", "category": "bridge_transfer", "status": "pending"},
    {"tx_hash": "0x999000aaa111", "from_address": "0xbbbbccccddddeeeeffffgggghhhhiiiijjjjkkkk", "to_address": "0x2222333344445555666677778888999900001111", "amount": 0.5, "token": "ETH", "chain": "optimism", "category": "defi_swap", "status": "confirmed"},
    {"tx_hash": "0xbbb222ccc333", "from_address": "0x3333444455556666777788889999000011112222", "to_address": "0xccccddddeeeeffffgggghhhhiiiijjjjkkkkllll", "amount": 100, "token": "BNB", "chain": "bsc", "category": "cex_deposit", "status": "confirmed"},
    {"tx_hash": "0xddd444eee555", "from_address": "0x4444555566667777888899990000111122223333", "to_address": "0xddddeeeeffffgggghhhhiiiijjjjkkkkllllmmmm", "amount": 3.0, "token": "ETH", "chain": "ethereum", "category": "token_transfer", "status": "failed"},
    {"tx_hash": "0xfff666ggg777", "from_address": "0x5555666677778888999900001111222233334444", "to_address": "0xeeeeffffgggghhhhiiiijjjjkkkkllllmmmmnnnn", "amount": 75000, "token": "DAI", "chain": "polygon", "category": "defi_swap", "status": "confirmed"},
    {"tx_hash": "0xhhh888iii999", "from_address": "0x6666777788889999000011112222333344445555", "to_address": "0xffffgggghhhhiiiijjjjkkkkllllmmmmnnnnoooo", "amount": 0.1, "token": "ETH", "chain": "ethereum", "category": "nft_purchase", "status": "confirmed"},
    {"tx_hash": "0xjjj000kkk111", "from_address": "0x7777888899990000111122223333444455556666", "to_address": "0xaaaabbbbccccddddeeeeffffgggghhhhiiiijjjj", "amount": 32000, "token": "USDT", "chain": "bsc", "category": "cex_withdrawal", "status": "pending"},
]

SEED_ALERTS = [
    {"title": "Critical Vulnerability Detected", "description": "CVE-2024-21626 affecting container runtime requires immediate patching", "severity": "critical", "category": "security", "source": "threat_intel"},
    {"title": "Unusual Transaction Pattern", "description": "Wallet 0x742d...bD18 showing unusual accumulation pattern over last 24 hours", "severity": "high", "category": "fraud", "source": "blockchain"},
    {"title": "Suspicious Login Attempt", "description": "Multiple failed login attempts from unusual geographic location detected", "severity": "medium", "category": "security", "source": "system"},
    {"title": "Smart Contract Audit Completed", "description": "Audit of 0x1234...5678 found 3 high-severity vulnerabilities", "severity": "high", "category": "compliance", "source": "blockchain"},
    {"title": "KYC Verification Pending", "description": "User jdoe has incomplete KYC verification documents", "severity": "low", "category": "compliance", "source": "fintech"},
    {"title": "Compliance Check Failed", "description": "GDPR compliance check failed for user data processing workflow", "severity": "high", "category": "compliance", "source": "system"},
    {"title": "Network Anomaly Detected", "description": "Unusual outbound traffic pattern detected from internal subnet 10.0.2.0/24", "severity": "medium", "category": "security", "source": "threat_intel"},
    {"title": "Flash Loan Attack Attempt", "description": "Detected flash loan manipulation attempt on DeFi protocol integration", "severity": "critical", "category": "fraud", "source": "blockchain"},
    {"title": "Insurance Claim Submitted", "description": "New claim for policy POL-123456 requires review within 48 hours", "severity": "medium", "category": "general", "source": "fintech"},
    {"title": "System Health Warning", "description": "Database replication lag exceeding threshold at 15 seconds", "severity": "low", "category": "system", "source": "system"},
]

SEED_POLICIES = [
    {"policy_holder": "jdoe", "asset_type": "crypto", "asset_value": 50000, "premium": 1200, "coverage_amount": 40000, "status": "active"},
    {"policy_holder": "asmith", "asset_type": "nft", "asset_value": 25000, "premium": 800, "coverage_amount": 20000, "status": "active"},
    {"policy_holder": "bob", "asset_type": "defi_position", "asset_value": 100000, "premium": 3500, "coverage_amount": 80000, "status": "active"},
    {"policy_holder": "techcorp", "asset_type": "crypto", "asset_value": 500000, "premium": 15000, "coverage_amount": 400000, "status": "active"},
    {"policy_holder": "defifund", "asset_type": "defi_position", "asset_value": 1000000, "premium": 25000, "coverage_amount": 750000, "status": "expired"},
]


def seed_database():
    logger.info("=" * 50)
    logger.info("Seeding ShieldNet database with sample data...")
    logger.info("=" * 50)

    for user_data in SEED_USERS:
        hashed = hash_password(user_data["password"])
        fake_users_db[user_data["username"]] = {
            "username": user_data["username"],
            "email": user_data["email"],
            "password": hashed,
            "full_name": user_data["full_name"],
            "role": user_data["role"],
            "is_active": True,
            "created_at": datetime.utcnow().isoformat(),
        }
        logger.info(f"  Created user: {user_data['username']} ({user_data['role']})")

    global seeded_threats, seeded_transactions, seeded_alerts, seeded_policies
    seeded_threats = []
    for i, t in enumerate(SEED_THREATS):
        threat = t.copy()
        threat["id"] = f"THR-{datetime.utcnow().strftime('%Y%m%d')}-{1000+i}"
        threat["status"] = "active"
        threat["score"] = {"critical": 0.85, "high": 0.65, "medium": 0.40, "low": 0.20}.get(t["severity"], 0.5)
        threat["detected_at"] = (datetime.utcnow() - timedelta(hours=random.randint(1, 72))).isoformat()
        threat["indicators"] = [
            t["source_ip"],
            f"malware_{i}.exe" if t["threat_type"] == "malware" else f"phish_{i}.com" if t["threat_type"] == "phishing" else f"ioc_{i}.net",
        ]
        seeded_threats.append(threat)
    logger.info(f"  Created {len(seeded_threats)} sample threats")

    seeded_transactions = []
    for i, t in enumerate(SEED_TRANSACTIONS):
        tx = t.copy()
        tx["id"] = f"TX-{datetime.utcnow().strftime('%Y%m%d')}-{1000+i}"
        tx["timestamp"] = (datetime.utcnow() - timedelta(hours=random.randint(1, 48))).isoformat()
        tx["risk_score"] = round(random.uniform(0.05, 0.75), 4)
        seeded_transactions.append(tx)
    logger.info(f"  Created {len(seeded_transactions)} sample transactions")

    seeded_alerts = []
    for i, a in enumerate(SEED_ALERTS):
        alert = a.copy()
        alert["id"] = f"ALT-{datetime.utcnow().strftime('%Y%m%d')}-{1000+i}"
        alert["status"] = "unread" if i < 5 else "read"
        alert["created_at"] = (datetime.utcnow() - timedelta(hours=random.randint(1, 48))).isoformat()
        seeded_alerts.append(alert)
    logger.info(f"  Created {len(seeded_alerts)} sample alerts")

    seeded_policies = []
    for i, p in enumerate(SEED_POLICIES):
        policy = p.copy()
        policy["id"] = f"POL-{random.randint(100000, 999999)}"
        policy["start_date"] = (datetime.utcnow() - timedelta(days=random.randint(1, 180))).isoformat()
        policy["end_date"] = (datetime.utcnow() + timedelta(days=random.randint(1, 365))).isoformat()
        policy["risk_score"] = round(random.uniform(0.1, 0.6), 4)
        seeded_policies.append(policy)
    logger.info(f"  Created {len(seeded_policies)} sample insurance policies")

    logger.info("=" * 50)
    logger.info("Database seeding completed successfully!")
    logger.info("=" * 50)


def get_seeded_data():
    return {
        "users": list(fake_users_db.values()),
        "threats": seeded_threats if 'seeded_threats' in globals() else [],
        "transactions": seeded_transactions if 'seeded_transactions' in globals() else [],
        "alerts": seeded_alerts if 'seeded_alerts' in globals() else [],
        "policies": seeded_policies if 'seeded_policies' in globals() else [],
    }


seeded_threats = []
seeded_transactions = []
seeded_alerts = []
seeded_policies = []

if __name__ == "__main__":
    seed_database()
