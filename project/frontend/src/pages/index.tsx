import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Shield, ShieldOff, Network, Brain, Cpu, Lock, FileSearch, Fingerprint,
  Wallet, Users, ScrollText, Eye, Search, Siren, BarChart3, Activity,
  Globe, UserCheck, Bug, Bell, DollarSign, TrendingUp, Crosshair,
  Server, Key, FileJson, LineChart, MessageSquare, Box, Vote,
  ChevronRight, ChevronDown, Menu, X, Star, Zap, ArrowRight,
  AlertTriangle, CheckCircle, Clock, ExternalLink, Play, Pause,
  Github, Twitter, Linkedin, Send, Sparkles, Hexagon, ShieldCheck,
  Radio, Satellite, Radar, Scan, Cctv, Wind, Waves, Gauge,
  type LucideIcon
} from 'lucide-react';
import { LineChart as RechartsLine, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type FeatureCard = { icon: LucideIcon; title: string; description: string };

const features: FeatureCard[] = [
  { icon: Brain, title: 'AI Threat Intelligence', description: 'Real-time threat detection powered by advanced ML algorithms' },
  { icon: Lock, title: 'Blockchain Security', description: 'Decentralized security protocols for Web3 infrastructure' },
  { icon: FileSearch, title: 'Smart Contract Auditor', description: 'Automated vulnerability scanning and code analysis' },
  { icon: Siren, title: 'Fraud Detection', description: 'AI-powered fraud prevention across all transactions' },
  { icon: BarChart3, title: 'Risk Scoring', description: 'Predictive risk assessment with real-time scoring' },
  { icon: ScrollText, title: 'Compliance Engine', description: 'Automated regulatory compliance monitoring' },
  { icon: Wallet, title: 'Wallet Security', description: 'Multi-signature protection and wallet monitoring' },
  { icon: Users, title: 'DAO Governance', description: 'Decentralized decision making and voting' },
  { icon: Shield, title: 'Insurance Protocol', description: 'Smart contract insurance and coverage' },
  { icon: Fingerprint, title: 'Identity Management', description: 'Decentralized identity (DID) management' },
  { icon: Eye, title: 'Real-time Monitoring', description: '24/7 security monitoring and alerts' },
  { icon: Search, title: 'Forensic Analysis', description: 'Blockchain forensics and investigation tools' },
  { icon: ShieldOff, title: 'Phishing Protection', description: 'AI-powered anti-phishing detection' },
  { icon: Activity, title: 'Network Analysis', description: 'Traffic pattern analysis and anomaly detection' },
  { icon: Globe, title: 'Dark Web Intel', description: 'Dark web monitoring and threat intelligence' },
  { icon: UserCheck, title: 'KYC/AML', description: 'Automated compliance and identity verification' },
  { icon: Bug, title: 'Penetration Testing', description: 'Automated security testing and assessment' },
  { icon: Bell, title: 'Incident Response', description: 'Automated incident response system' },
  { icon: DollarSign, title: 'Token Economics', description: 'Tokenomics simulation and analysis' },
  { icon: TrendingUp, title: 'Price Oracle', description: 'Real-time price feeds and oracles' },
  { icon: Crosshair, title: 'Quantum Security', description: 'Quantum-resistant encryption protocols' },
  { icon: Server, title: 'Cross-Chain Bridge', description: 'Multi-chain monitoring and bridging' },
  { icon: Key, title: 'Behavioral Auth', description: 'Biometric and behavioral authentication' },
  { icon: FileJson, title: 'Zero-Knowledge Proof', description: 'Privacy layer with ZK-proofs' },
  { icon: Lock, title: 'Encryption Suite', description: 'Advanced encryption and key management' },
  { icon: Scan, title: 'Audit Trail', description: 'Immutable audit logging' },
  { icon: LineChart, title: 'Predictive Analytics', description: 'ML-powered predictions and insights' },
  { icon: MessageSquare, title: 'AI Assistant', description: 'Intelligent chatbot and support' },
  { icon: Box, title: 'Data Visualization', description: '3D analytics and visualization' },
  { icon: Vote, title: 'Governance Voting', description: 'DAO voting and proposal system' },
];

const threatData = [
  { time: '00:00', threats: 42, blocked: 40 },
  { time: '04:00', threats: 78, blocked: 75 },
  { time: '08:00', threats: 156, blocked: 148 },
  { time: '12:00', threats: 234, blocked: 220 },
  { time: '16:00', threats: 189, blocked: 182 },
  { time: '20:00', threats: 98, blocked: 95 },
  { time: 'Now', threats: 145, blocked: 140 },
];

const stats = [
  { value: '10,000+', label: 'Threats Blocked', icon: ShieldCheck },
  { value: '99.9%', label: 'Uptime', icon: CheckCircle },
  { value: '500+', label: 'Enterprises', icon: Star },
  { value: '<1ms', label: 'Response Time', icon: Zap },
];

const trustedBy = [
  'Chainlink', 'Aave', 'Uniswap', 'Polygon', 'Arbitrum', 'Optimism',
  'MakerDAO', 'Compound', 'Curve', 'Balancer', 'SushiSwap', 'Lido'
];

const liveDemoData = Array.from({ length: 20 }, (_, i) => ({
  id: `THR-${String(Math.floor(Math.random() * 90000) + 10000)}`,
  type: ['Malware', 'Phishing', 'DDoS', 'Ransomware', 'Exploit'][Math.floor(Math.random() * 5)],
  severity: ['Critical', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)],
  source: ['Dark Web', 'Email', 'Network', 'Blockchain', 'Endpoint'][Math.floor(Math.random() * 5)],
  status: ['Blocked', 'Investigating', 'Active'][Math.floor(Math.random() * 3)],
  timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
}));

function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, end, duration]);

  return { count, ref };
}

const AnimatedCounter = ({ end, suffix = '', label, icon: Icon }: { end: number; suffix?: string; label: string; icon: LucideIcon }) => {
  const { count, ref } = useCountUp(end);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-2xl p-6 text-center group hover:neon-glow transition-all duration-500"
    >
      <Icon className="w-8 h-8 mx-auto mb-3 text-primary-400 group-hover:scale-110 transition-transform" />
      <div className="text-4xl md:text-5xl font-bold font-mono gradient-text mb-1">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-white/60 text-sm">{label}</div>
    </motion.div>
  );
};

const ParticleNetwork = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
    const particleCount = 80;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 3 + 1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const dx = mouseRef.current.x * canvas.width - p.x;
        const dy = mouseRef.current.y * canvas.height - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseRef.current.x * canvas.width, mouseRef.current.y * canvas.height);
          ctx.strokeStyle = `rgba(6, 182, 212, ${0.15 * (1 - dist / 200)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.fill();
      });

      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.1 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      requestAnimationFrame(animate);
    };
    animate();

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
    };
    window.addEventListener('mousemove', handleMouse);
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

const TypewriterText = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayed}
      {!done && <span className="animate-pulse text-primary-400">|</span>}
    </span>
  );
};

const FeatureCard = ({ feature, index }: { feature: FeatureCard; index: number }) => {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="glass glass-hover rounded-xl p-5 group cursor-default"
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
          <Icon className="w-5 h-5 text-primary-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white group-hover:text-primary-300 transition-colors mb-1">{feature.title}</h3>
          <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
        </div>
      </div>
    </motion.div>
  );
};

const HeroSection = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0 bg-grid-glow" />
    <ParticleNetwork />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-darker/50 to-surface-darker" />

    <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-primary-300 mb-8 border-primary-500/20">
          <Sparkles className="w-4 h-4" />
          <span>Next-Gen Security Infrastructure</span>
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
      >
        <span className="gradient-text text-7xl md:text-8xl lg:text-9xl">ShieldNet</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto mb-4 h-8"
      >
        <TypewriterText text="The World's Most Advanced AI-Powered Decentralized Cybersecurity & Fintech Intelligence Platform" />
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="text-white/40 text-sm md:text-base mb-10 max-w-2xl mx-auto"
      >
        Protect, analyze, and secure your digital assets with real-time AI threat detection,
        blockchain security protocols, and predictive intelligence.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="flex flex-wrap gap-4 justify-center"
      >
        <button className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/25">
          <span className="relative z-10 flex items-center gap-2">
            Get Started Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        <button className="px-8 py-4 rounded-xl glass glass-hover text-white font-semibold text-lg border-white/20 hover:border-primary-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2">
          <Play className="w-5 h-5" /> Watch Demo
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-16 flex items-center justify-center gap-8 text-white/30 text-sm"
      >
        <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-accent-400" /> No credit card</span>
        <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-accent-400" /> 14-day trial</span>
        <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-accent-400" /> Instant setup</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="w-6 h-6 text-white/20 animate-bounce" />
      </motion.div>
    </div>
  </section>
);

const StatsSection = () => (
  <section className="py-20 relative">
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <AnimatedCounter end={10000} suffix="+" label="Threats Blocked" icon={ShieldCheck} />
        <AnimatedCounter end={999} suffix="%" label="Uptime" icon={CheckCircle} />
        <AnimatedCounter end={500} suffix="+" label="Enterprises" icon={Star} />
        <AnimatedCounter end={1} suffix="ms" label="Response Time" icon={Zap} />
      </div>
    </div>
  </section>
);

const LiveDemoSection = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [alerts, setAlerts] = useState(liveDemoData.slice(0, 6));

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const newAlert = {
        id: `THR-${String(Math.floor(Math.random() * 90000) + 10000)}`,
        type: ['Malware', 'Phishing', 'DDoS', 'Ransomware', 'Exploit'][Math.floor(Math.random() * 5)]!,
        severity: ['Critical', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)]!,
        source: ['Dark Web', 'Email', 'Network', 'Blockchain', 'Endpoint'][Math.floor(Math.random() * 5)]!,
        status: ['Blocked', 'Investigating', 'Active'][Math.floor(Math.random() * 3)]!,
        timestamp: new Date().toISOString(),
      };
      setAlerts((prev) => [newAlert, ...prev.slice(0, 7)]);
    }, 1500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const getSeverityColor = (s: string) => {
    switch (s) {
      case 'Critical': return 'text-danger-400 bg-danger-500/10 border-danger-500/20';
      case 'High': return 'text-warning-400 bg-warning-500/10 border-warning-500/20';
      case 'Medium': return 'text-primary-400 bg-primary-500/10 border-primary-500/20';
      default: return 'text-white/50 bg-white/5 border-white/10';
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Blocked': return 'text-accent-400';
      case 'Investigating': return 'text-warning-400';
      default: return 'text-danger-400';
    }
  };

  return (
    <section className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Live <span className="gradient-text">Threat Detection</span>
          </h2>
          <p className="text-white/50">Real-time threat monitoring and AI-powered blocking in action</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold flex items-center gap-2">
                <Radio className="w-4 h-4 text-danger-400 animate-pulse" />
                Threat Feed
              </h3>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              <AnimatePresence>
                {alerts.map((alert, i) => (
                  <motion.div
                    key={alert.id + i}
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    className="glass rounded-lg p-3 flex items-center gap-3 text-sm"
                  >
                    <div className={`shrink-0 px-2 py-0.5 rounded text-xs font-mono border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </div>
                    <span className="font-mono text-white/60 w-24">{alert.id}</span>
                    <span className="text-white/80">{alert.type}</span>
                    <span className="text-white/40 hidden md:inline">{alert.source}</span>
                    <span className={`ml-auto ${getStatusColor(alert.status)}`}>{alert.status}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-400" />
              Threat Trends
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={threatData}>
                  <defs>
                    <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                  <YAxis stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                    }}
                  />
                  <Area type="monotone" dataKey="threats" stroke="#06b6d4" fill="url(#threatGradient)" strokeWidth={2} />
                  <Area type="monotone" dataKey="blocked" stroke="#10b981" fill="none" strokeWidth={2} strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-4 text-xs text-white/40">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary-400" /> Threats</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent-400" /> Blocked</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => (
  <section className="py-20 relative">
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/5 to-transparent pointer-events-none" />
    <div className="max-w-7xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Everything You Need for <span className="gradient-text">Complete Security</span>
        </h2>
        <p className="text-white/50 max-w-2xl mx-auto">
          30+ integrated modules covering threat intelligence, blockchain security, compliance, and more
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {features.map((feature, i) => (
          <FeatureCard key={feature.title} feature={feature} index={i} />
        ))}
      </div>
    </div>
  </section>
);

const TrustedBySection = () => (
  <section className="py-20 relative">
    <div className="max-w-6xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-2xl font-bold mb-2">Trusted by Leading Protocols</h2>
        <p className="text-white/40 text-sm">Securing the most innovative projects in Web3</p>
      </motion.div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {trustedBy.map((name, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-4 flex items-center justify-center h-16 group hover:neon-glow transition-all duration-500 cursor-default"
          >
            <span className="text-white/30 group-hover:text-white/60 font-semibold text-sm transition-colors">{name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const CTASection = () => (
  <section className="py-20 relative">
    <div className="max-w-4xl mx-auto px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="glass rounded-3xl p-12 md:p-16 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-secondary-500/5 to-accent-500/10" />
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Ready to Secure Your <span className="gradient-text">Future</span>?
          </h2>
          <p className="text-white/50 mb-8 max-w-xl mx-auto">
            Join 500+ enterprises already using ShieldNet to protect their digital assets
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="group px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/25 flex items-center gap-2">
              Start Free Trial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 rounded-xl glass glass-hover text-white/80 font-semibold text-lg transition-all duration-300 hover:scale-105">
              Talk to Sales
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-12 border-t border-white/5">
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        <div className="md:col-span-2">
          <div className="text-2xl font-bold gradient-text mb-4">ShieldNet</div>
          <p className="text-white/40 text-sm max-w-md">
            AI-Powered Decentralized Cybersecurity & Fintech Intelligence Platform.
            Securing the future of decentralized finance.
          </p>
        </div>
        {[
          { title: 'Product', links: ['Features', 'Pricing', 'API', 'Documentation'] },
          { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
          { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="font-semibold text-sm text-white/60 mb-4">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-white/30 hover:text-white/60 text-sm transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between pt-8 border-t border-white/5">
        <p className="text-white/20 text-sm">&copy; 2026 ShieldNet. All rights reserved.</p>
        <div className="flex gap-4">
          {[Github, Twitter, Linkedin, Send].map((Icon, i) => (
            <a key={i} href="#" className="p-2 rounded-lg glass text-white/30 hover:text-white/60 hover:border-primary-500/30 transition-all">
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-surface-darker overflow-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-darker/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hexagon className="w-7 h-7 text-primary-400" />
            <span className="text-xl font-bold gradient-text">ShieldNet</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {['Platform', 'Solutions', 'Developers', 'Pricing'].map((item) => (
              <a key={item} href="#" className="text-sm text-white/50 hover:text-white transition-colors">{item}</a>
            ))}
            <button className="px-4 py-2 rounded-lg glass glass-hover text-sm text-white/80">Sign In</button>
            <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all">
              Get Started
            </button>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-white/5"
            >
              <div className="px-4 py-4 space-y-3">
                {['Platform', 'Solutions', 'Developers', 'Pricing'].map((item) => (
                  <a key={item} href="#" className="block text-white/50 hover:text-white py-2">{item}</a>
                ))}
                <hr className="border-white/5" />
                <button className="w-full px-4 py-2 rounded-lg glass text-sm">Sign In</button>
                <button className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-semibold">
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <HeroSection />
      <StatsSection />
      <LiveDemoSection />
      <FeaturesSection />
      <TrustedBySection />
      <CTASection />
      <Footer />
    </div>
  );
}
