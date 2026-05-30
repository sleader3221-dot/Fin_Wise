import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, Wallet, Activity, Shield, Search, FileText, Box,
  DollarSign, Link2, Database, Cpu, ArrowUp, ArrowDown,
  ChevronDown, ExternalLink, RefreshCw, CheckCircle, AlertTriangle,
  Clock, Gauge, Layers, Zap, Share2, Lock, Unlock, Scan,
  TrendingUp, Server, Hexagon, type LucideIcon
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const networks = [
  { name: 'Ethereum', status: 'Operational', block: '19,847,233', txCount: '1,234,567', gas: '12.5', color: '#627eea', sync: true },
  { name: 'Polygon', status: 'Operational', block: '48,912,344', txCount: '2,345,678', gas: '45.2', color: '#8247e5', sync: true },
  { name: 'BSC', status: 'Degraded', block: '34,567,890', txCount: '987,654', gas: '3.2', color: '#f0b90b', sync: false },
  { name: 'Arbitrum', status: 'Operational', block: '156,789,012', txCount: '567,890', gas: '0.25', color: '#2d374b', sync: true },
  { name: 'Optimism', status: 'Operational', block: '98,765,432', txCount: '345,678', gas: '0.05', color: '#ff0420', sync: true },
  { name: 'Avalanche', status: 'Operational', block: '23,456,789', txCount: '456,789', gas: '25.8', color: '#e84142', sync: true },
];

const mockTransactions = Array.from({ length: 12 }, (_, i) => ({
  hash: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
  from: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
  to: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
  value: (Math.random() * 100).toFixed(4),
  token: ['ETH', 'USDC', 'DAI', 'MATIC', 'BNB'][Math.floor(Math.random() * 5)]!,
  status: ['Confirmed', 'Pending', 'Failed'][Math.floor(Math.random() * 3)]!,
  timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
  type: ['Transfer', 'Swap', 'Approve', 'Stake', 'Bridge'][Math.floor(Math.random() * 5)]!,
}));

const gasHistory = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  ethereum: Math.floor(Math.random() * 80 + 10 + Math.sin(i * 0.5) * 20),
  polygon: Math.floor(Math.random() * 200 + 30 + Math.cos(i * 0.3) * 50),
  bsc: Math.floor(Math.random() * 10 + 3 + Math.sin(i * 0.7) * 3),
}));

const defiProtocols = [
  { name: 'Aave', tvl: '12.4B', health: 94, risk: 'Low', change: '+2.3%' },
  { name: 'Uniswap', tvl: '8.7B', health: 88, risk: 'Low', change: '-1.2%' },
  { name: 'Curve', tvl: '6.2B', health: 76, risk: 'Medium', change: '+0.8%' },
  { name: 'Compound', tvl: '4.1B', health: 91, risk: 'Low', change: '+3.5%' },
  { name: 'Lido', tvl: '35.8B', health: 85, risk: 'Medium', change: '+5.1%' },
  { name: 'MakerDAO', tvl: '9.3B', health: 97, risk: 'Low', change: '+1.0%' },
];

const nftCollections = [
  { name: 'Bored Ape', floor: '32.5 ETH', volume24h: '1,245 ETH', change: '+5.2%', safety: 92 },
  { name: 'Pudgy Penguins', floor: '8.2 ETH', volume24h: '890 ETH', change: '-2.1%', safety: 85 },
  { name: 'Azuki', floor: '5.8 ETH', volume24h: '456 ETH', change: '+1.3%', safety: 78 },
  { name: 'DeGods', floor: '3.4 ETH', volume24h: '234 ETH', change: '-0.5%', safety: 70 },
];

const bridgeStatuses = [
  { name: 'Ethereum <-> Arbitrum', status: 'Active', latency: '12m', tvl: '3.2B' },
  { name: 'Ethereum <-> Polygon', status: 'Active', latency: '25m', tvl: '2.8B' },
  { name: 'Ethereum <-> Optimism', status: 'Active', latency: '8m', tvl: '1.9B' },
  { name: 'BSC <-> Ethereum', status: 'Delayed', latency: '45m', tvl: '1.1B' },
];

const stakingPools = [
  { name: 'ETH Staking', apy: '4.2%', totalStaked: '23.4M ETH', rewards: '0.05 ETH/day' },
  { name: 'MATIC Staking', apy: '8.7%', totalStaked: '1.2B MATIC', rewards: '12.5 MATIC/day' },
  { name: 'BNB Staking', apy: '6.3%', totalStaked: '500K BNB', rewards: '0.08 BNB/day' },
  { name: 'AVAX Staking', apy: '9.1%', totalStaked: '250M AVAX', rewards: '1.5 AVAX/day' },
];

const getStatusColor = (s: string) => {
  switch (s) {
    case 'Confirmed': return 'text-accent-400';
    case 'Pending': return 'text-warning-400';
    default: return 'text-danger-400';
  }
};

const getStatusBg = (s: string) => {
  switch (s) {
    case 'Confirmed': return 'bg-accent-500/10 border-accent-500/20';
    case 'Pending': return 'bg-warning-500/10 border-warning-500/20';
    default: return 'bg-danger-500/10 border-danger-500/20';
  }
};

const ServiceCard = ({
  icon: Icon, title, children, color = 'text-primary-400', className = ''
}: {
  icon: LucideIcon; title: string; children: React.ReactNode; color?: string; className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass rounded-2xl p-6 ${className}`}
  >
    <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
      <Icon className={`w-4 h-4 ${color}`} /> {title}
    </h3>
    {children}
  </motion.div>
);

const StakingCard = ({
  icon: Icon, title, children, color = 'text-accent-400'
}: {
  icon: LucideIcon; title: string; children: React.ReactNode; color?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass rounded-xl p-4 group hover:neon-glow-accent transition-all duration-500"
  >
    <h4 className="text-xs text-white/40 mb-3 flex items-center gap-2">
      <Icon className={`w-3 h-3 ${color}`} /> {title}
    </h4>
    {children}
  </motion.div>
);

export default function Blockchain() {
  const [selectedNetwork, setSelectedNetwork] = useState('Ethereum');

  return (
    <div className="min-h-screen bg-surface-darker p-4 lg:p-6 space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Hexagon className="w-6 h-6 text-primary-400" />
            Blockchain Security
          </h1>
          <p className="text-white/40 text-sm mt-1">Multi-chain monitoring and security platform</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl glass glass-hover text-sm flex items-center gap-2">
            <Wallet className="w-4 h-4" /> Connect Wallet
          </button>
          <button className="px-4 py-2 rounded-xl glass glass-hover text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Sync All
          </button>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {networks.map((net, i) => (
          <motion.button
            key={net.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedNetwork(net.name)}
            className={`glass rounded-xl p-4 text-left group transition-all ${
              selectedNetwork === net.name ? 'neon-glow border-primary-500/40' : 'glass-hover'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: net.color }} />
              <span className="text-sm font-medium flex-1">{net.name}</span>
              <div className={`w-2 h-2 rounded-full ${net.sync ? 'bg-accent-400 animate-pulse' : 'bg-warning-400'}`} />
            </div>
            <div className="text-[10px] text-white/30 space-y-0.5">
              <div>Block: <span className="text-white/60 font-mono">{net.block}</span></div>
              <div>Gas: <span className="text-white/60 font-mono">{net.gas} Gwei</span></div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ServiceCard icon={Activity} title="Transaction Monitor" color="text-primary-400">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  {['Hash', 'Type', 'Value', 'Status', 'Time'].map((h) => (
                    <th key={h} className="text-left py-2 px-1 text-white/30 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockTransactions.slice(0, 6).map((tx, i) => (
                  <motion.tr
                    key={tx.hash}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-2 px-1 font-mono text-white/60">{tx.hash.slice(0, 10)}...</td>
                    <td className="py-2 px-1 text-white/70">{tx.type}</td>
                    <td className="py-2 px-1 font-mono text-white/70">{tx.value} {tx.token}</td>
                    <td className="py-2 px-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${getStatusBg(tx.status)} ${getStatusColor(tx.status)}`}>{tx.status}</span>
                    </td>
                    <td className="py-2 px-1 text-white/30">{new Date(tx.timestamp).toLocaleTimeString()}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="mt-3 text-xs text-primary-400 hover:text-primary-300 transition-colors">View All Transactions</button>
        </ServiceCard>

        <ServiceCard icon={Gauge} title="Gas Price Tracker" color="text-warning-400">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gasHistory}>
                <XAxis dataKey="hour" stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} interval={3} />
                <YAxis stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
                <Line type="monotone" dataKey="ethereum" stroke="#627eea" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="polygon" stroke="#8247e5" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="bsc" stroke="#f0b90b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-3 text-xs text-white/30">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#627eea' }} /> Ethereum</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8247e5' }} /> Polygon</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f0b90b' }} /> BSC</span>
          </div>
        </ServiceCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <ServiceCard icon={Shield} title="Smart Contract Auditor" color="text-danger-400" className="lg:col-span-2">
          <div className="flex items-center gap-4 mb-4">
            <input
              type="text"
              placeholder="Enter contract address to audit..."
              className="flex-1 h-10 px-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-primary-500/50 transition-all"
            />
            <button className="px-4 h-10 rounded-xl bg-danger-500/20 text-danger-400 border border-danger-500/20 text-sm font-medium flex items-center gap-2 hover:bg-danger-500/30 transition-colors shrink-0">
              <Scan className="w-4 h-4" /> Audit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { label: 'Reentrancy', score: 'A', color: 'text-accent-400' },
              { label: 'Access Control', score: 'A', color: 'text-accent-400' },
              { label: 'Arithmetic', score: 'B', color: 'text-primary-400' },
              { label: 'Front-running', score: 'C', color: 'text-warning-400' },
              { label: 'Oracle Manip.', score: 'B', color: 'text-primary-400' },
              { label: 'Flash Loan', score: 'A', color: 'text-accent-400' },
            ].map((item) => (
              <div key={item.label} className="glass rounded-xl p-3 flex items-center justify-between">
                <span className="text-white/50">{item.label}</span>
                <span className={`font-bold font-mono ${item.color}`}>{item.score}</span>
              </div>
            ))}
          </div>
        </ServiceCard>

        <ServiceCard icon={Layers} title="DeFi Protocol Health" color="text-accent-400">
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {defiProtocols.map((p) => (
              <div key={p.name} className="glass rounded-xl p-3 text-xs group hover:border-primary-500/20 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white/80">{p.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    p.risk === 'Low' ? 'text-accent-400 bg-accent-500/10' : 'text-warning-400 bg-warning-500/10'
                  }`}>{p.risk}</span>
                </div>
                <div className="flex justify-between text-white/30 mb-1">
                  <span>TVL: {p.tvl}</span>
                  <span className={p.change.startsWith('+') ? 'text-accent-400' : 'text-danger-400'}>{p.change}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-accent-500" style={{ width: `${p.health}%` }} />
                  </div>
                  <span className="font-mono text-white/40">{p.health}%</span>
                </div>
              </div>
            ))}
          </div>
        </ServiceCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ServiceCard icon={Search} title="NFT Security Scanner" color="text-secondary-400">
          <div className="space-y-3">
            {nftCollections.map((nft, i) => (
              <motion.div
                key={nft.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl p-4 flex items-center justify-between group hover:border-secondary-500/20 transition-all"
              >
                <div>
                  <div className="text-sm font-medium text-white/80">{nft.name}</div>
                  <div className="text-xs text-white/30 mt-0.5">Floor: {nft.floor}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-mono ${nft.change.startsWith('+') ? 'text-accent-400' : 'text-danger-400'}`}>{nft.change}</div>
                  <div className="text-xs text-white/30">Vol: {nft.volume24h}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${nft.safety > 80 ? 'bg-accent-400' : nft.safety > 70 ? 'bg-warning-400' : 'bg-danger-400'}`} />
                  <span className="text-xs text-white/40">{nft.safety}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </ServiceCard>

        <div className="space-y-6">
          <ServiceCard icon={Share2} title="Cross-Chain Bridge Status" color="text-primary-400">
            <div className="space-y-2">
              {bridgeStatuses.map((bridge) => (
                <div key={bridge.name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="text-sm text-white/70">{bridge.name}</div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={`${bridge.status === 'Active' ? 'text-accent-400' : 'text-warning-400'}`}>{bridge.status}</span>
                    <span className="text-white/30">{bridge.latency}</span>
                    <span className="text-white/30 font-mono">{bridge.tvl}</span>
                  </div>
                </div>
              ))}
            </div>
          </ServiceCard>

          <ServiceCard icon={Zap} title="Staking & Insurance" color="text-accent-400">
            <div className="grid grid-cols-2 gap-3">
              {stakingPools.map((pool) => (
                <StakingCard key={pool.name} icon={DollarSign} title={pool.name}>
                  <div className="text-lg font-bold font-mono text-accent-400">{pool.apy}</div>
                  <div className="text-xs text-white/30 mt-1">Staked: {pool.totalStaked}</div>
                  <div className="text-xs text-white/30">{pool.rewards}</div>
                </StakingCard>
              ))}
            </div>
          </ServiceCard>
        </div>
      </div>
    </div>
  );
}
