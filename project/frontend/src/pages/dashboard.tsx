import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Bell, Wallet, ChevronDown, Menu, X, LayoutDashboard,
  Shield, Activity, BarChart3, Globe, DollarSign, LineChart,
  AlertTriangle, CheckCircle, Clock, Zap, ArrowUp, ArrowDown,
  ShieldAlert, Server, Network, Cpu, Database, Eye, Lock,
  TrendingUp, Users, FileText, Settings, HelpCircle, LogOut,
  Hexagon, MoreHorizontal, Play, Pause, ExternalLink,
  type LucideIcon
} from 'lucide-react';
import {
  LineChart as RechartsLine, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const navItems: { icon: LucideIcon; label: string; active?: boolean }[] = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Shield, label: 'Threat Intelligence' },
  { icon: Globe, label: 'Blockchain' },
  { icon: DollarSign, label: 'Fintech' },
  { icon: BarChart3, label: 'Analytics' },
  { icon: Activity, label: 'Monitor' },
  { icon: FileText, label: 'Reports' },
  { icon: Settings, label: 'Settings' },
];

const quickActions = [
  { icon: Shield, label: 'Run Scan', color: 'text-primary-400' },
  { icon: Eye, label: 'View Threats', color: 'text-danger-400' },
  { icon: Lock, label: 'Audit Contract', color: 'text-secondary-400' },
  { icon: TrendingUp, label: 'Risk Report', color: 'text-warning-400' },
];

const threatChartData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  critical: Math.floor(Math.random() * 20 + 5),
  high: Math.floor(Math.random() * 30 + 10),
  medium: Math.floor(Math.random() * 40 + 15),
  low: Math.floor(Math.random() * 50 + 20),
}));

const networkTraffic = Array.from({ length: 20 }, (_, i) => ({
  time: `${i * 5}m`,
  incoming: Math.floor(Math.random() * 800 + 200),
  outgoing: Math.floor(Math.random() * 600 + 100),
  threats: Math.floor(Math.random() * 50 + 5),
}));

const threatCategories = [
  { name: 'Malware', value: 35, color: '#ef4444' },
  { name: 'Phishing', value: 25, color: '#f59e0b' },
  { name: 'DDoS', value: 20, color: '#06b6d4' },
  { name: 'Ransomware', value: 12, color: '#a855f7' },
  { name: 'Exploit', value: 8, color: '#10b981' },
];

const recentAlerts = Array.from({ length: 8 }, (_, i) => ({
  id: `ALERT-${String(1000 + i)}`,
  title: ['Critical SQL Injection Attempt', 'Suspicious Wallet Drain', 'DDoS Attack Detected', 'Smart Contract Vulnerability', 'Phishing Campaign Detected', 'Ransomware Payload Blocked', 'Unusual Network Activity', 'Zero-Day Exploit Attempt'][i]!,
  severity: ['Critical', 'High', 'Medium', 'High', 'Critical', 'Medium', 'Low', 'Critical'][i]!,
  source: ['Web App', 'Ethereum', 'Network', 'BSC', 'Email', 'Endpoint', 'Polygon', 'DNS'][i]!,
  time: `${Math.floor(Math.random() * 60)}m ago`,
}));

const threatMapDots = Array.from({ length: 40 }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 6 + 3,
  color: ['#ef4444', '#f59e0b', '#06b6d4', '#10b981'][Math.floor(Math.random() * 4)]!,
  pulse: Math.random() > 0.7,
}));

const statCards: { icon: LucideIcon; label: string; value: string; change: string; positive: boolean }[] = [
  { icon: ShieldAlert, label: 'Total Threats Blocked', value: '12,847', change: '+12.5%', positive: true },
  { icon: AlertTriangle, label: 'Active Threats', value: '23', change: '-8.1%', positive: true },
  { icon: Gauge, label: 'Risk Score', value: '18/100', change: '-3.2%', positive: true },
  { icon: CheckCircle, label: 'System Health', value: '98.7%', change: '+0.3%', positive: true },
];

const Gauge = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" />
  </svg>
);

const Sidebar = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <>
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-surface-dark/95 backdrop-blur-xl border-r border-white/5 flex flex-col ${open ? 'block' : 'hidden lg:flex'}`}
    >
      <div className="p-4 border-b border-white/5 flex items-center gap-3">
        <Hexagon className="w-8 h-8 text-primary-400" />
        <div>
          <div className="font-bold gradient-text">ShieldNet</div>
          <div className="text-xs text-white/30">Security Dashboard</div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              item.active
                ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-white/5 space-y-1">
        {[{ icon: HelpCircle, label: 'Help' }, { icon: Settings, label: 'Settings' }, { icon: LogOut, label: 'Logout' }].map((item) => (
          <button key={item.label} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </motion.aside>

    {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />}
  </>
);

const ThreatMap = () => (
  <div className="glass rounded-2xl p-6 relative overflow-hidden h-[300px]">
    <div className="relative z-10 flex items-center justify-between mb-4">
      <h3 className="font-semibold text-sm flex items-center gap-2">
        <Globe className="w-4 h-4 text-primary-400" /> Global Threat Map
      </h3>
      <div className="flex gap-3 text-xs text-white/30">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger-500" /> Critical</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning-500" /> High</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary-500" /> Medium</span>
      </div>
    </div>
    <div className="relative w-full h-[calc(100%-40px)] bg-grid rounded-xl overflow-hidden">
      {threatMapDots.map((dot, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${dot.pulse ? 'animate-ping' : ''}`}
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.size,
            height: dot.size,
            backgroundColor: dot.color,
            opacity: 0.6 + (dot.pulse ? 0.4 : 0),
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  </div>
);

const StatCard = ({ stat, index }: { stat: typeof statCards[0]; index: number }) => {
  const Icon = stat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass rounded-2xl p-5 group hover:neon-glow transition-all duration-500"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
          <Icon className={`w-5 h-5 ${index === 2 ? 'text-warning-400' : index === 0 ? 'text-primary-400' : index === 3 ? 'text-accent-400' : 'text-danger-400'}`} />
        </div>
        <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.positive ? 'text-accent-400' : 'text-danger-400'}`}>
          {stat.positive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {stat.change}
        </span>
      </div>
      <div className="text-2xl font-bold font-mono mb-1">{stat.value}</div>
      <div className="text-white/40 text-xs">{stat.label}</div>
    </motion.div>
  );
};

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-darker flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 bg-surface-dark/50 backdrop-blur-xl flex items-center px-4 lg:px-6 gap-4">
          <button className="lg:hidden p-2" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search threats, transactions..."
                className="w-full h-10 pl-10 pr-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-primary-500/50 focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl glass glass-hover">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger-500 animate-ping" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger-500" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass glass-hover text-sm group">
              <Wallet className="w-4 h-4 text-accent-400 group-hover:scale-110 transition-transform" />
              <span className="text-white/70">0x742...dEf3</span>
              <ChevronDown className="w-3 h-3 text-white/30" />
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-xs font-bold">
              JD
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Security Dashboard</h1>
              <p className="text-white/40 text-sm mt-1">Real-time security overview and monitoring</p>
            </div>
            <div className="flex gap-2">
              {[Play, ExternalLink].map((Icon, i) => (
                <button key={i} className="p-2 rounded-xl glass glass-hover">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {statCards.map((stat, i) => <StatCard key={stat.label} stat={stat} index={i} />)}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <ThreatMap />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-warning-400" /> Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      className="glass rounded-xl p-4 text-center group hover:neon-glow transition-all duration-300"
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${action.color} group-hover:scale-110 transition-transform`} />
                      <span className="text-xs text-white/60">{action.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 p-3 glass rounded-xl">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-white/40">System Status</span>
                  <span className="text-accent-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" /> All Systems</span>
                </div>
                {[
                  { label: 'Threat Detection', status: 'Operational', color: 'text-accent-400' },
                  { label: 'Blockchain Nodes', status: 'Synced', color: 'text-accent-400' },
                  { label: 'AI Engine', status: 'Active', color: 'text-accent-400' },
                  { label: 'Network Monitor', status: 'Operational', color: 'text-accent-400' },
                ].map((sys) => (
                  <div key={sys.label} className="flex items-center justify-between py-1.5 text-xs">
                    <span className="text-white/40">{sys.label}</span>
                    <span className={`${sys.color} flex items-center gap-1`}>
                      <span className="w-1 h-1 rounded-full bg-current" /> {sys.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary-400" /> Threat Activity
                </h3>
                <div className="flex gap-3 text-xs">
                  {['Critical', 'High', 'Medium', 'Low'].map((lvl, i) => (
                    <span key={lvl} className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${['bg-danger-500', 'bg-warning-500', 'bg-primary-500', 'bg-white/30'][i]}`} />
                      {lvl}
                    </span>
                  ))}
                </div>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={threatChartData}>
                    <defs>
                      {['critical', 'high', 'medium', 'low'].map((key, i) => (
                        <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={['#ef4444', '#f59e0b', '#06b6d4', '#94a3b8'][i]!} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={['#ef4444', '#f59e0b', '#06b6d4', '#94a3b8'][i]!} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <XAxis dataKey="hour" stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} interval={3} />
                    <YAxis stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
                    {['critical', 'high', 'medium', 'low'].map((key, i) => (
                      <Area key={key} type="monotone" dataKey={key} stroke={['#ef4444', '#f59e0b', '#06b6d4', '#94a3b8'][i]!} fill={`url(#gradient-${key})`} strokeWidth={1.5} stackId="1" />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <PieChart {...{ width: 16, height: 16 }} className="text-secondary-400" /> Threat Categories
                </h3>
                <button className="text-xs text-white/30 hover:text-white/60 transition-colors">View All</button>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-[180px] h-[180px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={threatCategories} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                        {threatCategories.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 flex-1">
                  {threatCategories.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </span>
                      <span className="text-white/40">{cat.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Network className="w-4 h-4 text-primary-400" /> Network Traffic
                </h3>
                <div className="flex gap-3 text-xs text-white/30">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary-400" /> Incoming</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-400" /> Outgoing</span>
                </div>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={networkTraffic}>
                    <defs>
                      <linearGradient id="incomingGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="outgoingGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} interval={4} />
                    <YAxis stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
                    <Area type="monotone" dataKey="incoming" stroke="#06b6d4" fill="url(#incomingGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="outgoing" stroke="#10b981" fill="url(#outgoingGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4 text-warning-400" /> Recent Alerts
                </h3>
                <button className="text-xs text-primary-400 hover:text-primary-300 transition-colors">View All</button>
              </div>
              <div className="space-y-2">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center gap-3 p-3 rounded-xl glass text-xs group hover:border-primary-500/20 transition-all">
                    <div className={`shrink-0 w-2 h-2 rounded-full ${
                      alert.severity === 'Critical' ? 'bg-danger-500' :
                      alert.severity === 'High' ? 'bg-warning-500' :
                      alert.severity === 'Medium' ? 'bg-primary-500' : 'bg-white/30'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white/80 truncate">{alert.title}</div>
                      <div className="text-white/30 mt-0.5">{alert.source} &middot; {alert.time}</div>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-mono border ${
                      alert.severity === 'Critical' ? 'text-danger-400 border-danger-500/20 bg-danger-500/10' :
                      alert.severity === 'High' ? 'text-warning-400 border-warning-500/20 bg-warning-500/10' :
                      alert.severity === 'Medium' ? 'text-primary-400 border-primary-500/20 bg-primary-500/10' :
                      'text-white/30 border-white/10'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
