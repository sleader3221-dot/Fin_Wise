import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, TrendingDown, Activity, Shield,
  Download, Calendar, Filter, RefreshCw, Eye, Brain,
  LineChart, PieChart, Gauge, Server, Globe, Users,
  Clock, DollarSign, FileText, Share2, ChevronDown,
  Sparkles, Target, Zap, ArrowUp, ArrowDown,
  type LucideIcon
} from 'lucide-react';
import {
  LineChart as RechartsLine, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart,
  CartesianGrid, Legend, RadialBarChart, RadialBar
} from 'recharts';

const threatTrendData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  threats: Math.floor(Math.random() * 80 + 20 + Math.sin(i * 0.3) * 30),
  blocked: Math.floor(Math.random() * 75 + 18 + Math.sin(i * 0.3 + 0.5) * 28),
  predicted: Math.floor(Math.random() * 85 + 22 + Math.sin(i * 0.3 + 1) * 32),
}));

const securityScoreData = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]!,
  score: Math.floor(Math.random() * 15 + 70 + Math.sin(i * 0.5) * 8),
  baseline: 85,
}));

const networkPatternData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  normal: Math.floor(Math.random() * 800 + 200 + Math.sin(i * 0.4) * 200),
  anomalous: Math.floor(Math.random() * 30 + 5 + Math.abs(Math.sin(i * 0.7)) * 20),
}));

const userBehaviorData = Array.from({ length: 7 }, (_, i) => ({
  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]!,
  active: Math.floor(Math.random() * 5000 + 2000 + Math.sin(i * 0.3) * 1000),
  suspicious: Math.floor(Math.random() * 50 + 5 + Math.abs(Math.sin(i * 1.2)) * 30),
}));

const costAnalysisData = [
  { name: 'Manual Security', cost: 480000, color: '#ef4444' },
  { name: 'ShieldNet AI', cost: 120000, color: '#06b6d4' },
  { name: 'Savings', cost: 360000, color: '#10b981' },
];

const mlModelPerformance = [
  { model: 'Threat Detection', accuracy: 98.5, precision: 97.2, recall: 96.8, f1: 97.0 },
  { model: 'Fraud Prevention', accuracy: 99.1, precision: 98.5, recall: 97.9, f1: 98.2 },
  { model: 'Anomaly Detection', accuracy: 96.8, precision: 95.4, recall: 94.7, f1: 95.0 },
  { model: 'Risk Scoring', accuracy: 94.2, precision: 93.1, recall: 92.5, f1: 92.8 },
  { model: 'Phishing Detection', accuracy: 97.6, precision: 96.8, recall: 95.9, f1: 96.3 },
];

const reportTemplates = [
  { name: 'Security Audit Report', icon: Shield, format: 'PDF, CSV', lastGen: '2h ago' },
  { name: 'Compliance Summary', icon: FileText, format: 'PDF, DOCX', lastGen: '1d ago' },
  { name: 'Risk Assessment', icon: BarChart3, format: 'PDF, XLSX', lastGen: '3h ago' },
  { name: 'Executive Overview', icon: Eye, format: 'PDF, PPTX', lastGen: '1d ago' },
  { name: 'Threat Intelligence', icon: Activity, format: 'JSON, CSV', lastGen: '30m ago' },
  { name: 'Financial Analysis', icon: DollarSign, format: 'PDF, XLSX', lastGen: '1w ago' },
];

const streamingMetrics = [
  { label: 'Data Stream', value: '2.4 GB/s', status: 'Active', color: 'text-accent-400' },
  { label: 'Events/sec', value: '12,847', status: 'Processing', color: 'text-primary-400' },
  { label: 'AI Inferences', value: '892/s', status: 'Online', color: 'text-secondary-400' },
  { label: 'Model Updates', value: '3.2 min', status: 'Synced', color: 'text-accent-400' },
];

const SectionHeader = ({ icon: Icon, title, action, color = 'text-primary-400' }: { icon: LucideIcon; title: string; action?: string; color?: string }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-semibold text-sm flex items-center gap-2">
      <Icon className={`w-4 h-4 ${color}`} /> {title}
    </h3>
    {action && <button className="text-xs text-primary-400 hover:text-primary-300 transition-colors">{action}</button>}
  </div>
);

const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass rounded-2xl p-6 ${className}`}
  >
    {children}
  </motion.div>
);

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  return (
    <div className="min-h-screen bg-surface-darker p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-secondary-400" />
            Analytics & Insights
          </h1>
          <p className="text-white/40 text-sm mt-1">AI-powered analytics and data insights platform</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass rounded-xl flex">
            {['7d', '30d', '90d', '1y'].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
                  selectedPeriod === p ? 'bg-primary-500/20 text-primary-400' : 'text-white/30 hover:text-white/60'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="p-2 rounded-xl glass glass-hover">
            <Calendar className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 rounded-xl bg-secondary-500/20 text-secondary-400 border border-secondary-500/20 text-sm flex items-center gap-2 hover:bg-secondary-500/30 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {streamingMetrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-4 group hover:neon-glow transition-all duration-500"
          >
            <div className="text-xs text-white/30 mb-1">{m.label}</div>
            <div className="text-lg font-bold font-mono text-white/80 mb-1">{m.value}</div>
            <div className={`text-xs flex items-center gap-1 ${m.color}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {m.status}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard>
          <SectionHeader icon={Activity} title="Threat Trend Analysis" action="View Full Report" color="text-danger-400" />
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={threatTrendData.slice(-14)}>
                <defs>
                  <linearGradient id="trendBlocked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} />
                <YAxis stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <Bar dataKey="blocked" fill="#10b981" opacity={0.6} radius={[2, 2, 0, 0]} />
                <Line type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="predicted" stroke="#a855f7" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-3 text-xs text-white/30">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger-500" /> Threats</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-500" /> Blocked</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary-500" /> Predicted</span>
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeader icon={Shield} title="Security Score Over Time" color="text-accent-400" />
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={securityScoreData}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <YAxis domain={[60, 100]} stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
                <Line type="monotone" dataKey="baseline" stroke="rgba(255,255,255,0.2)" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                <Area type="monotone" dataKey="score" stroke="#10b981" fill="url(#scoreGrad)" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-3 text-xs text-white/30">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-500" /> Security Score</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white/30" /> Baseline</span>
          </div>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard>
          <SectionHeader icon={Server} title="Network Traffic Patterns" color="text-primary-400" />
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={networkPatternData}>
                <defs>
                  <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="anomGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} interval={3} />
                <YAxis stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
                <Area type="monotone" dataKey="normal" stroke="#06b6d4" fill="url(#normalGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="anomalous" stroke="#ef4444" fill="url(#anomGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-3 mt-3 text-xs text-white/30">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary-500" /> Normal Traffic</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger-500" /> Anomalies</span>
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeader icon={Users} title="User Behavior Analytics" color="text-secondary-400" />
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userBehaviorData}>
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <YAxis stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
                <Bar dataKey="active" fill="#06b6d4" radius={[4, 4, 0, 0]} opacity={0.8} />
                <Line type="monotone" dataKey="suspicious" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 3 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-3 mt-3 text-xs text-white/30">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary-500" /> Active Users</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger-500" /> Suspicious</span>
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeader icon={DollarSign} title="Cost Analysis" color="text-accent-400" />
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costAnalysisData} layout="vertical">
                <XAxis type="number" stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} width={90} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
                  {costAnalysisData.map((entry, i) => (
                    <rect key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between items-center mt-3">
            <div className="text-xs text-white/30">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger-500" /> Manual: $480K</span>
            </div>
            <div className="text-xs text-white/30">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary-500" /> ShieldNet: $120K</span>
            </div>
            <div className="text-xs">
              <span className="flex items-center gap-1 text-accent-400 font-semibold">
                <TrendingDown className="w-3 h-3" /> Save $360K
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard>
          <SectionHeader icon={Brain} title="AI Model Performance" color="text-secondary-400" />
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  {['Model', 'Accuracy', 'Precision', 'Recall', 'F1 Score'].map((h) => (
                    <th key={h} className="text-left py-2.5 px-2 text-white/30 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mlModelPerformance.map((model, i) => (
                  <motion.tr
                    key={model.model}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-2.5 px-2 text-white/70">{model.model}</td>
                    {['accuracy', 'precision', 'recall', 'f1'].map((key) => {
                      const val = model[key as keyof typeof model] as number;
                      return (
                        <td key={key} className="py-2.5 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div className={`h-full rounded-full ${
                                val > 98 ? 'bg-accent-500' : val > 96 ? 'bg-primary-500' : 'bg-warning-500'
                              }`} style={{ width: `${val}%` }} />
                            </div>
                            <span className="font-mono text-white/60 w-10">{val}%</span>
                          </div>
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeader icon={FileText} title="Report Builder" action="Create Report" color="text-primary-400" />
          <div className="space-y-2">
            {reportTemplates.map((report, i) => {
              const Icon = report.icon;
              return (
                <motion.div
                  key={report.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-xl p-3 flex items-center justify-between group hover:border-primary-500/20 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary-400" />
                    </div>
                    <div>
                      <div className="text-sm text-white/70">{report.name}</div>
                      <div className="text-xs text-white/30">{report.format}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/20">Updated {report.lastGen}</span>
                    <button className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                      <Download className="w-3.5 h-3.5 text-white/30" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-4 p-4 glass rounded-xl border border-dashed border-white/10 text-center">
            <Sparkles className="w-5 h-5 mx-auto mb-2 text-primary-400" />
            <div className="text-sm text-white/50">Generate custom reports with AI</div>
            <button className="mt-2 px-4 py-2 rounded-lg bg-primary-500/20 text-primary-400 border border-primary-500/20 text-xs font-medium hover:bg-primary-500/30 transition-colors">
              Build Report
            </button>
          </div>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard>
          <SectionHeader icon={Brain} title="AI Prediction Models" color="text-secondary-400" />
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Threat Prediction', accuracy: 97.2, status: 'Trained', color: 'text-accent-400' },
              { name: 'Anomaly Detection', accuracy: 94.8, status: 'Trained', color: 'text-accent-400' },
              { name: 'Risk Forecasting', accuracy: 91.5, status: 'Active', color: 'text-primary-400' },
              { name: 'Behavior Analysis', accuracy: 93.7, status: 'Active', color: 'text-primary-400' },
            ].map((model) => (
              <div key={model.name} className="glass rounded-xl p-4 group hover:neon-glow-secondary transition-all duration-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/40">{model.name}</span>
                  <span className={`text-[10px] ${model.color}`}>{model.status}</span>
                </div>
                <div className="text-2xl font-bold font-mono text-white/80 mb-2">{model.accuracy}%</div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-secondary-500 to-primary-500" style={{ width: `${model.accuracy}%` }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeader icon={Target} title="Real-Time Data Streaming" color="text-primary-400" />
          <div className="space-y-3">
            {Array.from({ length: 6 }, (_, i) => ({
              event: ['Transaction Verified', 'Threat Blocked', 'Model Updated', 'Anomaly Detected', 'Alert Generated', 'Risk Recalculated'][i]!,
              value: ['0.42 ETH', 'SQL Injection', 'v2.3.1', 'Traffic Spike', 'Critical', 'Score: 82'][i]!,
              time: `${Math.floor(Math.random() * 30 + 1)}s ago`,
              type: ['success', 'error', 'info', 'warning', 'error', 'info'][i]!,
            })).map((evt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 p-3 rounded-xl glass text-xs"
              >
                <div className={`w-2 h-2 rounded-full ${
                  evt.type === 'error' ? 'bg-danger-500' : evt.type === 'warning' ? 'bg-warning-500' : evt.type === 'success' ? 'bg-accent-500' : 'bg-primary-500'
                } animate-pulse`} />
                <span className="flex-1 text-white/70">{evt.event}</span>
                <span className="font-mono text-white/50">{evt.value}</span>
                <span className="text-white/20">{evt.time}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-white/20">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" /> Streaming Live</span>
            <span>12,847 events/min</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
