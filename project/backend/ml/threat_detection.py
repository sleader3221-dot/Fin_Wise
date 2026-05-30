import json
import logging
import os
import pickle
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple

import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder

logger = logging.getLogger(__name__)

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
os.makedirs(MODEL_DIR, exist_ok=True)


class ThreatDetectionML:
    def __init__(self):
        self.anomaly_detector: Optional[IsolationForest] = None
        self.classifier: Optional[RandomForestClassifier] = None
        self.scaler: Optional[StandardScaler] = None
        self.label_encoder: Optional[LabelEncoder] = None
        self.is_trained = False
        self.feature_columns = [
            "severity_encoded", "source_ip_numeric", "target_numeric",
            "hour_of_day", "day_of_week", "has_indicators", "indicator_count",
            "threat_type_encoded", "confidence_score",
        ]

    def _synthetic_training_data(self, n_samples: int = 2000) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        np.random.seed(42)

        severities = {"low": 0, "medium": 1, "high": 2, "critical": 3}
        threat_types = ["malware", "phishing", "ddos", "sql_injection", "xss", "ransomware", "credential_access", "lateral_movement"]

        X = []
        y_anomaly = []
        y_class = []

        for _ in range(n_samples):
            severity = np.random.choice(list(severities.values()), p=[0.3, 0.35, 0.25, 0.1])
            threat_type = np.random.randint(0, len(threat_types))
            source_ip = np.random.randint(1, 1000)
            target = np.random.randint(1, 500)
            hour = np.random.randint(0, 24)
            day = np.random.randint(0, 7)
            has_iocs = np.random.randint(0, 2)
            ioc_count = np.random.poisson(3) if has_iocs else 0
            confidence = np.random.beta(2, 5)

            features = [severity, source_ip, target, hour, day, has_iocs, ioc_count, threat_type, confidence]

            is_anomaly = 0
            if severity >= 3 and ioc_count > 5:
                is_anomaly = 1
            elif threat_type in [0, 2, 5] and confidence > 0.8:
                is_anomaly = 1
            elif np.random.random() < 0.05:
                is_anomaly = 1

            X.append(features)
            y_anomaly.append(is_anomaly)
            y_class.append(threat_type if is_anomaly else 0)

        return np.array(X), np.array(y_anomaly), np.array(y_class)

    def train(self):
        logger.info("Training threat detection ML models...")
        try:
            X, y_anomaly, y_class = self._synthetic_training_data(3000)

            self.scaler = StandardScaler()
            X_scaled = self.scaler.fit_transform(X)

            self.anomaly_detector = IsolationForest(
                n_estimators=200,
                contamination=0.08,
                random_state=42,
                n_jobs=-1,
            )
            self.anomaly_detector.fit(X_scaled)

            self.classifier = RandomForestClassifier(
                n_estimators=150,
                max_depth=15,
                min_samples_split=5,
                class_weight="balanced",
                random_state=42,
                n_jobs=-1,
            )

            y_class_masked = np.where(y_anomaly == 1, y_class, 0)
            self.classifier.fit(X_scaled, y_class_masked)

            self.label_encoder = LabelEncoder()
            threat_types = ["malware", "phishing", "ddos", "sql_injection", "xss", "ransomware", "credential_access", "lateral_movement"]
            self.label_encoder.fit(threat_types)

            self.is_trained = True
            logger.info("Threat detection models trained successfully")

            self._save_models()
        except Exception as e:
            logger.error(f"Failed to train threat detection models: {e}")
            raise

    def _save_models(self):
        try:
            with open(os.path.join(MODEL_DIR, "anomaly_detector.pkl"), "wb") as f:
                pickle.dump(self.anomaly_detector, f)
            with open(os.path.join(MODEL_DIR, "threat_classifier.pkl"), "wb") as f:
                pickle.dump(self.classifier, f)
            with open(os.path.join(MODEL_DIR, "scaler.pkl"), "wb") as f:
                pickle.dump(self.scaler, f)
        except Exception as e:
            logger.warning(f"Could not save models to disk: {e}")

    def _load_models(self):
        try:
            with open(os.path.join(MODEL_DIR, "anomaly_detector.pkl"), "rb") as f:
                self.anomaly_detector = pickle.load(f)
            with open(os.path.join(MODEL_DIR, "threat_classifier.pkl"), "rb") as f:
                self.classifier = pickle.load(f)
            with open(os.path.join(MODEL_DIR, "scaler.pkl"), "rb") as f:
                self.scaler = pickle.load(f)
            self.is_trained = True
            logger.info("Loaded pre-trained models from disk")
            return True
        except Exception:
            logger.info("No pre-trained models found, starting fresh")
            return False

    def _extract_features(self, threat_data: dict) -> np.ndarray:
        severities = {"low": 0, "medium": 1, "high": 2, "critical": 3}
        threat_types = ["malware", "phishing", "ddos", "sql_injection", "xss", "ransomware", "credential_access", "lateral_movement"]

        severity = severities.get(threat_data.get("severity", "medium"), 1)
        threat_type = threat_types.index(threat_data.get("threat_type", "malware")) if threat_data.get("threat_type", "malware") in threat_types else 0
        source_ip_str = threat_data.get("source_ip", "0.0.0.0")
        source_ip = sum(int(x) for x in source_ip_str.split(".")) if source_ip_str else 0
        target_str = threat_data.get("target", "")
        target = hash(target_str) % 1000 if target_str else 0

        now = datetime.utcnow()
        indicators = threat_data.get("indicators", [])
        confidence = threat_data.get("confidence", 0.5)

        features = [severity, source_ip, target, now.hour, now.weekday(),
                    int(len(indicators) > 0), min(len(indicators), 20),
                    threat_type, confidence]

        if self.scaler:
            try:
                return self.scaler.transform(np.array([features]))
            except Exception:
                return np.array([features])
        return np.array([features])

    def predict_threat_score(self, threat_data: dict) -> dict:
        if not self.is_trained:
            if not self._load_models():
                return {
                    "anomaly_score": 0.5,
                    "threat_type": threat_data.get("threat_type", "unknown"),
                    "threat_score": 0.5,
                    "is_anomaly": False,
                    "confidence": 0.5,
                    "model_status": "not_trained",
                    "warning": "Model not trained yet",
                }

        try:
            features = self._extract_features(threat_data)

            anomaly_score = float(self.anomaly_detector.score_samples(features)[0])
            is_anomaly = int(self.anomaly_detector.predict(features)[0]) == -1

            threat_class = int(self.classifier.predict(features)[0])
            threat_proba = self.classifier.predict_proba(features)
            confidence = float(np.max(threat_proba)) if threat_proba.shape[1] > 0 else 0.5

            threat_type = self.label_encoder.inverse_transform([threat_class])[0] if threat_class > 0 else threat_data.get("threat_type", "benign")

            normalized_anomaly = 1.0 / (1.0 + np.exp(-anomaly_score / 2))
            threat_score = min(1.0, normalized_anomaly * 0.6 + confidence * 0.4)

            return {
                "anomaly_score": round(normalized_anomaly, 4),
                "threat_type": threat_type,
                "threat_score": round(threat_score, 4),
                "is_anomaly": bool(is_anomaly),
                "confidence": round(confidence, 4),
                "model_status": "trained",
                "risk_level": "critical" if threat_score > 0.8 else "high" if threat_score > 0.6 else "medium" if threat_score > 0.3 else "low",
            }
        except Exception as e:
            logger.error(f"Error in threat prediction: {e}")
            return {
                "anomaly_score": 0.5,
                "threat_type": threat_data.get("threat_type", "unknown"),
                "threat_score": 0.5,
                "is_anomaly": False,
                "confidence": 0.5,
                "model_status": "error",
                "error": str(e),
            }

    def get_feature_importance(self) -> List[dict]:
        if not self.classifier:
            return []
        importances = self.classifier.feature_importances_
        return [
            {"feature": name, "importance": round(float(imp), 4)}
            for name, imp in sorted(zip(self.feature_columns, importances), key=lambda x: x[1], reverse=True)
        ]


threat_detection_ml = ThreatDetectionML()
