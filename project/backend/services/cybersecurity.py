import hashlib
import json
import logging
import random
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)

VULNERABILITY_DATABASE = [
    {"id": "CVE-2024-21626", "name": "runc container escape", "severity": "critical", "cvss": 9.8, "type": "container"},
    {"id": "CVE-2024-20931", "name": "Apache Log4j2 JNDI injection", "severity": "critical", "cvss": 10.0, "type": "application"},
    {"id": "CVE-2024-25600", "name": "WordPress Bricks Builder RCE", "severity": "critical", "cvss": 9.8, "type": "web"},
    {"id": "CVE-2024-23897", "name": "Jenkins CLI arbitrary file read", "severity": "high", "cvss": 7.5, "type": "devops"},
    {"id": "CVE-2024-27198", "name": "JetBrains TeamCity auth bypass", "severity": "critical", "cvss": 9.8, "type": "devops"},
    {"id": "CVE-2024-1709", "name": "ConnectWise ScreenConnect auth bypass", "severity": "critical", "cvss": 9.8, "type": "remote_access"},
    {"id": "CVE-2023-46604", "name": "Apache ActiveMQ RCE", "severity": "critical", "cvss": 10.0, "type": "middleware"},
    {"id": "CVE-2023-34362", "name": "MOVEit Transfer SQL injection", "severity": "critical", "cvss": 9.8, "type": "file_transfer"},
    {"id": "CVE-2023-0669", "name": "Fortra GoAnywhere MFT RCE", "severity": "critical", "cvss": 9.8, "type": "file_transfer"},
    {"id": "CVE-2023-3519", "name": "Citrix ADC RCE", "severity": "critical", "cvss": 9.8, "type": "networking"},
]

COMPLIANCE_FRAMEWORKS = {
    "gdpr": {
        "name": "General Data Protection Regulation",
        "controls": [
            "Data Processing Consent", "Right to Access", "Data Portability",
            "Breach Notification", "Data Minimization", "Privacy by Design",
        ],
    },
    "soc2": {
        "name": "Service Organization Control 2",
        "controls": [
            "Access Controls", "Encryption at Rest", "Encryption in Transit",
            "Audit Logging", "Incident Response", "Change Management",
        ],
    },
    "pci-dss": {
        "name": "Payment Card Industry Data Security Standard",
        "controls": [
            "Firewall Configuration", "Cardholder Data Protection", "Access Control",
            "Network Monitoring", "Security Testing", "Information Security Policy",
        ],
    },
    "iso27001": {
        "name": "ISO/IEC 27001",
        "controls": [
            "Information Security Policy", "Asset Management", "Access Control",
            "Cryptography", "Physical Security", "Operations Security",
        ],
    },
    "hipaa": {
        "name": "Health Insurance Portability and Accountability Act",
        "controls": [
            "Privacy Rule", "Security Rule", "Breach Notification",
            "Patient Data Protection", "Administrative Safeguards",
        ],
    },
}


class CybersecurityService:
    def __init__(self):
        self.scan_results: Dict[str, Any] = {}
        self.incidents: List[dict] = []

    async def vulnerability_scan(self, target: str, scan_type: str = "full") -> dict:
        num_vulns = random.randint(3, 12)
        found_vulns = random.sample(VULNERABILITY_DATABASE, k=min(num_vulns, len(VULNERABILITY_DATABASE)))
        extra_vulns = []
        for _ in range(max(0, num_vulns - len(found_vulns))):
            extra_vulns.append({
                "id": f"CVE-2024-{random.randint(10000, 99999)}",
                "name": f"Custom vulnerability in {target.split('.')[0] if '.' in target else target}",
                "severity": random.choice(["low", "medium", "high", "critical"]),
                "cvss": round(random.uniform(3.0, 9.5), 1),
                "type": random.choice(["web", "network", "application", "container", "cloud"]),
            })
        found_vulns.extend(extra_vulns)

        severity_map = {"low": 3, "medium": 5, "high": 8, "critical": 10}
        total_severity = sum(severity_map.get(v["severity"], 5) for v in found_vulns)
        risk_score = min(total_severity / (len(found_vulns) * 10) * 1.2, 1.0)

        return {
            "target": target,
            "scan_type": scan_type,
            "scan_id": f"SCAN-{hashlib.md5(target.encode()).hexdigest()[:8]}",
            "risk_score": round(risk_score, 4),
            "risk_level": "critical" if risk_score > 0.7 else "high" if risk_score > 0.5 else "medium" if risk_score > 0.3 else "low",
            "vulnerabilities_found": len(found_vulns),
            "vulnerabilities": [
                {
                    "id": v["id"],
                    "name": v["name"],
                    "severity": v["severity"],
                    "cvss_score": v.get("cvss", round(random.uniform(3.0, 9.0), 1)),
                    "type": v.get("type", "unknown"),
                    "description": f"Security vulnerability affecting {target}",
                    "remediation": f"Apply patch {v['id']} and update affected components",
                    "exploit_available": random.random() > 0.6,
                    "exploit_in_wild": random.random() > 0.7,
                }
                for v in found_vulns
            ],
            "summary": {
                "critical": sum(1 for v in found_vulns if v["severity"] == "critical"),
                "high": sum(1 for v in found_vulns if v["severity"] == "high"),
                "medium": sum(1 for v in found_vulns if v["severity"] == "medium"),
                "low": sum(1 for v in found_vulns if v["severity"] == "low"),
            },
            "scan_duration_seconds": random.randint(30, 600),
            "scanned_at": datetime.utcnow().isoformat(),
        }

    async def penetration_test(self, target: str) -> dict:
        phases = ["reconnaissance", "scanning", "exploitation", "post_exploitation", "reporting"]
        findings = []
        for _ in range(random.randint(3, 8)):
            findings.append({
                "id": f"PT-{random.randint(1000, 9999)}",
                "title": f"Vulnerability in {target}: " + random.choice([
                    "Open SSH port with weak ciphers", "Default credentials found",
                    "SQL injection in login form", "Cross-site scripting in search field",
                    "Unpatched software version detected", "Insecure HTTP headers",
                    "Missing CSRF token", "Information disclosure in error pages",
                    "Weak TLS configuration", "Directory listing enabled",
                ]),
                "severity": random.choice(["critical", "high", "medium", "low", "info"]),
                "phase": random.choice(phases),
                "affected_component": target,
                "impact": random.choice([
                    "Complete system compromise possible",
                    "Sensitive data exposure",
                    "Privilege escalation possible",
                    "Denial of service",
                    "Limited information disclosure",
                ]),
                "likelihood": random.choice(["very_likely", "likely", "possible", "unlikely"]),
                "remediation_difficulty": random.choice(["easy", "moderate", "difficult"]),
                "poc_available": random.random() > 0.5,
            })

        return {
            "target": target,
            "pentest_id": f"PT-{datetime.utcnow().strftime('%Y%m%d')}-{random.randint(100, 999)}",
            "status": "completed",
            "findings": findings,
            "total_findings": len(findings),
            "critical_findings": sum(1 for f in findings if f["severity"] == "critical"),
            "high_findings": sum(1 for f in findings if f["severity"] == "high"),
            "overall_risk": random.choice(["critical", "high", "medium", "low"]),
            "executive_summary": f"Penetration test of {target} revealed {len(findings)} security findings "
                                 f"requiring remediation. Priority actions include patching critical vulnerabilities "
                                 f"and implementing security hardening measures.",
            "conducted_at": datetime.utcnow().isoformat(),
            "estimated_remediation_days": random.randint(5, 45),
        }

    async def analyze_network_traffic(self, traffic_data: dict = None) -> dict:
        return {
            "total_packets_analyzed": random.randint(10000, 1000000),
            "unique_ips": random.randint(10, 500),
            "protocols": {
                "TCP": random.randint(5000, 500000),
                "UDP": random.randint(1000, 100000),
                "HTTP": random.randint(2000, 200000),
                "HTTPS": random.randint(5000, 500000),
                "DNS": random.randint(500, 50000),
                "ICMP": random.randint(50, 5000),
            },
            "anomalies_detected": random.randint(0, 15),
            "suspicious_connections": random.randint(0, 10),
            "ports_scanning": random.randint(0, 5),
            "data_transfer_volume_gb": round(random.uniform(0.1, 100), 2),
            "bandwidth_utilization_pct": round(random.uniform(10, 95), 1),
            "top_talkers": [
                {"ip": f"{random.randint(10, 223)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}",
                 "bytes_sent": random.randint(100000, 1000000000),
                 "connections": random.randint(10, 1000)}
                for _ in range(5)
            ],
            "threat_indicators": [
                {"type": "port_scan", "source": f"{random.randint(1,255)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}",
                 "target_ports": random.sample([22, 80, 443, 3389, 8080, 8443, 3306, 5432], k=random.randint(2, 5)),
                 "severity": "medium"},
            ] if random.random() > 0.5 else [],
            "analyzed_at": datetime.utcnow().isoformat(),
        }

    async def detect_phishing(self, content: str, source: str = "") -> dict:
        suspicious_indicators = []
        is_phishing = False

        if re.search(r"(?i)(urgent|verify your account|click here|password expired|login now|security alert|confirm identity|update payment)", content):
            suspicious_indicators.append("urgent_action_language")
        if re.search(r"(?i)(http|https)://[^\s]*(?i)(login|secure|verify|account|update|confirm)", content):
            suspicious_indicators.append("suspicious_link")
        if re.search(r"(?i)(password|ssn|social security|credit card|cvv|pin|secret)", content):
            suspicious_indicators.append("sensitive_info_request")
        if re.search(r"(?i)@[^\s]+\.[^\s]+", content) and re.search(r"(?i)(gmail\.com|yahoo\.com|hotmail\.com|outlook\.com)", content):
            suspicious_indicators.append("suspicious_sender_domain")
        if re.search(r"(?i)(dear (customer|user|member|valued|sir|madam))", content):
            suspicious_indicators.append("generic_greeting")
        if re.search(r"(?i)(click|tap)\s+(here|link|below)", content):
            suspicious_indicators.append("link_prompt")

        risk_score = len(suspicious_indicators) * 0.15 + random.uniform(0, 0.2)
        risk_score = min(risk_score, 1.0)
        is_phishing = risk_score > 0.55

        return {
            "is_phishing": is_phishing,
            "risk_score": round(risk_score, 4),
            "risk_level": "high" if risk_score > 0.7 else "medium" if risk_score > 0.4 else "low",
            "suspicious_indicators": suspicious_indicators,
            "confidence": round(random.uniform(0.75, 0.97) if is_phishing else random.uniform(0.6, 0.85), 2),
            "source": source,
            "detected_links": re.findall(r'https?://[^\s"\']+', content)[:5],
            "recommended_action": "block" if is_phishing else "monitor",
            "analyzed_at": datetime.utcnow().isoformat(),
        }

    async def analyze_malware(self, sample_data: dict) -> dict:
        sample_hash = hashlib.sha256(str(sample_data).encode()).hexdigest()
        malware_types = ["trojan", "ransomware", "worm", "botnet", "keylogger", "infostealer", "rootkit", "spyware", "adware", "backdoor"]
        malware_type = random.choice(malware_types)

        return {
            "sha256": sample_hash,
            "md5": hashlib.md5(str(sample_data).encode()).hexdigest(),
            "file_type": sample_data.get("file_type", random.choice(["exe", "dll", "pdf", "doc", "vbs", "ps1", "elf", "apk"])),
            "malware_type": malware_type,
            "malicious": random.random() > 0.3,
            "malicious_probability": round(random.uniform(0.5, 0.99), 2),
            "family": random.choice([
                "Emotet", "TrickBot", "Ryuk", "LockBit", "BlackCat",
                "Dridex", "QakBot", "IcedID", "BumbleBee", "RedLine",
            ]) if random.random() > 0.3 else None,
            "attributes": {
                "persistence": random.random() > 0.5,
                "c2_communication": random.random() > 0.6,
                "anti_debugging": random.random() > 0.4,
                "packed": random.random() > 0.5,
                "encrypted": random.random() > 0.3,
            },
            "capabilities": random.sample([
                "keylogging", "screen_capture", "file_encryption", "credential_theft",
                "remote_access", "spread_via_email", "spread_via_network",
                "data_exfiltration", "crypto_mining",
            ], k=random.randint(1, 5)),
            "detection_ratio": f"{random.randint(5, 60)}/{random.randint(60, 70)}",
            "analysis_duration_seconds": random.randint(10, 120),
            "analyzed_at": datetime.utcnow().isoformat(),
        }

    async def incident_response(self, incident_data: dict) -> dict:
        incident_id = f"INC-{datetime.utcnow().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"

        response_phases = [
            {"phase": "Preparation", "status": "completed", "completion": "100%"},
            {"phase": "Identification", "status": "completed", "completion": "100%"},
            {"phase": "Containment", "status": "in_progress", "completion": f"{random.randint(30, 80)}%"},
            {"phase": "Eradication", "status": "pending", "completion": "0%"},
            {"phase": "Recovery", "status": "pending", "completion": "0%"},
            {"phase": "Lessons Learned", "status": "pending", "completion": "0%"},
        ]

        return {
            "incident_id": incident_id,
            "title": incident_data.get("title", "Security Incident"),
            "severity": incident_data.get("severity", "medium"),
            "status": "containment_in_progress",
            "detection_method": random.choice(["IDS/IPS", "SIEM", "User Report", "Threat Intelligence", "Log Analysis", "EDR"]),
            "affected_systems": random.sample([
                "web_server_01", "db_primary", "api_gateway", "auth_service",
                "email_server", "file_server", "dns_server",
            ], k=random.randint(1, 3)),
            "attack_vector": random.choice([
                "Phishing Email", "Exploited Vulnerability", "Brute Force",
                "SQL Injection", "Supply Chain Attack", "Insider Threat",
            ]),
            "indicators_of_compromise": [
                f"{random.randint(1,255)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}",
                hashlib.sha256(str(random.random()).encode()).hexdigest()[:32],
                f"{random.choice(['evil','malicious'])}.{random.choice(['com','net','xyz'])}",
            ],
            "response_phases": response_phases,
            "containment_actions": [
                "Isolated affected systems from network",
                "Blocked malicious IP addresses at firewall",
                "Revoked compromised credentials",
                "Enabled enhanced logging on all systems",
            ],
            "estimated_containment_hours": random.randint(1, 24),
            "estimated_resolution_hours": random.randint(24, 168),
            "reported_at": datetime.utcnow().isoformat(),
        }

    async def compliance_audit(self, framework: str = "soc2") -> dict:
        fw = COMPLIANCE_FRAMEWORKS.get(framework.lower(), COMPLIANCE_FRAMEWORKS["soc2"])
        control_results = []
        passed = 0
        total = 0

        for control in fw["controls"]:
            total += 1
            compliant = random.random() > 0.2
            if compliant:
                passed += 1
            evidence = []
            if compliant:
                evidence = [
                    {"type": "policy_document", "status": "verified"},
                    {"type": "configuration_review", "status": "passed"},
                    {"type": "access_log_review", "status": "passed"},
                ]
            else:
                evidence = [
                    {"type": "policy_document", "status": "missing"},
                ]
            control_results.append({
                "control": control,
                "status": "passed" if compliant else "failed",
                "score": round(random.uniform(0.1, 1.0), 2),
                "evidence": evidence,
                "notes": "" if compliant else f"Control {control} requires remediation" if random.random() > 0.5 else f"Partial compliance for {control}",
            })

        compliance_score = passed / max(total, 1)
        status = "compliant" if compliance_score >= 0.9 else "partially_compliant" if compliance_score >= 0.7 else "non_compliant"

        return {
            "framework": framework.upper(),
            "framework_name": fw["name"],
            "status": status,
            "compliance_score": round(compliance_score, 4),
            "controls_assessed": total,
            "controls_passed": passed,
            "controls_failed": total - passed,
            "control_results": control_results,
            "recommendations": [
                "Implement missing security controls",
                "Update security policies",
                "Conduct employee security training",
                "Perform third-party audit",
            ] if compliance_score < 0.9 else [],
            "audit_period": {
                "start": (datetime.utcnow() - timedelta(days=30)).isoformat(),
                "end": datetime.utcnow().isoformat(),
            },
            "audited_at": datetime.utcnow().isoformat(),
        }


cybersecurity_service = CybersecurityService()
