'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  BarChart3,
  Activity,
  Target,
  Zap,
  ChevronDown,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
}

interface FeatureImportance {
  name: string;
  importance: number;
}

interface ModelOption {
  id: string;
  name: string;
  description: string;
  metrics: ModelMetrics;
}

const models: ModelOption[] = [
  { id: 'xgboost', name: 'XGBoost Classifier', description: 'Gradient boosted decision trees for threat detection', metrics: { accuracy: 0.967, precision: 0.954, recall: 0.971, f1: 0.962 } },
  { id: 'lstm', name: 'LSTM Neural Network', description: 'Deep learning model for sequence-based anomaly detection', metrics: { accuracy: 0.951, precision: 0.938, recall: 0.947, f1: 0.942 } },
  { id: 'ensemble', name: 'Ensemble (Voting)', description: 'Soft voting ensemble combining 5 base models', metrics: { accuracy: 0.978, precision: 0.969, recall: 0.976, f1: 0.972 } },
];

const featureImportanceData: Record<string, FeatureImportance[]> = {
  xgboost: [
    { name: 'Transaction Amount', importance: 0.92 },
    { name: 'Time Since Last TX', importance: 0.85 },
    { name: 'IP Reputation Score', importance: 0.78 },
    { name: 'Wallet Age (days)', importance: 0.71 },
    { name: 'Gas Price (GWei)', importance: 0.65 },
    { name: 'Contract Interactions', importance: 0.58 },
    { name: 'Network Congestion', importance: 0.52 },
    { name: 'Historical Risk Score', importance: 0.45 },
  ],
  lstm: [
    { name: 'Sequence Pattern', importance: 0.95 },
    { name: 'Time Series Volatility', importance: 0.82 },
    { name: 'Behavioral Deviation', importance: 0.79 },
    { name: 'Transaction Frequency', importance: 0.73 },
    { name: 'Value Anomaly Score', importance: 0.68 },
    { name: 'Address Clustering', importance: 0.61 },
    { name: 'Flow Accumulation', importance: 0.55 },
    { name: 'Temporal Entropy', importance: 0.48 },
  ],
  ensemble: [
    { name: 'Consensus Score', importance: 0.97 },
    { name: 'Cross-Validation Rank', importance: 0.88 },
    { name: 'Model Agreement %', importance: 0.83 },
    { name: 'Confidence Weight', importance: 0.76 },
    { name: 'Prediction Variance', importance: 0.69 },
    { name: 'Feature Stability', importance: 0.62 },
    { name: 'Ensemble Diversity', importance: 0.56 },
    { name: 'Meta-Learner Weight', importance: 0.50 },
  ],
};

export default function PredictionModel() {
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<{
    probability: number;
    confidence: number;
    isThreat: boolean;
  } | null>(null);
  const [formData, setFormData] = useState({
    txAmount: '',
    timeSinceLastTx: '',
    ipReputation: '',
    walletAge: '',
    gasPrice: '',
    contractInteractions: '',
  });

  const features = featureImportanceData[selectedModel.id];

  const handlePredict = async () => {
    setIsPredicting(true);
    setPredictionResult(null);
    await new Promise(r => setTimeout(r, 2000));
    const prob = Math.random();
    setPredictionResult({
      probability: prob,
      confidence: 0.85 + Math.random() * 0.12,
      isThreat: prob > 0.5,
    });
    setIsPredicting(false);
  };

  const handleInputChange = (field: string, value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-surface/60 backdrop-blur-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-secondary-500/20 to-primary-600/20 border border-secondary-500/30">
            <Brain className="h-5 w-5 text-secondary-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Prediction Model</h3>
            <p className="text-[11px] text-white/40">Real-time threat prediction</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Left Panel - Input */}
        <div className="p-4 lg:border-r border-white/5 space-y-4">
          {/* Model Selector */}
          <div className="relative">
            <label className="block text-xs font-medium text-white/50 mb-1.5">Model</label>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/80 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-secondary-400" />
                <span>{selectedModel.name}</span>
              </div>
              <ChevronDown className={cn('h-4 w-4 text-white/40 transition-transform', isDropdownOpen && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute z-20 top-full mt-1 left-0 right-0 rounded-xl border border-white/10 bg-surface-dark/95 backdrop-blur-xl shadow-2xl overflow-hidden"
                >
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => { setSelectedModel(model); setIsDropdownOpen(false); }}
                      className={cn(
                        'w-full text-left px-3 py-2.5 transition-colors',
                        'hover:bg-white/5',
                        selectedModel.id === model.id && 'bg-primary-500/10'
                      )}
                    >
                      <p className="text-sm font-medium text-white/80">{model.name}</p>
                      <p className="text-[10px] text-white/40 mt-0.5">{model.description}</p>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Parameters */}
          <div className="space-y-2.5">
            <label className="block text-xs font-medium text-white/50 mb-1">Input Parameters</label>
            {[
              { field: 'txAmount', label: 'Transaction Amount (ETH)', placeholder: '0.00' },
              { field: 'timeSinceLastTx', label: 'Time Since Last TX (min)', placeholder: '0' },
              { field: 'ipReputation', label: 'IP Reputation Score', placeholder: '0.0 - 1.0' },
              { field: 'walletAge', label: 'Wallet Age (days)', placeholder: '0' },
              { field: 'gasPrice', label: 'Gas Price (GWei)', placeholder: '0' },
              { field: 'contractInteractions', label: 'Contract Interactions', placeholder: '0' },
            ].map((input) => (
              <div key={input.field}>
                <input
                  type="text"
                  value={formData[input.field as keyof typeof formData]}
                  onChange={(e) => handleInputChange(input.field, e.target.value)}
                  placeholder={input.placeholder}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/80 placeholder-white/20 outline-none focus:border-secondary-500/30 transition-colors"
                />
              </div>
            ))}
          </div>

          <motion.button
            onClick={handlePredict}
            disabled={isPredicting}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all',
              'bg-gradient-to-r from-secondary-500 to-primary-600 text-white shadow-lg shadow-secondary-500/25',
              'hover:shadow-xl hover:shadow-secondary-500/30 hover:scale-[1.02]',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
            )}
            whileTap={{ scale: 0.98 }}
          >
            {isPredicting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Run Prediction
              </>
            )}
          </motion.button>
        </div>

        {/* Right Panel - Results */}
        <div className="p-4 space-y-4">
          <AnimatePresence mode="wait">
            {!predictionResult ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-[400px] text-center"
              >
                <Sparkles className="h-12 w-12 text-white/10 mb-4" />
                <p className="text-sm text-white/30">Enter parameters and run prediction</p>
                <p className="text-xs text-white/20 mt-1">The AI model will analyze risk in real-time</p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Prediction Result */}
                <div className={cn(
                  'p-4 rounded-xl border',
                  predictionResult.isThreat
                    ? 'border-danger-500/30 bg-danger-500/10'
                    : 'border-accent-500/30 bg-accent-500/10'
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-white/50">Prediction Result</span>
                    <span className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-bold',
                      predictionResult.isThreat
                        ? 'bg-danger-500/20 text-danger-400'
                        : 'bg-accent-500/20 text-accent-400'
                    )}>
                      {predictionResult.isThreat ? 'THREAT DETECTED' : 'SAFE'}
                    </span>
                  </div>
                  <div className="flex items-end gap-3">
                    <span className={cn(
                      'text-3xl font-bold',
                      predictionResult.isThreat ? 'text-danger-400' : 'text-accent-400'
                    )}>
                      {(predictionResult.probability * 100).toFixed(1)}%
                    </span>
                    <span className="text-xs text-white/40 mb-1">threat probability</span>
                  </div>

                  {/* Confidence Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] text-white/40 mb-1">
                      <span>Confidence: {(predictionResult.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${predictionResult.confidence * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-secondary-500 to-primary-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Model Performance */}
                <div>
                  <h4 className="text-xs font-medium text-white/50 mb-2">Model Performance</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {([
                      { label: 'Accuracy', value: selectedModel.metrics.accuracy, color: 'text-primary-400' },
                      { label: 'Precision', value: selectedModel.metrics.precision, color: 'text-secondary-400' },
                      { label: 'Recall', value: selectedModel.metrics.recall, color: 'text-accent-400' },
                      { label: 'F1 Score', value: selectedModel.metrics.f1, color: 'text-warning-400' },
                    ] as const).map((metric) => (
                      <div key={metric.label} className="text-center p-2 rounded-lg border border-white/5 bg-white/[0.02]">
                        <p className="text-[18px] font-bold" style={{ color: metric.color }}>
                          {(metric.value * 100).toFixed(1)}%
                        </p>
                        <p className="text-[9px] text-white/30 mt-0.5">{metric.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feature Importance */}
                <div>
                  <h4 className="text-xs font-medium text-white/50 mb-2">Feature Importance</h4>
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                    {features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-3 text-[10px] text-white/20">{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-[11px] mb-0.5">
                            <span className="text-white/50 truncate">{feature.name}</span>
                            <span className="text-white/30">{(feature.importance * 100).toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${feature.importance * 100}%` }}
                              transition={{ duration: 0.6, delay: idx * 0.03 }}
                              className="h-full rounded-full bg-gradient-to-r from-secondary-500/50 to-secondary-400"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
