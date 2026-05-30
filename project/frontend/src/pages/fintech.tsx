import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, TrendingDown, Shield, UserCheck,
  FileText, Activity, AlertTriangle, Clock, ArrowUp, ArrowDown,
  Wallet, BarChart3, PieChart, LineChart, CreditCard, Landmark,
  Receipt, Scale, Gauge, Sparkles, Lock, CheckCircle, XCircle,
  HelpCircle, Eye, MoreHorizontal, Download, RefreshCw,
  type LucideIcon
} from 'lucide-react';
import {
  LineChart as RechartsLine, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RePie, Pie, Cell
} from 'recharts';

const portfolioAssets = [
  { name: 'BTC', balance: '2.45', usdValue: '$154,230', change: '+3.2%', positive: true, allocation: 35 },
  { name: 'ETH', balance: '34.2', usdValue: '$112,860', change: '+5.7%', positive: true, allocation: 28 },
  { name: 'USDC', balance: '50,000', usdValue: '$50,000', change: '0%', positive: true, allocation: 15 },
  { name: 'SOL', balance: '890', usdValue: '$42,720', change: '-2.1%', positive: false, allocation: 10 },
  { name: 'MATIC', balance: '12,500', usdValue: '$8,750', change: '+1.8%', positive: true, allocation: 7 },
  { name: 'LINK', balance: '1,200', usdValue: '$18,000', change: '+4.3%', positive: true, allocation: 5 },
];

const riskMetrics = [
  { label: 'Portfolio Risk Score', value: '42/100', status: 'Moderate', color: 'text-warning-400', progress: 42 },
  { label: 'Market Volatility', value: 'High', status: 'Elevated', color: 'text-warning-400', progress: 75 },
  { label: 'Concentration Risk', value: 'Low', status: 'Diversified', color: 'text-accent-400', progress: 25 },
  { label: 'Liquidity Risk', value: 'Low', status: 'Healthy', color: 'text-accent-400', progress: 15 },
];

const insurancePolicies = [
  { id: 'POL-001', name: 'Smart Contract Cover', coverage: '$500,000', premium: '2.5 ETH/yr', status: 'Active', expires: 'Dec 2026' },
  { id: 'POL-002', name: 'Wallet Protection', coverage: '$250,000', premium: '1.2 ETH/yr', status: 'Active', expires: 'Jan 2027' },
  { id: 'POL-003', name: 'DeFi Yield Shield', coverage: '$1,000,000', premium: '5.0 ETH/yr', status: 'Pending', expires: 'Mar 2027' },
  { id: 'POL-004', name: 'NFT Insurance', coverage: '$100,000', premium: '0.8 ETH/yr', status: 'Expired', expires: 'May 2026' },
];

const paymentHistory = Array.from({ length: 10 }, (_, i) => ({
  id: `PAY-${String(1000 + i)}`,
  amount: (Math.random() * 50000 + 100).toFixed(2),
  currency: ['USDC', 'DAI', 'ETH', 'USDT'][Math.floor(Math.random() * 4)]!,
  status: ['Completed', 'Pending', 'Failed', 'Completed', 'Completed'][Math.floor(Math.random() * 5)]!,
  merchant: ['Binance', 'Coinbase', 'Uniswap', 'Aave', 'Compound', 'Curve'][Math.floor(Math.random() * 6)]!,
  date: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
  type: ['Deposit', 'Withdrawal', 'Swap', 'Payment', 'Transfer'][Math.floor(Math.random() * 5)]!,
}));

const complianceChecks = [
  { name: 'KYC Verification', status: 'Verified', date: '2026-01-15', icon: UserCheck, color: 'text-accent-400' },
  { name: 'AML Screening', status: 'Passed', date: '2026-05-28', icon: Shield, color: 'text-accent-400' },
  { name: 'Sanctions Check', status: 'Passed', date: '2026-05-28', icon: Lock, color: 'text-accent-400' },
  { name: 'PEP Screening', status: 'Clear', date: '2026-04-20', icon: Eye, color: 'text-accent-400' },
  { name: 'Tax Compliance', status: 'Pending', date: '2026-06-15', icon: FileText, color: 'text-warning-400' },
  { name: 'Audit Trail', status: 'Complete', date: '2026-05-01', icon: Activity, color: 'text-accent-400' },
];

const fraudAlerts = [
  { severity: 'High', type: 'Unusual Transaction Pattern', amount: '$12,450', time: '5m ago', action: 'Flagged' },
  { severity: 'Critical', type: 'Suspicious Login Attempt', amount: '-', time: '15m ago', action: 'Blocked' },
  { severity: 'Medium', type: 'Large Withdrawal Alert', amount: '$50,000', time: '1h ago', action: 'Review' },
  { severity: 'Low', type: 'New Device Login', amount: '-', time: '2h ago', action: 'Approved' },
];

const financialHealthData = {
  score: 78,
  categories: [
    { name: 'Liquidity', score: 85, max: 100 },
    { name: 'Stability', score: 72, max: 100 },
    { name: 'Growth', score: 68, max: 100 },
    { name: 'Security', score: 92, max: 100 },
    { name: 'Compliance', score: 90, max: 100 },
    { name: 'Efficiency', score: 62, max: 100 },
  ],
};

const tokenomicsData = {
  totalSupply: '100,000,000 SHIELD',
  circulating: '65,000,000 SHIELD',
  marketCap: '$520,000,000',
  holders: '45,678',
  distribution: [
    { name: 'Community', value: 40, color: '#06b6d4' },
    { name: 'Team', value: 20, color: '#a855f7' },
    { name: 'Investors', value: 15, color: '#f59e0b' },
    { name: 'Treasury', value: 15, color: '#10b981' },
    { name: 'Advisors', value: 10, color: '#ef4444' },
  ],
};

const getStatusClass = (s: string) => {
  switch (s) {
    case 'Completed': case 'Verified': case 'Passed': case 'Clear': case 'Complete': case 'Active': return 'text-accent-400 bg-accent-500/10 border-accent-500/20';
    case 'Pending': case 'Review': return 'text-warning-400 bg-warning-500/10 border-warning-500/20';
    case 'Failed': case 'Expired': case 'Blocked': case 'Flagged': return 'text-danger-400 bg-danger-500/10 border-danger-500/20';
    default: return 'text-white/50 bg-white/5 border-white/10';
  }
};

const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass rounded-2xl p-6 ${className}`}
  >
    {children}
  </motion.div>
);

const SectionHeader = ({ icon: Icon, title, action, color = 'text-primary-400' }: { icon: LucideIcon; title: string; action?: string; color?: string }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-semibold text-sm flex items-center gap-2">
      <Icon className={`w-4 h-4 ${color}`} /> {title}
    </h3>
    {action && <button className="text-xs text-primary-400 hover:text-primary-300 transition-colors">{action}</button>}
  </div>
);

export default function Fintech() {
  return (
    <div className="min-h-screen bg-surface-darker p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-accent-400" />
            Fintech Intelligence
          </h1>
          <p className="text-white/40 text-sm mt-1">Portfolio risk management and financial security</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl glass glass-hover text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="px-4 py-2 rounded-xl glass glass-hover text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard>
          <SectionHeader icon={Wallet} title="Portfolio Overview" action="View All" />
          <div className="space-y-2">
            {portfolioAssets.map((asset) => (
              <div key={asset.name} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0 group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl glass flex items-center justify-center text-xs font-bold">
                    {asset.name.slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white/80">{asset.name}</div>
                    <div className="text-xs text-white/30">{asset.balance} {asset.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-white/80">{asset.usdValue}</div>
                  <div className={`text-xs flex items-center gap-1 justify-end ${asset.positive ? 'text-accent-400' : 'text-danger-400'}`}>
                    {asset.positive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {asset.change}
                  </div>
                </div>
                <div className="w-12">
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-primary-500" style={{ width: `${asset.allocation}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard>
            <SectionHeader icon={Gauge} title="Financial Health Score" color="text-accent-400" />
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="url(#healthGrad)" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - financialHealthData.score / 100)}`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold font-mono text-accent-400">{financialHealthData.score}</span>
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                {financialHealthData.categories.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2 text-xs">
                    <span className="w-16 text-white/40">{cat.name}</span>
                    <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-primary-500" style={{ width: `${(cat.score / cat.max) * 100}%` }} />
                    </div>
                    <span className="font-mono text-white/40 w-6 text-right">{cat.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <SectionHeader icon={BarChart3} title="Risk Analysis" color="text-warning-400" />
            <div className="space-y-3">
              {riskMetrics.map((metric) => (
                <div key={metric.label} className="flex items-center justify-between text-xs">
                  <span className="text-white/50">{metric.label}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className={`h-full rounded-full ${metric.progress > 60 ? 'bg-danger-500' : metric.progress > 30 ? 'bg-warning-500' : 'bg-accent-500'}`}
                        style={{ width: `${metric.progress}%` }}
                      />
                    </div>
                    <span className={`font-mono ${metric.color} w-16 text-right`}>{metric.value}</span>
                    <span className="text-white/30 w-20">{metric.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard>
          <SectionHeader icon={Shield} title="Insurance Policies" action="View All" color="text-accent-400" />
          <div className="space-y-2">
            {insurancePolicies.map((pol) => (
              <div key={pol.id} className="glass rounded-xl p-3 text-xs group hover:border-primary-500/20 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-white/40">{pol.id}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] border ${getStatusClass(pol.status)}`}>{pol.status}</span>
                </div>
                <div className="text-white/70 font-medium mb-1">{pol.name}</div>
                <div className="flex justify-between text-white/30">
                  <span>{pol.coverage}</span>
                  <span>{pol.premium}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeader icon={UserCheck} title="Compliance Status" color="text-primary-400" />
          <div className="space-y-2">
            {complianceChecks.map((check) => {
              const Icon = check.icon;
              return (
                <div key={check.name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${check.color}`} />
                    <span className="text-xs text-white/70">{check.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getStatusClass(check.status)}`}>{check.status}</span>
                    <span className="text-[10px] text-white/20">{check.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeader icon={AlertTriangle} title="Fraud Detection" color="text-danger-400" />
          <div className="space-y-2">
            {fraudAlerts.map((alert, i) => (
              <div key={i} className="glass rounded-xl p-3 text-xs group hover:border-danger-500/20 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                    alert.severity === 'Critical' ? 'text-danger-400 border-danger-500/20 bg-danger-500/10' :
                    alert.severity === 'High' ? 'text-warning-400 border-warning-500/20 bg-warning-500/10' :
                    'text-primary-400 border-primary-500/20 bg-primary-500/10'
                  }`}>{alert.severity}</span>
                  <span className="text-white/20">{alert.time}</span>
                </div>
                <div className="text-white/70 mb-1">{alert.type}</div>
                <div className="flex justify-between text-white/30">
                  {alert.amount !== '-' && <span>{alert.amount}</span>}
                  <span className={`${
                    alert.action === 'Blocked' ? 'text-danger-400' :
                    alert.action === 'Flagged' ? 'text-warning-400' : 'text-accent-400'
                  }`}>{alert.action}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2">
          <SectionHeader icon={Receipt} title="Transaction History" action="Export" />
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  {['ID', 'Type', 'Amount', 'Merchant', 'Status', 'Date'].map((h) => (
                    <th key={h} className="text-left py-2.5 px-2 text-white/30 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((pay, i) => (
                  <motion.tr
                    key={pay.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-2.5 px-2 font-mono text-white/40">{pay.id}</td>
                    <td className="py-2.5 px-2 text-white/70">{pay.type}</td>
                    <td className="py-2.5 px-2 font-mono text-white/80">${Number(pay.amount).toLocaleString()} {pay.currency}</td>
                    <td className="py-2.5 px-2 text-white/50">{pay.merchant}</td>
                    <td className="py-2.5 px-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${getStatusClass(pay.status)}`}>{pay.status}</span>
                    </td>
                    <td className="py-2.5 px-2 text-white/30">{new Date(pay.date).toLocaleDateString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard>
          <SectionHeader icon={TrendingUp} title="Token Economics" color="text-secondary-400" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-[130px] h-[130px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RePie>
                  <Pie data={tokenomicsData.distribution} cx="50%" cy="50%" innerRadius={32} outerRadius={55} paddingAngle={3} dataKey="value">
                    {tokenomicsData.distribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
                </RePie>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 flex-1">
              {tokenomicsData.distribution.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name}
                  </span>
                  <span className="text-white/40">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: 'Total Supply', value: tokenomicsData.totalSupply },
              { label: 'Circulating', value: tokenomicsData.circulating },
              { label: 'Market Cap', value: tokenomicsData.marketCap },
              { label: 'Holders', value: tokenomicsData.holders },
            ].map((item) => (
              <div key={item.label} className="glass rounded-xl p-2">
                <div className="text-white/30">{item.label}</div>
                <div className="text-white/70 font-mono text-[11px] mt-0.5">{item.value}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
