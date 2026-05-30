import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/utils/api';

interface ThreatAnalysis {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  source: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface PredictionResult {
  prediction: string;
  probability: number;
  factors: Array<{ name: string; weight: number }>;
  timestamp: string;
}

interface AnalysisState {
  data: ThreatAnalysis | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

interface PredictionState {
  data: PredictionResult | null;
  loading: boolean;
  error: string | null;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry<any>>();

const TTL = {
  THREAT_ANALYSIS: 30000,
  PREDICTION: 15000,
  RECENT_THREATS: 10000,
};

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttl: number): void {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

export function useAIAnalysis(threatId?: string) {
  const [analysis, setAnalysis] = useState<AnalysisState>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const [prediction, setPrediction] = useState<PredictionState>({
    data: null,
    loading: false,
    error: null,
  });

  const [recentThreats, setRecentThreats] = useState<ThreatAnalysis[]>([]);
  const [recentThreatsLoading, setRecentThreatsLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchThreatAnalysis = useCallback(async (id: string) => {
    const cacheKey = `threat_analysis_${id}`;
    const cached = getFromCache<ThreatAnalysis>(cacheKey);
    if (cached) {
      setAnalysis({
        data: cached,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      });
      return cached;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setAnalysis((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiClient.get<ThreatAnalysis>(
        `/api/analysis/threat/${id}`,
        { signal: abortControllerRef.current.signal }
      );

      setCache(cacheKey, response.data, TTL.THREAT_ANALYSIS);
      setAnalysis({
        data: response.data,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      });

      return response.data;
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setAnalysis({
        data: null,
        loading: false,
        error: err.message || 'Failed to fetch threat analysis',
        lastUpdated: null,
      });
      return null;
    }
  }, []);

  const fetchPrediction = useCallback(async (params?: Record<string, any>) => {
    const cacheKey = `prediction_${JSON.stringify(params || {})}`;
    const cached = getFromCache<PredictionResult>(cacheKey);
    if (cached) {
      setPrediction({ data: cached, loading: false, error: null });
      return cached;
    }

    setPrediction((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiClient.post<PredictionResult>(
        '/api/analysis/predict',
        params || {}
      );

      setCache(cacheKey, response.data, TTL.PREDICTION);
      setPrediction({ data: response.data, loading: false, error: null });

      return response.data;
    } catch (err: any) {
      setPrediction({
        data: null,
        loading: false,
        error: err.message || 'Failed to fetch prediction',
      });
      return null;
    }
  }, []);

  const fetchRecentThreats = useCallback(async (limit: number = 20) => {
    const cacheKey = `recent_threats_${limit}`;
    const cached = getFromCache<ThreatAnalysis[]>(cacheKey);
    if (cached) {
      setRecentThreats(cached);
      return cached;
    }

    setRecentThreatsLoading(true);

    try {
      const response = await apiClient.get<ThreatAnalysis[]>(
        `/api/analysis/threats/recent?limit=${limit}`
      );

      setCache(cacheKey, response.data, TTL.RECENT_THREATS);
      setRecentThreats(response.data);
      return response.data;
    } catch (err: any) {
      return [];
    } finally {
      setRecentThreatsLoading(false);
    }
  }, []);

  const invalidateCache = useCallback((key?: string) => {
    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  }, []);

  useEffect(() => {
    if (threatId) {
      fetchThreatAnalysis(threatId);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [threatId, fetchThreatAnalysis]);

  const refetch = useCallback(() => {
    if (analysis.data?.id) {
      fetchThreatAnalysis(analysis.data.id);
    }
    if (prediction.data) {
      fetchPrediction();
    }
  }, [analysis.data?.id, prediction.data, fetchThreatAnalysis, fetchPrediction]);

  return {
    analysis,
    prediction,
    recentThreats,
    recentThreatsLoading,
    fetchThreatAnalysis,
    fetchPrediction,
    fetchRecentThreats,
    invalidateCache,
    refetch,
  };
}
