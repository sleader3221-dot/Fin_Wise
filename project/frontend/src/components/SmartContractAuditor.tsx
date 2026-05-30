'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Shield,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  TrendingDown,
  Zap,
  FileText,
  Code,
  Loader2,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface Finding {
  line: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
}

interface AuditResult {
  riskScore: number;
  vulnerabilities: { critical: number; high: number; medium: number; low: number };
  findings: Finding[];
  gasOptimizations: { line: number; title: string; gasSaved: string }[];
  recommendations: string[];
}

const mockCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Vault {
    mapping(address => uint256) public balances;
    
    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }
    
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount);
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
        balances[msg.sender] -= amount;
    }
}`;

const severityConfig = {
  critical: { icon: AlertCircle, color: 'text-danger-400', bg: 'bg-danger-500/10', border: 'border-danger-500/30', label: 'Critical' },
  high: { icon: AlertTriangle, color: 'text-warning-400', bg: 'bg-warning-500/10', border: 'border-warning-500/30', label: 'High' },
  medium: { icon: Info, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'Medium' },
  low: { icon: CheckCircle, color: 'text-accent-400', bg: 'bg-accent-500/10', border: 'border-accent-500/30', label: 'Low' },
};

const findingsData: Finding[] = [
  { line: 10, severity: 'critical', title: 'Reentrancy Vulnerability', description: 'The withdraw function performs an external call before updating state, making it susceptible to reentrancy attacks.', recommendation: 'Use the Checks-Effects-Interactions pattern. Update balances[msg.sender] -= amount before the external call.' },
  { line: 8, severity: 'high', title: 'Missing Access Control', description: 'The deposit function has no access control allowing anyone to deposit on behalf of others.', recommendation: 'Consider adding access control if needed, or document the intended behavior.' },
  { line: 12, severity: 'medium', title: 'Unchecked Return Value', description: 'The return value of the external call in withdraw is checked but could be handled more gracefully.', recommendation: 'Consider implementing a withdrawal pattern with pull-over-push.' },
  { line: 3, severity: 'low', title: 'Missing Events', description: 'Critical state-changing operations do not emit events.', recommendation: 'Add events for deposit and withdraw functions.' },
];

export default function SmartContractAuditor() {
  const [code, setCode] = useState(mockCode);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [activeTab, setActiveTab] = useState<'findings' | 'gas' | 'recommendations'>('findings');
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 2500));
    setResult({
      riskScore: 72,
      vulnerabilities: { critical: 1, high: 1, medium: 1, low: 1 },
      findings: findingsData,
      gasOptimizations: [
        { line: 3, title: 'Use immutable for constant state variables', gasSaved: '~2,100' },
        { line: 8, title: 'Pack structs to reduce storage slots', gasSaved: '~5,000' },
        { line: 12, title: 'Use unchecked block for arithmetic', gasSaved: '~300' },
      ],
      recommendations: [
        'Implement OpenZeppelin\'s ReentrancyGuard',
        'Add proper access control with Ownable pattern',
        'Use Solidity 0.8.x built-in overflow checks',
        'Implement pull-over-push withdrawal pattern',
        'Add comprehensive event emissions',
      ],
    });
    setIsAnalyzing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') setCode(ev.target.result);
    };
    reader.readAsText(file);
  };

  const filteredFindings = result?.findings.filter(f =>
    !selectedSeverity || f.severity === selectedSeverity
  ) || [];

  const riskColor = result
    ? result.riskScore > 70 ? 'text-danger-400'
      : result.riskScore > 40 ? 'text-warning-400'
      : 'text-accent-400'
    : 'text-white/40';

  const riskLabel = result
    ? result.riskScore > 70 ? 'High Risk'
      : result.riskScore > 40 ? 'Medium Risk'
      : 'Low Risk'
    : '--';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-surface/60 backdrop-blur-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-600/20 border border-primary-500/30">
            <Shield className="h-5 w-5 text-primary-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Smart Contract Auditor</h3>
            <p className="text-[11px] text-white/40">AI-Powered Security Analysis</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Code Input */}
        <div className="p-4 lg:border-r border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-primary-400" />
              <span className="text-xs font-medium text-white/60">Contract Source</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".sol,.vy"
                onChange={handleFileUpload}
                className="hidden"
              />
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-[11px] font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Upload className="h-3 w-3" />
                Upload
              </motion.button>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-[350px] lg:h-[420px] rounded-xl border border-white/10 bg-surface-dark/80 p-4 font-mono text-sm text-white/80 placeholder-white/20 outline-none resize-none focus:border-primary-500/30 transition-colors"
              spellCheck={false}
              placeholder="// Paste your Solidity/Vyper code here..."
            />

            {/* Scanning Animation */}
            <AnimatePresence>
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 rounded-xl overflow-hidden"
                >
                  <motion.div
                    className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-400 to-transparent"
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="absolute inset-0 bg-surface-dark/40 backdrop-blur-[1px]" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className={cn(
              'mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all',
              'bg-gradient-to-r from-primary-500 to-secondary-600 text-white shadow-lg shadow-primary-500/25',
              'hover:shadow-xl hover:shadow-primary-500/30 hover:scale-[1.02]',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
            )}
            whileTap={{ scale: 0.98 }}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing Contract...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Analyze Contract
              </>
            )}
          </motion.button>
        </div>

        {/* Results */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-[350px] lg:h-[500px] text-center"
              >
                <FileText className="h-12 w-12 text-white/10 mb-4" />
                <p className="text-sm text-white/30 mb-1">No analysis results yet</p>
                <p className="text-xs text-white/20">Paste contract code and click Analyze</p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Risk Score */}
                <div className="flex items-center gap-6 p-4 rounded-xl border border-white/10 bg-white/5">
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                      <motion.circle
                        cx="32" cy="32" r="28" fill="none"
                        stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={`${(result.riskScore / 100) * 176} 176`}
                        initial={{ strokeDasharray: '0 176' }}
                        animate={{ strokeDasharray: `${(result.riskScore / 100) * 176} 176` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={riskColor}
                      />
                    </svg>
                    <div className="text-center">
                      <span className={cn('text-lg font-bold', riskColor)}>{result.riskScore}</span>
                      <span className="block text-[8px] text-white/30">/100</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{riskLabel}</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {result.vulnerabilities.critical + result.vulnerabilities.high + result.vulnerabilities.medium + result.vulnerabilities.low} vulnerabilities found
                    </p>
                    <div className="flex gap-3 mt-2">
                      <span className="text-[10px] text-danger-400">{result.vulnerabilities.critical} critical</span>
                      <span className="text-[10px] text-warning-400">{result.vulnerabilities.high} high</span>
                      <span className="text-[10px] text-yellow-400">{result.vulnerabilities.medium} medium</span>
                      <span className="text-[10px] text-accent-400">{result.vulnerabilities.low} low</span>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-0.5">
                  {[
                    { id: 'findings' as const, label: 'Findings', count: result.findings.length },
                    { id: 'gas' as const, label: 'Gas Opt.', count: result.gasOptimizations.length },
                    { id: 'recommendations' as const, label: 'Recommendations', count: result.recommendations.length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-medium transition-all',
                        activeTab === tab.id
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'text-white/40 hover:text-white/60'
                      )}
                    >
                      {tab.label}
                      <span className="text-[10px] opacity-60">({tab.count})</span>
                    </button>
                  ))}
                </div>

                {/* Findings */}
                {activeTab === 'findings' && (
                  <div className="space-y-1">
                    {/* Severity filter */}
                    <div className="flex gap-1.5 mb-2">
                      {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
                        <button
                          key={sev}
                          onClick={() => setSelectedSeverity(sev === 'all' ? null : sev)}
                          className={cn(
                            'px-2 py-0.5 rounded-md text-[10px] font-medium border transition-all',
                            selectedSeverity === sev || (sev === 'all' && !selectedSeverity)
                              ? 'border-primary-500/30 bg-primary-500/10 text-primary-400'
                              : 'border-white/10 text-white/30 hover:text-white/50'
                          )}
                        >
                          {sev === 'all' ? 'All' : sev}
                        </button>
                      ))}
                    </div>

                    {/* Findings list */}
                    <div className="space-y-1.5 max-h-[280px] overflow-y-auto custom-scrollbar">
                      {filteredFindings.map((finding, idx) => {
                        const config = severityConfig[finding.severity];
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={cn(
                              'p-3 rounded-xl border',
                              config.bg,
                              config.border
                            )}
                          >
                            <div className="flex items-start gap-2.5">
                              <config.icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', config.color)} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-semibold text-white">{finding.title}</span>
                                  <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-bold', config.bg, config.color)}>
                                    {config.label}
                                  </span>
                                  <span className="text-[10px] text-white/30 ml-auto">Line {finding.line}</span>
                                </div>
                                <p className="text-[11px] text-white/50 leading-relaxed">{finding.description}</p>
                                <p className="text-[10px] text-accent-400/70 mt-1">{finding.recommendation}</p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Gas Optimizations */}
                {activeTab === 'gas' && (
                  <div className="space-y-1.5 max-h-[320px] overflow-y-auto">
                    {result.gasOptimizations.map((opt, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-white/5"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-500/10">
                          <TrendingDown className="h-3.5 w-3.5 text-accent-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-white">{opt.title}</span>
                            <span className="text-[10px] text-white/30">Line {opt.line}</span>
                          </div>
                          <span className="text-[10px] text-accent-400/70">Saves {opt.gasSaved} gas</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                {activeTab === 'recommendations' && (
                  <div className="space-y-1.5 max-h-[320px] overflow-y-auto">
                    {result.recommendations.map((rec, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-white/5"
                      >
                        <Zap className="h-4 w-4 text-primary-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-white/60">{rec}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
