'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface SparklineData {
  value: number;
}

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color?: string;
  sparklineData?: SparklineData[];
}

function MiniSparkline({ data, color = '#06b6d4' }: { data: SparklineData[]; color?: string }) {
  const width = 80;
  const height = 28;
  const max = Math.max(...data.map(d => d.value), 1);
  const min = Math.min(...data.map(d => d.value), 0);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.value - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const pathD = `M${points.join(' L')}`;

  return (
    <svg width={width} height={height} className="flex-shrink-0">
      <defs>
        <linearGradient id={`sparkline-fill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={`${pathD} L${width},${height} L0,${height} Z`}
        fill={`url(#sparkline-fill-${color.replace('#', '')})`}
      />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={points[points.length - 1]?.split(',')[0]}
        cy={points[points.length - 1]?.split(',')[1]}
        r={2}
        fill={color}
      />
    </svg>
  );
}

export default function StatCard({
  icon: Icon,
  title,
  value,
  trend,
  color = '#06b6d4',
  sparklineData,
}: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);
  const targetValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0;

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const steps = 30;
    const stepDuration = duration / steps;
    let current = 0;
    const increment = targetValue / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetValue) {
        setDisplayValue(targetValue);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isInView, targetValue]);

  const formatValue = (val: number) => {
    if (typeof value === 'string' && value.includes('%')) {
      return `${val.toFixed(1)}%`;
    }
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    if (Number.isInteger(val)) return val.toString();
    return val.toFixed(1);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative group cursor-pointer"
    >
      <div
        className={cn(
          'relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl',
          'hover:bg-white/[0.07] transition-all duration-300',
          'hover:shadow-xl hover:shadow-black/20'
        )}
        style={{
          boxShadow: `0 0 30px ${color}08`,
        }}
      >
        {/* Gradient border on hover */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, ${color}10, transparent, ${color}05)`,
          }}
        />

        <div className="relative p-4">
          <div className="flex items-start justify-between mb-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor: `${color}15`,
                borderColor: `${color}30`,
                borderWidth: 1,
              }}
            >
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            {sparklineData && (
              <MiniSparkline data={sparklineData} color={color} />
            )}
          </div>

          <p className="text-xs font-medium text-white/40 mb-1">{title}</p>

          <div className="flex items-end justify-between">
            <motion.p
              className="text-2xl font-bold text-white tracking-tight"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
            >
              {formatValue(displayValue)}
            </motion.p>

            {trend && (
              <div
                className={cn(
                  'flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium',
                  trend.isUp
                    ? 'text-accent-400 bg-accent-500/10'
                    : 'text-danger-400 bg-danger-500/10'
                )}
              >
                {trend.isUp ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Active indicator */}
        <div
          className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: `linear-gradient(90deg, ${color}, transparent)`,
          }}
        />
      </div>
    </motion.div>
  );
}
