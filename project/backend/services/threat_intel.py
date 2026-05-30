import json
import logging
import random
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)

MITRE_ATTACK_MAP = {
    "malware": {"id": "T1204", "name": "User Execution", "tactic": "Execution"},
    "phishing": {"id": "T1566", "name": "Phishing", "tactic": "Initial Access"},
    "sql_injection": {"id": "T1190", "name": "Exploit Public-Facing Application", "tactic": "Initial Access"},
    "xss": {"id": "T1189", "name": "Drive-by Compromise", "tactic": "Initial Access"},
    "ddos": {"id": "T1498", "name": "Network Denial of Service", "tactic": "Impact"},
    "ransomware": {"id": "T1486", "name": "Data Encrypted for Impact", "tactic": "Impact"},
    "credential_access": {"id": "T1003", "name": "OS Credential Dumping", "tactic": "Credential Access"},
    "lateral_movement": {"id": "T1021", "name": "Remote Services", "tactic": "Lateral Movement"},
    "exfiltration": {"id": "T1048", "name": "Exfiltration Over Alternative Protocol", "tactic": "Exfiltration"},
    "command_and_control": {"id": "T1071", "name": "Application Layer Protocol", "tactic": "Command and Control"},
}

THREAT_FEEDS = [
    {"name": "AlienVault OTX", "type": "open", "reputation": 0.95},
    {"name": "Shodan", "type": "commercial", "reputation": 0.90},
    {"name": "VirusTotal", "type": "commercial", "reputation": 0.95},
    {"name": "AbuseIPDB", "type": "open", "reputation": 0.85},
    {"name": "MISP", "type": "community", "reputation": 0.88},
]

COMMON_MALWARE_HASHES = [
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "d41d8cd98f00b204e9800998ecf8427e",
    "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d",
]

SAMPLE_IO_PATTERNS = [
    {"type": "ip", "pattern": r"\b(?:\d{1,3}\.){3}\d{1,3}\b"},
    {"type": "domain", "pattern": r"\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b"},
    {"type": "hash", "pattern": r"\b[a-fA-F0-9]{32,64}\b"},
    {"type": "url", "pattern": r"https?://[^\s]+"},
]


class ThreatIntelService:
    def __init__(self):
        self.threat_cache: Dict[str, Any] = {}
        self.feed_simulations: List[dict] = []

    def collect_threat_data(self, source: Optional[str] = None) -> List[dict]:
        threats = []
        for _ in range(random.randint(3, 8)):
            threat_type = random.choice(list(MITRE_ATTACK_MAP.keys()))
            severity = random.choices(
                ["critical", "high", "medium", "low"],
                weights=[0.1, 0.25, 0.4, 0.25],
                k=1,
            )[0]
            mitre = MITRE_ATTACK_MAP[threat_type]
            threat = {
                "id": f"T-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{random.randint(1000,9999)}",
                "title": f"{severity.upper()} {threat_type.replace('_', ' ').title()} Detected",
                "description": f"Potential {threat_type.replace('_', ' ')} activity detected from source IP. "
                              f"Technique: {mitre['name']} ({mitre['id']}). Tactic: {mitre['tactic']}.",
                "threat_type": threat_type,
                "severity": severity,
                "mitre_id": mitre["id"],
                "mitre_technique": mitre["name"],
                "mitre_tactic": mitre["tactic"],
                "score": random.uniform(0.3, 0.95),
                "source_ip": f"{random.randint(1,255)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,255)}",
                "target": f"{random.choice(['api','app','db','cdn','gateway'])}.{random.choice(['shieldnet','example','demo'])}.com",
                "indicators": self._generate_indicators(threat_type),
                "status": "active",
                "detected_at": (datetime.utcnow() - timedelta(minutes=random.randint(1, 120))).isoformat(),
                "feed_source": random.choice(THREAT_FEEDS)["name"],
                "confidence": round(random.uniform(0.6, 0.99), 2),
            }
            threats.append(threat)
        return threats

    def analyze_threat(self, threat_data: dict) -> dict:
        threat_type = threat_data.get("threat_type", "unknown")
        mitre = MITRE_ATTACK_MAP.get(threat_type, {"id": "T1588", "name": "Obtain Capabilities", "tactic": "Resource Development"})

        iocs = self._extract_iocs(threat_data)
        enriched_iocs = self._enrich_iocs(iocs)
        score = self._calculate_threat_score(threat_data, enriched_iocs)
        correlated = self._correlate_threats(threat_data)

        return {
            "threat_id": threat_data.get("id", "unknown"),
            "analysis_timestamp": datetime.utcnow().isoformat(),
            "threat_type": threat_type,
            "mitre_attack": mitre,
            "severity": threat_data.get("severity", "medium"),
            "threat_score": round(score, 4),
            "risk_level": "critical" if score > 0.8 else "high" if score > 0.6 else "medium" if score > 0.3 else "low",
            "indicators": enriched_iocs,
            "correlation_results": correlated,
            "recommended_actions": self._generate_recommendations(threat_type, score),
            "ioc_count": len(enriched_iocs),
            "false_positive_probability": round(random.uniform(0.01, 0.15), 2),
        }

    def _generate_indicators(self, threat_type: str) -> List[str]:
        indicators = []
        indicators.append(f"{random.randint(1,255)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,255)}")
        if random.random() > 0.5:
            indicators.append(f"{random.choice(['evil','malicious','phish','bad','payload'])}.{random.choice(['com','net','org','xyz','top'])}")
        if random.random() > 0.6:
            indicators.append(random.choice(COMMON_MALWARE_HASHES))
        if threat_type == "phishing":
            indicators.append(f"https://{random.choice(['phish','login-secure','account-verify','support-update'])}.{random.choice(['com','net'])}/login")
        if threat_type == "malware":
            indicators.append(f"{random.choice(['trojan','backdoor','keylogger','dropper'])}.{random.choice(['exe','dll','vbs','ps1'])}")
        return indicators

    def _extract_iocs(self, data: dict) -> List[dict]:
        iocs = []
        text = json.dumps(data)

        for pattern_def in SAMPLE_IO_PATTERNS:
            matches = re.findall(pattern_def["pattern"], text)
            for match in matches[:5]:
                if match not in [i.get("value") for i in iocs]:
                    iocs.append({
                        "type": pattern_def["type"],
                        "value": match,
                        "found_in": "threat_data",
                    })
        return iocs

    def _enrich_iocs(self, iocs: List[dict]) -> List[dict]:
        enriched = []
        for ioc in iocs:
            enrichment = {
                "type": ioc["type"],
                "value": ioc["value"],
                "reputation": random.choice(["malicious", "suspicious", "unknown"]),
                "confidence": round(random.uniform(0.5, 0.99), 2),
                "first_seen": (datetime.utcnow() - timedelta(days=random.randint(1, 90))).isoformat(),
                "last_seen": datetime.utcnow().isoformat(),
                "tags": random.sample(["ransomware", "botnet", "phishing", "apt", "scanning", "malware"], k=random.randint(1, 3)),
                "geo": self._mock_geo_data(),
                "asn": f"AS{random.randint(1000, 65000)}",
            }
            if ioc["type"] == "domain":
                enrichment["whois"] = {
                    "registrar": random.choice(["GoDaddy", "Namecheap", "Cloudflare", "Name.com"]),
                    "creation_date": (datetime.utcnow() - timedelta(days=random.randint(1, 365))).isoformat(),
                }
            enriched.append(enrichment)
        return enriched

    def _mock_geo_data(self) -> dict:
        return {
            "country": random.choice(["RU", "CN", "US", "KR", "BR", "NG", "UA", "IR", "KP"]),
            "city": random.choice(["Moscow", "Beijing", "Lagos", "Seoul", "Sao Paulo", "Tehran"]),
            "latitude": round(random.uniform(-90, 90), 4),
            "longitude": round(random.uniform(-180, 180), 4),
        }

    def _calculate_threat_score(self, threat_data: dict, enriched_iocs: List[dict]) -> float:
        base_score = {"critical": 0.9, "high": 0.7, "medium": 0.4, "low": 0.2}.get(threat_data.get("severity", "medium"), 0.4)
        ioc_factor = min(len(enriched_iocs) * 0.05, 0.3)
        confidence = threat_data.get("confidence", 0.5)
        return min(base_score * 0.5 + ioc_factor * 0.2 + confidence * 0.3, 1.0)

    def _correlate_threats(self, threat: dict) -> dict:
        return {
            "related_threats_found": random.randint(0, 12),
            "correlation_score": round(random.uniform(0, 0.95), 2),
            "common_indicators": random.randint(0, 5),
            "campaign_overlap": random.random() > 0.7,
            "related_campaigns": random.sample(
                ["Operation ShadowHammer", "DarkHotel", "APT29", "Lazarus Group", "FIN7"],
                k=random.randint(0, 3),
            ) if random.random() > 0.5 else [],
        }

    def _generate_recommendations(self, threat_type: str, score: float) -> List[str]:
        recommendations = [
            "Block source IP at firewall",
            "Update IDS/IPS signatures",
            "Isolate affected systems",
            "Conduct forensic analysis",
            "Review access logs",
            "Enable additional logging",
            "Rotate compromised credentials",
            "Apply security patches",
            "Notify incident response team",
        ]
        if score > 0.7:
            recommendations.insert(0, "ESCALATE TO INCIDENT RESPONSE TEAM IMMEDIATELY")
        if threat_type == "phishing":
            recommendations.extend(["Send security awareness alert", "Takedown phishing domain"])
        elif threat_type == "malware":
            recommendations.extend(["Run full antivirus scan", "Check for persistence mechanisms", "Review scheduled tasks"])
        elif threat_type == "ddos":
            recommendations.extend(["Enable DDoS protection", "Rate limit endpoints", "Scale up infrastructure"])
        return recommendations[:7]

    def get_threat_feeds_status(self) -> List[dict]:
        return [
            {
                "name": feed["name"],
                "type": feed["type"],
                "status": random.choice(["connected", "connected", "connected", "degraded"]),
                "reputation": feed["reputation"],
                "last_update": (datetime.utcnow() - timedelta(minutes=random.randint(1, 30))).isoformat(),
                "indicators_received": random.randint(100, 50000),
            }
            for feed in THREAT_FEEDS
        ]


threat_intel_service = ThreatIntelService()
