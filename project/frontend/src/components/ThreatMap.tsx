'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface Threat {
  id: string;
  x: number;
  y: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  label: string;
  timestamp: string;
  attackType: string;
  target: string;
  size: number;
  pulsePhase: number;
}

const SEVERITY_COLORS = {
  critical: { fill: '#ef4444', glow: 'rgba(239,68,68,0.5)', bg: 'bg-danger-500/20', text: 'text-danger-400', border: 'border-danger-500/30' },
  high: { fill: '#f97316', glow: 'rgba(249,115,22,0.4)', bg: 'bg-warning-500/20', text: 'text-warning-400', border: 'border-warning-500/30' },
  medium: { fill: '#eab308', glow: 'rgba(234,179,8,0.3)', bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  low: { fill: '#22c55e', glow: 'rgba(34,197,94,0.2)', bg: 'bg-accent-500/20', text: 'text-accent-400', border: 'border-accent-500/30' },
};

function generateThreat(width: number, height: number, id: number): Threat {
  const severities: Threat['severity'][] = ['critical', 'high', 'medium', 'low'];
  const attackTypes = ['DDoS', 'Malware', 'Phishing', 'Ransomware', 'SQL Injection', 'Zero-Day', 'DNS Spoofing', 'Brute Force'];
  const targets = ['Core Network', 'DNS Server', 'Smart Contract', 'DeFi Pool', 'Validator Node', 'Bridge Contract', 'Oracle Feed', 'Governance'];
  return {
    id: `threat-${id}`,
    x: Math.random() * (width - 60) + 30,
    y: Math.random() * (height - 60) + 30,
    severity: severities[Math.floor(Math.random() * severities.length)],
    label: `${attackTypes[Math.floor(Math.random() * attackTypes.length)]}`,
    timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    attackType: attackTypes[Math.floor(Math.random() * attackTypes.length)],
    target: targets[Math.floor(Math.random() * targets.length)],
    size: Math.random() * 8 + 4,
    pulsePhase: Math.random() * Math.PI * 2,
  };
}

export default function ThreatMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [hoveredThreat, setHoveredThreat] = useState<Threat | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [gridDots, setGridDots] = useState<{ x: number; y: number }[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width: Math.floor(width), height: Math.floor(height) });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const dots: { x: number; y: number }[] = [];
    const spacing = 40;
    for (let x = 0; x < dimensions.width; x += spacing) {
      for (let y = 0; y < dimensions.height; y += spacing) {
        dots.push({ x, y });
      }
    }
    setGridDots(dots);
  }, [dimensions]);

  useEffect(() => {
    const initial: Threat[] = [];
    for (let i = 0; i < 25; i++) {
      initial.push(generateThreat(dimensions.width, dimensions.height, i));
    }
    setThreats(initial);

    const interval = setInterval(() => {
      setThreats(prev => {
        if (prev.length < 35) {
          return [...prev, generateThreat(dimensions.width, dimensions.height, Date.now())];
        }
        const updated = [...prev];
        updated.shift();
        updated.push(generateThreat(dimensions.width, dimensions.height, Date.now()));
        return updated;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [dimensions]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      const time = Date.now() / 1000;

      // Draw connection lines between nearby threats
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.06)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < threats.length; i++) {
        for (let j = i + 1; j < threats.length; j++) {
          const dx = threats[i].x - threats[j].x;
          const dy = threats[i].y - threats[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(threats[i].x, threats[i].y);
            ctx.lineTo(threats[j].x, threats[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw pulse rings
      threats.forEach(threat => {
        const pulse = Math.sin(time * 2 + threat.pulsePhase) * 0.5 + 0.5;
        const color = SEVERITY_COLORS[threat.severity];
        const maxRadius = threat.size * 4 + pulse * 10;

        ctx.beginPath();
        ctx.arc(threat.x, threat.y, maxRadius, 0, Math.PI * 2);
        ctx.strokeStyle = color.glow.replace('0.', `${0.15 * (1 - pulse * 0.5)}`);
        ctx.lineWidth = 1;
        ctx.stroke();

        // Second pulse ring
        ctx.beginPath();
        ctx.arc(threat.x, threat.y, maxRadius * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = color.glow.replace('0.', `${0.3 * (1 - pulse * 0.3)}`);
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Draw threat dot
        ctx.beginPath();
        ctx.arc(threat.x, threat.y, threat.size, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(threat.x, threat.y, 0, threat.x, threat.y, threat.size);
        gradient.addColorStop(0, color.fill);
        gradient.addColorStop(1, color.glow);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(threat.x, threat.y, threat.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = color.glow.replace('0.', '0.1');
        ctx.fill();
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [threats, dimensions]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCursorPos({ x, y });

    const found = threats.find(t => {
      const dx = t.x - x;
      const dy = t.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 20;
    });
    setHoveredThreat(found || null);
  }, [threats]);

  const legendItems = [
    { severity: 'critical' as const, label: 'Critical' },
    { severity: 'high' as const, label: 'High' },
    { severity: 'medium' as const, label: 'Medium' },
    { severity: 'low' as const, label: 'Low' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl border border-white/10 bg-surface/60 backdrop-blur-xl overflow-hidden"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-accent-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-white">Global Threat Map</h3>
          <span className="text-xs text-white/40">Real-time</span>
        </div>
        <div className="text-xs text-white/40">
          {threats.length} active threats
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="relative w-full" style={{ height: 500 }}>
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredThreat(null)}
          className="w-full h-full cursor-crosshair"
        />

        {/* Grid dots overlay */}
        <svg className="absolute inset-0 pointer-events-none" width={dimensions.width} height={dimensions.height}>
          {gridDots.map((dot, i) => (
            <circle
              key={i}
              cx={dot.x}
              cy={dot.y}
              r={0.5}
              className="fill-white/5"
            />
          ))}
        </svg>

        {/* Tooltip */}
        {hoveredThreat && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              'absolute pointer-events-none rounded-xl border px-4 py-3 backdrop-blur-xl shadow-2xl',
              'bg-surface/95',
              SEVERITY_COLORS[hoveredThreat.severity].border
            )}
            style={{
              left: Math.min(cursorPos.x + 20, dimensions.width - 220),
              top: Math.max(Math.min(cursorPos.y - 60, dimensions.height - 140), 10),
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border',
                SEVERITY_COLORS[hoveredThreat.severity].bg,
                SEVERITY_COLORS[hoveredThreat.severity].text,
                SEVERITY_COLORS[hoveredThreat.severity].border,
              )}>
                {hoveredThreat.severity.toUpperCase()}
              </span>
              <span className="text-xs font-medium text-white">{hoveredThreat.label}</span>
            </div>
            <div className="space-y-0.5 text-[11px] text-white/50">
              <p>Type: {hoveredThreat.attackType}</p>
              <p>Target: {hoveredThreat.target}</p>
              <p>{new Date(hoveredThreat.timestamp).toLocaleString()}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 px-6 py-3 border-t border-white/5">
        {legendItems.map((item) => (
          <div key={item.severity} className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: SEVERITY_COLORS[item.severity].fill }}
            />
            <span className="text-[11px] text-white/50">{item.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
