import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Shield, AlertTriangle, Skull, Globe, Clock,
  ChevronDown, ExternalLink, Download, MoreHorizontal, X,
  Brain, Target, MapPin, Activity, FileText, Server, Database,
  ArrowUp, ArrowDown, TrendingUp, Layers, Eye, ShieldOff,
  type LucideIcon
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

type Threat = {
  id: string; type: string; severity: string; score: number;
  source: string; target: string; status: string; timestamp: string;
  mitreId: string; vector: string;
};

const threats: Threat[] = Array.from({ length: 20 }, (_, i) => ({
  id: `T-${String(2024000 + i)}`,
  type: ['SQL Injection', 'DDoS Attack', 'Ransomware', 'Phishing', 'Zero-Day Exploit', 'Supply Chain', 'DNS Spoofing', 'Credential Stuffing'][Math.floor(Math.random() * 8)]!,
  severity: ['Critical', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)]!,
  score: Math.floor(Math.random() * 100),
  source: ['Dark Web', 'External Network', 'Email Gateway', 'Blockchain', 'Cloud API', 'Endpoint'][Math.floor(Math.random() * 6)]!,
  target: ['Web Server', 'Database', 'Smart Contract', 'User Accounts', 'DNS', 'API Gateway', 'Wallet'][Math.floor(Math.random() * 7)]!,
  status: ['Active', 'Mitigated', 'Investigating', 'Blocked'][Math.floor(Math.random() * 4)]!,
  timestamp: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
  mitreId: `T${Math.floor(Math.random() * 2000 + 1000)}`,
  vector: `[network:${['http', 'dns', 'tcp', 'ethereum'][Math.floor(Math.random() * 4)]}]`,
}));

const mitreFramework = [
  { tactic: 'Reconnaissance', score: 85, full: 100 },
  { tactic: 'Resource Dev', score: 62, full: 100 },
  { tactic: 'Initial Access', score: 91, full: 100 },
  { tactic: 'Execution', score: 73, full: 100 },
  { tactic: 'Persistence', score: 45, full: 100 },
  { tactic: 'Privilege Esc', score: 58, full: 100 },
  { tactic: 'Defense Evasion', score: 67, full: 100 },
  { tactic: 'Credential Access', score: 82, full: 100 },
  { tactic: 'Discovery', score: 39, full: 100 },
  { tactic: 'Lateral Movement', score: 51, full: 100 },
  { tactic: 'Collection', score: 44, full: 100 },
  { tactic: 'Exfiltration', score: 36, full: 100 },
];

const predictionData = Array.from({ length: 14 }, (_, i) => ({
  day: `Day ${i + 1}`,
  actual: Math.floor(Math.random() * 40 + 20 + Math.sin(i * 0.5) * 15),
  predicted: Math.floor(Math.random() * 40 + 25 + Math.sin(i * 0.5 + 0.3) * 12),
  upper: Math.floor(Math.random() * 50 + 30 + Math.sin(i * 0.5) * 15),
  lower: Math.floor(Math.random() * 30 + 10 + Math.sin(i * 0.5) * 12),
}));

const vulnDb = Array.from({ length: 8 }, (_, i) => ({
  id: `CVE-2024-${String(1000 + i)}`,
  title: ['Remote Code Execution in Web3 Provider', 'Smart Contract Reentrancy Vulnerability', 'DeFi Oracle Manipulation', 'Cross-Site Scripting in DApp', 'Buffer Overflow in Node Client', 'Authentication Bypass in Bridge', 'Integer Overflow in Token Contract', 'Privilege Escalation in DAO'][i]!,
  severity: ['Critical', 'High', 'Medium', 'Critical', 'High', 'Medium', 'High', 'Critical'][i]!,
  score: [9.8, 8.5, 7.2, 9.1, 8.8, 6.9, 7.8, 9.4][i]!,
  published: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
}));

const iocFeed = Array.from({ length: 10 }, (_, i) => ({
  type: ['IP Address', 'Domain', 'Hash', 'URL', 'Email'][Math.floor(Math.random() * 5)]!,
  value: [
    '192.168.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}',
    'malware-${i}.xyz',
    '0x7d${String(Math.random()).slice(2, 10)}...',
    'https://phishing-${i}.com/login',
    'spam${i}@darknet.org',
  ][Math.floor(Math.random() * 5)]!,
  confidence: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)]!,
  firstSeen: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
}));

const timelineData = Array.from({ length: 10 }, (_, i) => ({
  time: new Date(Date.now() - i * 3600000 * 2).toISOString(),
  event: [
    'Automated mitigation triggered for DDoS attack',
    'AI model updated with new threat signatures',
    'Blockchain fork detected on Ethereum network',
    'Suspicious wallet activity flagged for review',
    'Smart contract vulnerability patched automatically',
    'New ransomware variant identified in the wild',
    'Cross-chain bridge transaction anomaly detected',
    'Zero-day exploit blocked by ML heuristics',
    'Dark web marketplace listing monitored',
    'Phishing campaign targeting DeFi users detected',
  ][i]!,
  type: ['Automated', 'Update', 'Detection', 'Alert', 'Patch', 'Intel', 'Anomaly', 'Blocked', 'Monitor', 'Detection'][i]!,
}));

const threatSources = [
  { name: 'Dark Web', count: 156, color: '#ef4444' },
  { name: 'External Network', count: 234, color: '#f59e0b' },
  { name: 'Email Gateway', count: 89, color: '#06b6d4' },
  { name: 'Blockchain', count: 345, color: '#a855f7' },
  { name: 'Cloud API', count: 67, color: '#10b981' },
  { name: 'Endpoint', count: 178, color: '#f97316' },
];

const getSeverityClass = (s: string) => {
  switch (s) {
    case 'Critical': return 'text-danger-400 bg-danger-500/10 border-danger-500/20';
    case 'High': return 'text-warning-400 bg-warning-500/10 border-warning-500/20';
    case 'Medium': return 'text-primary-400 bg-primary-500/10 border-primary-500/20';
    default: return 'text-white/50 bg-white/5 border-white/10';
  }
};

const getStatusClass = (s: string) => {
  switch (s) {
    case 'Active': return 'text-danger-400 bg-danger-500/10';
    case 'Mitigated': return 'text-accent-400 bg-accent-500/10';
    case 'Investigating': return 'text-warning-400 bg-warning-500/10';
    default: return 'text-primary-400 bg-primary-500/10';
  }
};

const DetailModal = ({ threat, onClose }: { threat: Threat | null; onClose: () => void }) => {
  if (!threat) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass rounded-2xl max-w-lg w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Skull className="w-5 h-5 text-danger-400" />
            <h3 className="font-bold">{threat.id}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-lg text-xs font-mono border ${getSeverityClass(threat.severity)}`}>{threat.severity}</span>
            <span className={`px-3 py-1 rounded-lg text-xs font-mono ${getStatusClass(threat.status)}`}>{threat.status}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Type', value: threat.type },
              { label: 'Source', value: threat.source },
              { label: 'Target', value: threat.target },
              { label: 'Score', value: `${threat.score}/100` },
              { label: 'MITRE ID', value: threat.mitreId },
              { label: 'Vector', value: threat.vector },
            ].map((f) => (
              <div key={f.label}>
                <div className="text-xs text-white/30 mb-1">{f.label}</div>
                <div className="text-sm font-mono">{f.value}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <button className="flex-1 px-4 py-2 rounded-xl glass glass-hover text-sm flex items-center justify-center gap-2">
              <Target className="w-4 h-4" /> Analyze
            </button>
            <button className="flex-1 px-4 py-2 rounded-xl glass glass-hover text-sm flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" /> Mitigate
            </button>
            <button className="px-4 py-2 rounded-xl glass glass-hover">
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function ThreatIntelligence() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredThreats = threats.filter((t) => {
    const matchSearch = t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.type.toLowerCase().includes(search.toLowerCase()) ||
      t.source.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = !severityFilter || t.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  return (
    <div className="min-h-screen bg-surface-darker p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Shield className="w-6 h-6 text-danger-400" />
            Threat Intelligence
          </h1>
          <p className="text-white/40 text-sm mt-1">AI-powered threat analysis and intelligence platform</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl glass glass-hover text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="px-4 py-2 rounded-xl bg-danger-500/20 text-danger-400 border border-danger-500/20 text-sm flex items-center gap-2 hover:bg-danger-500/30 transition-colors">
            <Shield className="w-4 h-4" /> Run Scan
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="relative flex-1 min-w-[250px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search threats by ID, type, source..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-primary-500/50 transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 h-10 rounded-xl glass glass-hover text-sm flex items-center gap-2"
        >
          <Filter className="w-4 h-4" /> Filters
          <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
        {['Critical', 'High', 'Medium', 'Low'].map((s) => (
          <button
            key={s}
            onClick={() => setSeverityFilter(severityFilter === s ? null : s)}
            className={`px-3 h-10 rounded-xl text-xs font-mono border transition-all ${
              severityFilter === s
                ? getSeverityClass(s) + ' ring-1 ring-current'
                : 'glass glass-hover text-white/40 border-white/10'
            }`}
          >
            {s}
          </button>
        ))}
        <button className="p-2.5 rounded-xl glass glass-hover">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-danger-400" /> Active Threats ({filteredThreats.length})
            </h3>
            <div className="flex items-center gap-2 text-xs text-white/30">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger-500" /> Critical</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning-500" /> High</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['ID', 'Type', 'Severity', 'Score', 'Source', 'Target', 'Status', ''].map((h) => (
                    <th key={h} className="text-left py-3 px-2 text-white/30 font-medium text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredThreats.slice(0, 10).map((t, i) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => setSelectedThreat(t)}
                  >
                    <td className="py-3 px-2 font-mono text-xs text-white/60">{t.id}</td>
                    <td className="py-3 px-2 text-white/80">{t.type}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getSeverityClass(t.severity)}`}>{t.severity}</span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className={`h-full rounded-full ${t.score > 75 ? 'bg-danger-500' : t.score > 50 ? 'bg-warning-500' : 'bg-primary-500'}`} style={{ width: `${t.score}%` }} />
                        </div>
                        <span className="text-xs font-mono text-white/40">{t.score}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-white/60 text-xs">{t.source}</td>
                    <td className="py-3 px-2 text-white/60 text-xs">{t.target}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${getStatusClass(t.status)}`}>{t.status}</span>
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedThreat(t); }}
                        className="p-1 rounded hover:bg-white/5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-white/30" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-secondary-400" /> AI Prediction
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictionData.slice(-7)}>
                  <defs>
                    <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} />
                  <YAxis stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
                  <Area type="monotone" dataKey="actual" stroke="#ef4444" fill="url(#predGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="predicted" stroke="#a855f7" fill="none" strokeWidth={2} strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-3 mt-3 text-xs text-white/30">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger-500" /> Actual</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary-500" /> Predicted</span>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-400" /> Threat Sources
            </h3>
            <div className="space-y-3">
              {threatSources.map((src) => (
                <div key={src.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: src.color }} />
                    {src.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(src.count / 345) * 100}%`, backgroundColor: src.color }} />
                    </div>
                    <span className="font-mono text-white/40 w-8 text-right">{src.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary-400" /> MITRE ATT&CK Map
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={mitreFramework}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="tactic" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 8 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-warning-400" /> Vulnerability DB
            </h3>
            <button className="text-xs text-primary-400">View All</button>
          </div>
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {vulnDb.map((v) => (
              <div key={v.id} className="glass rounded-xl p-3 text-xs group hover:border-primary-500/20 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-white/60">{v.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                    v.severity === 'Critical' ? 'text-danger-400 border-danger-500/20 bg-danger-500/10' :
                    v.severity === 'High' ? 'text-warning-400 border-warning-500/20 bg-warning-500/10' :
                    'text-primary-400 border-primary-500/20 bg-primary-500/10'
                  }`}>{v.severity}</span>
                </div>
                <div className="text-white/70 mb-1 line-clamp-1">{v.title}</div>
                <div className="flex justify-between text-white/30">
                  <span>CVSS: {v.score}</span>
                  <span>{new Date(v.published).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-accent-400" /> IOC Feed
            </h3>
            <button className="text-xs text-primary-400">Refresh</button>
          </div>
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {iocFeed.map((ioc, i) => (
              <div key={i} className="glass rounded-xl p-3 text-xs group hover:border-accent-500/20 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/40">{ioc.type}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    ioc.confidence === 'High' ? 'text-accent-400 bg-accent-500/10' :
                    ioc.confidence === 'Medium' ? 'text-warning-400 bg-warning-500/10' :
                    'text-white/30 bg-white/5'
                  }`}>{ioc.confidence}</span>
                </div>
                <div className="font-mono text-white/70 text-[11px] truncate">{ioc.value}</div>
                <div className="text-white/20 text-[10px] mt-1">First seen: {new Date(ioc.firstSeen).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-400" /> Threat Timeline
          </h3>
          <button className="text-xs text-primary-400">View Full History</button>
        </div>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary-500/50 via-secondary-500/30 to-transparent" />
          <div className="space-y-4 pl-10">
            {timelineData.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative"
              >
                <div className="absolute -left-[22px] top-1 w-2 h-2 rounded-full bg-primary-500 border-2 border-surface-darker" />
                <div className="glass rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-white/30">{new Date(item.time).toLocaleTimeString()}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-primary-500/10 text-primary-400">{item.type}</span>
                  </div>
                  <p className="text-sm text-white/70">{item.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedThreat && <DetailModal threat={selectedThreat} onClose={() => setSelectedThreat(null)} />}
      </AnimatePresence>
    </div>
  );
}
