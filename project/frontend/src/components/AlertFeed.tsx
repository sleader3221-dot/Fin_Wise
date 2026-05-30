'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellOff,
  AlertTriangle,
  Shield,
  Info,
  CheckCircle,
  Volume2,
  Trash2,
  X,
  ChevronDown,
  Clock,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface Alert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
  hasSound: boolean;
}

const severityConfig = {
  critical: { icon: AlertTriangle, color: 'text-danger-400', bg: 'bg-danger-500/10', border: 'border-danger-500/30', dot: 'bg-danger-400', label: 'Critical' },
  high: { icon: Shield, color: 'text-warning-400', bg: 'bg-warning-500/10', border: 'border-warning-500/30', dot: 'bg-warning-400', label: 'High' },
  medium: { icon: Info, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', dot: 'bg-yellow-400', label: 'Medium' },
  low: { icon: CheckCircle, color: 'text-accent-400', bg: 'bg-accent-500/10', border: 'border-accent-500/30', dot: 'bg-accent-400', label: 'Low' },
};

const initialAlerts: Alert[] = [
  { id: 'a1', severity: 'critical', title: 'Reentrancy Attack Detected', description: 'Suspected reentrancy attack on Vault contract 0x7F3e...9aB2. Multiple withdrawal calls detected within single transaction.', timestamp: new Date(Date.now() - 30000), isRead: false, hasSound: true },
  { id: 'a2', severity: 'high', title: 'Unusual Network Traffic Spike', description: 'Traffic increased 340% from Russian IP range. Potential DDoS campaign targeting DNS infrastructure.', timestamp: new Date(Date.now() - 120000), isRead: false, hasSound: true },
  { id: 'a3', severity: 'medium', title: 'Smart Contract Warning', description: 'Gas optimization detected in Compound fork deployment. Recommended: review slippage parameters.', timestamp: new Date(Date.now() - 300000), isRead: false, hasSound: false },
  { id: 'a4', severity: 'low', title: 'System Update Available', description: 'ShieldNet node v2.4.1 available. Includes security patches and performance improvements.', timestamp: new Date(Date.now() - 600000), isRead: true, hasSound: false },
  { id: 'a5', severity: 'high', title: 'DeFi Pool Anomaly', description: 'Unusual liquidity movement detected in Aave USDC pool. 2,500 ETH withdrawn in 10 minutes.', timestamp: new Date(Date.now() - 900000), isRead: true, hasSound: true },
  { id: 'a6', severity: 'critical', title: 'Bridge Exploit Attempt', description: 'Cross-chain bridge validator node targeted. 12 failed validation attempts in 30 seconds.', timestamp: new Date(Date.now() - 1800000), isRead: false, hasSound: true },
  { id: 'a7', severity: 'medium', title: 'New Threat Signature Added', description: 'AI model updated with new ransomware variant detection. Signature: SHIELD-RANSOM-2024-05.', timestamp: new Date(Date.now() - 3600000), isRead: true, hasSound: false },
  { id: 'a8', severity: 'low', title: 'Wallet Connection Alert', description: 'New wallet 0xE5f6...7gH8 connected to dashboard. Verify authorization.', timestamp: new Date(Date.now() - 7200000), isRead: true, hasSound: false },
];

const formatTime = (date: Date) => {
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
};

export default function AlertFeed() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [filter, setFilter] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showNewIndicator, setShowNewIndicator] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(alerts.length);

  // Simulate new alerts
  useEffect(() => {
    const interval = setInterval(() => {
      const severities: Alert['severity'][] = ['critical', 'high', 'medium', 'low'];
      const newAlert: Alert = {
        id: `alert-${Date.now()}`,
        severity: severities[Math.floor(Math.random() * 4)],
        title: ['Suspicious Transaction', 'Anomaly Detected', 'Security Alert', 'System Notification'][Math.floor(Math.random() * 4)],
        description: 'Automated detection triggered by AI monitoring system.',
        timestamp: new Date(),
        isRead: false,
        hasSound: Math.random() > 0.5,
      };
      setAlerts(prev => [newAlert, ...prev.slice(0, 49)]);
      setShowNewIndicator(true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Auto scroll
  useEffect(() => {
    if (autoScroll && feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [alerts, autoScroll]);

  // Mark all as read
  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  // Clear all
  const clearAll = () => {
    setAlerts([]);
  };

  const filteredAlerts = filter
    ? alerts.filter(a => a.severity === filter)
    : alerts;

  const unreadCount = alerts.filter(a => !a.isRead).length;

  const totalCounts = {
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length,
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
          <div className="relative">
            <Bell className="h-5 w-5 text-white/70" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-white">Alert Feed</h3>
          <span className="text-[10px] text-white/30">Real-time</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg border transition-colors',
              autoScroll ? 'border-primary-500/30 bg-primary-500/10 text-primary-400' : 'border-white/10 text-white/30 hover:text-white/50'
            )}
          >
            <BellOff className="h-3 w-3" />
          </button>
          {alerts.length > 0 && (
            <>
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 text-[10px] text-white/40 hover:text-white hover:bg-white/5 transition-all"
              >
                <CheckCircle className="h-3 w-3" />
                Mark Read
              </button>
              <button
                onClick={clearAll}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 text-[10px] text-danger-400 hover:bg-danger-500/10 transition-all"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Severity Filters */}
      <div className="flex gap-2 px-6 py-3 border-b border-white/5">
        <button
          onClick={() => setFilter(null)}
          className={cn(
            'px-3 py-1 rounded-lg text-[10px] font-medium border transition-all',
            !filter
              ? 'border-primary-500/30 bg-primary-500/10 text-primary-400'
              : 'border-white/10 text-white/30 hover:text-white/50'
          )}
        >
          All ({alerts.length})
        </button>
        {(['critical', 'high', 'medium', 'low'] as const).map((sev) => (
          <button
            key={sev}
            onClick={() => setFilter(filter === sev ? null : sev)}
            className={cn(
              'px-3 py-1 rounded-lg text-[10px] font-medium border transition-all',
              filter === sev
                ? `${severityConfig[sev].bg} ${severityConfig[sev].border} ${severityConfig[sev].color}`
                : 'border-white/10 text-white/30 hover:text-white/50'
            )}
          >
            {sev.charAt(0).toUpperCase() + sev.slice(1)} ({totalCounts[sev]})
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div
        ref={feedRef}
        className="overflow-y-auto max-h-[400px] custom-scrollbar"
        onScroll={() => setShowNewIndicator(false)}
      >
        <AnimatePresence mode="popLayout">
          {filteredAlerts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <BellOff className="h-10 w-10 text-white/10 mb-3" />
              <p className="text-sm text-white/30">No alerts</p>
              <p className="text-xs text-white/20">All clear for now</p>
            </motion.div>
          ) : (
            filteredAlerts.map((alert, idx) => {
              const config = severityConfig[alert.severity];
              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 2 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className={cn(
                    'relative px-6 py-3 transition-colors cursor-pointer group',
                    'hover:bg-white/[0.03]',
                    !alert.isRead && 'bg-primary-500/[0.02]'
                  )}
                  onClick={() => {
                    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, isRead: true } : a));
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Dot/Icon */}
                    <div className="relative mt-0.5">
                      {!alert.isRead && (
                        <span className={cn('absolute -left-1 -top-1 h-2 w-2 rounded-full', config.dot)} />
                      )}
                      <div className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg border',
                        config.bg, config.border
                      )}>
                        <config.icon className={cn('h-4 w-4', config.color)} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn(
                          'text-sm font-medium',
                          alert.isRead ? 'text-white/60' : 'text-white'
                        )}>
                          {alert.title}
                        </span>
                        <span className={cn(
                          'px-1.5 py-0.5 rounded text-[9px] font-bold',
                          config.bg, config.color
                        )}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 leading-relaxed line-clamp-2">
                        {alert.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-[10px] text-white/20">
                          <Clock className="h-3 w-3" />
                          {formatTime(alert.timestamp)}
                        </span>
                        {alert.hasSound && (
                          <span className="flex items-center gap-1 text-[10px] text-white/20">
                            <Volume2 className="h-3 w-3" />
                            Sound
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Mark read */}
                    {!alert.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, isRead: true } : a));
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/5 rounded"
                      >
                        <X className="h-3 w-3 text-white/30" />
                      </button>
                    )}
                  </div>

                  {/* Divider */}
                  {idx < filteredAlerts.length - 1 && (
                    <div className="absolute bottom-0 left-16 right-6 h-[1px] bg-white/[0.03]" />
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>

        {/* New alert indicator */}
        <AnimatePresence>
          {showNewIndicator && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={() => { setAutoScroll(true); setShowNewIndicator(false); }}
              className="sticky bottom-2 mx-auto flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-400 text-[11px] font-medium"
            >
              <ChevronDown className="h-3 w-3" />
              New alerts
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
