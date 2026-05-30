import logging
import os
import pickle
import random
import re
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple

import numpy as np

logger = logging.getLogger(__name__)

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
os.makedirs(MODEL_DIR, exist_ok=True)

THREAT_REPORT_CATEGORIES = [
    "malware_analysis", "phishing_campaign", "apt_report", "ransomware_update",
    "vulnerability_disclosure", "threat_actor_profile", "cyber_espionage",
    "ddos_analysis", "iot_threats", "cloud_security",
]

SAMPLE_REPORTS = [
    "New phishing campaign targeting banking customers uses fake login pages to steal credentials",
    "APT group observed exploiting zero-day vulnerability in VPN appliances for initial access",
    "Ransomware variant encrypts files and exfiltrates data before triggering encryption",
    "Critical buffer overflow vulnerability discovered in widely-used DNS server software",
    "Botnet infrastructure identified using compromised IoT devices for DDoS attacks",
    "State-sponsored threat actors targeting critical infrastructure in energy sector",
    "New malware strain uses DLL side-loading technique to evade detection",
    "Supply chain attack compromising software update mechanism affects thousands of organizations",
    "Cloud infrastructure targeted by credential stuffing attacks using leaked passwords",
    "Trojan distributed via malicious email attachments uses PowerShell for execution",
]

ENTITY_PATTERNS = {
    "ip_address": r'\b(?:\d{1,3}\.){3}\d{1,3}\b',
    "domain": r'\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b',
    "url": r'https?://[^\s]+',
    "email": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
    "hash_md5": r'\b[a-fA-F0-9]{32}\b',
    "hash_sha1": r'\b[a-fA-F0-9]{40}\b',
    "hash_sha256": r'\b[a-fA-F0-9]{64}\b',
    "cve": r'CVE-\d{4}-\d{4,7}',
    "ipv6": r'\b(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}\b',
}

THREAT_ACTOR_KEYWORDS = {
    "state_sponsored": ["apt", "state-sponsored", "nation-state", "government", "military", "intelligence"],
    "cybercrime": ["cybercriminal", "ransomware group", "fraud", "scam", "carding", "dark web"],
    "hacktivist": ["hacktivist", "protest", "political", "ideological", "anonymous"],
    "insider": ["insider", "employee", "disgruntled", "internal"],
}


class NLPThreatIntel:
    def __init__(self):
        self.word_freq: Dict[str, float] = {}
        self.category_profiles: Dict[str, Dict[str, float]] = {}
        self.is_trained = False
        self.sentiment_lexicon = self._build_sentiment_lexicon()

    def _build_sentiment_lexicon(self) -> Dict[str, float]:
        negative = ["critical", "urgent", "severe", "dangerous", "malicious", "breach",
                    "compromise", "attack", "vulnerability", "exploit", "threat", "risk",
                    "damage", "loss", "theft", "leak", "exposure", "ransom", "worm",
                    "trojan", "backdoor", "bypass", "evasion", "steal", "phishing"]
        positive = ["secure", "protected", "resolved", "mitigated", "patched", "fixed",
                    "remediated", "defended", "safe", "stable", "recovered", "detected",
                    "prevented", "blocked", "contained", "updated", "compliant"]
        lexicon = {}
        for word in negative:
            lexicon[word.lower()] = -1.0
        for word in positive:
            lexicon[word.lower()] = 1.0
        return lexicon

    def train(self):
        logger.info("Initializing NLP threat intelligence module...")
        try:
            reports = SAMPLE_REPORTS + [f"Threat report {i}: " + self._generate_report() for i in range(50)]

            self.word_freq = {}
            for report in reports:
                words = self._tokenize(report)
                for word in words:
                    self.word_freq[word] = self.word_freq.get(word, 0) + 1

            total = sum(self.word_freq.values())
            self.word_freq = {k: v / total for k, v in self.word_freq.items()}

            self.category_profiles = {}
            for cat in THREAT_REPORT_CATEGORIES:
                cat_reports = [r for r in reports if hash(cat) % len(reports) == hash(r) % len(reports) % len(THREAT_REPORT_CATEGORIES)]
                profile = {}
                for report in cat_reports[:3]:
                    for word in self._tokenize(report):
                        profile[word] = profile.get(word, 0) + 1
                if profile:
                    total_w = sum(profile.values())
                    self.category_profiles[cat] = {k: v / total_w for k, v in profile.items()}

            self.is_trained = True
            logger.info(f"NLP threat intelligence initialized. Vocabulary size: {len(self.word_freq)}")
        except Exception as e:
            logger.error(f"Failed to initialize NLP module: {e}")
            self.is_trained = False

    def _tokenize(self, text: str) -> List[str]:
        text = text.lower()
        tokens = re.findall(r'\b[a-z]+\b', text)
        stopwords = {"the", "a", "an", "is", "are", "was", "were", "in", "on", "at",
                     "to", "for", "of", "and", "or", "by", "with", "from", "as", "be",
                     "has", "have", "been", "its", "it", "this", "that", "these", "those"}
        return [t for t in tokens if t not in stopwords and len(t) > 2]

    def _generate_report(self) -> str:
        templates = [
            "Analysis of {actor} activity targeting {target} using {technique}",
            "New {malware} variant identified with capabilities for {capability}",
            "{severity} vulnerability in {software} allows {impact}",
            "Threat actor group {group} observed conducting {operation} against {sector}",
            "Ongoing {campaign} campaign leverages {technique} for initial access",
        ]
        template = random.choice(templates)
        return template.format(
            actor=random.choice(["APT29", "Lazarus Group", "FIN7", "Wizard Spider", "UNC2452"]),
            target=random.choice(["government agencies", "financial institutions", "healthcare", "energy sector", "tech companies"]),
            technique=random.choice(["spear-phishing", "watering hole", "drive-by download", "exploit public app", "supply chain"]),
            malware=random.choice(["Emotet", "TrickBot", "Cobalt Strike", "PlugX", "QakBot"]),
            capability=random.choice(["credential theft", "lateral movement", "data exfiltration", "persistence", "C2 communication"]),
            severity=random.choice(["Critical", "High", "Medium"]),
            software=random.choice(["VPN appliance", "email server", "web application", "cloud service", "database"]),
            impact=random.choice(["RCE", "privilege escalation", "data exposure", "DoS"]),
            group=random.choice(["TA505", "Silent Librarian", "MuddyWater", "Charming Kitten", "APT41"]),
            operation=random.choice(["cyber espionage", "ransomware deployment", "credential harvesting", "data theft"]),
            sector=random.choice(["government", "finance", "healthcare", "defense", "technology"]),
            campaign=random.choice(["phishing", "malware distribution", "social engineering", "brute force"]),
        )

    def classify_threat_report(self, text: str) -> dict:
        if not self.is_trained:
            self.train()

        tokens = self._tokenize(text)
        scores = {}
        for category, profile in self.category_profiles.items():
            score = sum(profile.get(t, 0) for t in tokens) / max(len(tokens), 1)
            score *= random.uniform(0.8, 1.2)
            scores[category] = max(0, score)

        best_category = max(scores, key=scores.get) if scores else "unknown"
        confidence = min(scores.get(best_category, 0) * 5, 0.95)

        return {
            "category": best_category,
            "confidence": round(confidence, 4),
            "all_categories": {k: round(v, 4) for k, v in sorted(scores.items(), key=lambda x: x[1], reverse=True)[:5]},
            "model_status": "trained" if self.is_trained else "not_trained",
        }

    def extract_entities(self, text: str) -> dict:
        entities = {}
        for entity_type, pattern in ENTITY_PATTERNS.items():
            matches = re.findall(pattern, text)
            if matches:
                entities[entity_type] = list(set(matches))
        return entities

    def analyze_sentiment(self, text: str) -> dict:
        tokens = self._tokenize(text)
        if not tokens:
            return {"sentiment": "neutral", "score": 0.0, "confidence": 0.0}

        sentiment_scores = [self.sentiment_lexicon.get(t, 0) for t in tokens]
        avg_sentiment = np.mean(sentiment_scores) if sentiment_scores else 0.0
        normalized = float(np.tanh(avg_sentiment * 2))

        if normalized > 0.2:
            sentiment = "positive"
        elif normalized < -0.2:
            sentiment = "negative"
        else:
            sentiment = "neutral"

        return {
            "sentiment": sentiment,
            "score": round(normalized, 4),
            "confidence": round(min(abs(normalized) + 0.3, 0.95), 4),
            "key_indicators": {
                "threat_language": sum(1 for t in tokens if self.sentiment_lexicon.get(t, 0) < 0),
                "positive_language": sum(1 for t in tokens if self.sentiment_lexicon.get(t, 0) > 0),
            },
        }

    def find_similar_threats(self, text: str, top_k: int = 5) -> dict:
        tokens = self._tokenize(text)
        if not tokens:
            return {"matches": [], "query_vector": {}}

        query_freq = {t: 1 for t in tokens}

        scores = []
        for i, report in enumerate(SAMPLE_REPORTS):
            report_tokens = self._tokenize(report)
            common = set(query_freq.keys()) & set(report_tokens)
            similarity = len(common) / max(len(set(query_freq.keys()) | set(report_tokens)), 1)
            scores.append({
                "index": i,
                "report": report,
                "similarity": round(similarity, 4),
            })

        scores.sort(key=lambda x: x["similarity"], reverse=True)

        return {
            "matches": scores[:top_k],
            "total_corpus": len(SAMPLE_REPORTS),
            "query_summary": " ".join(tokens[:10]),
        }

    def summarize_threat_report(self, text: str, max_sentences: int = 3) -> dict:
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 20]

        if not sentences:
            return {"summary": text, "original_length": len(text), "compression_ratio": 1.0}

        scored = []
        for s in sentences:
            tokens = self._tokenize(s)
            rarity_score = sum(1 / max(self.word_freq.get(t, 0.001), 0.001) for t in tokens) / max(len(tokens), 1)
            length_score = min(len(tokens) / 20, 1)
            total_score = rarity_score * 0.6 + length_score * 0.4
            scored.append((s, total_score))

        scored.sort(key=lambda x: x[1], reverse=True)
        top_sentences = [s[0] for s in scored[:max_sentences]]

        summary = ". ".join(top_sentences) + "."
        if len(summary) > len(text):
            summary = text[:500] + "..."

        return {
            "summary": summary,
            "original_length": len(text),
            "summary_length": len(summary),
            "compression_ratio": round(len(summary) / max(len(text), 1), 2),
            "key_sentences": len(top_sentences),
        }

    def detect_language(self, text: str) -> dict:
        lang_patterns = {
            "english": r'\b(the|is|are|was|were|been|have|has|this|that|with|from|they|will|would|could|should|their|there)\b',
            "russian": r'\b(что|это|как|для|она|они|было|быть|тать|но|по|из|за|не|на|я|вы|ты|мы|его|ее)\b',
            "chinese": r'[\u4e00-\u9fff]',
            "arabic": r'[\u0600-\u06ff]',
            "spanish": r'\b(el|la|los|las|que|es|por|para|con|una|una|esta|este|como|más|pero|sus|han|era|son)\b',
        }

        scores = {}
        for lang, pattern in lang_patterns.items():
            matches = len(re.findall(pattern, text.lower()))
            if lang == "chinese":
                scores[lang] = matches
            else:
                scores[lang] = matches / max(len(self._tokenize(text)), 1)

        best_lang = max(scores, key=scores.get) if scores else "unknown"
        best_score = scores[best_lang]

        return {
            "detected_language": best_lang,
            "confidence": round(min(best_score * 2, 0.95), 4),
            "scores": {k: round(v, 4) for k, v in scores.items()},
        }


nlp_threat_intel = NLPThreatIntel()
