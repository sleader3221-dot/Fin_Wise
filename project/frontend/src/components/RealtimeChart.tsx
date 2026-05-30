'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn } from '@/utils/cn';

type ChartType = 'line' | 'area' | 'bar';
type TimeRange = '1h' | '24h' | '7d' | '30d';

interface ChartProps {
  type?: ChartType;
  data?: { name: string; value: number; value2?: number }[];
  height?: number;
  colors?: { primary: string; secondary: string; gradient?: string };
  title?: string;
}

const defaultData = {
  '1h': [
    { name: '00:00', value: 45, value2: 38 },
    { name: '00:05', value: 52, value2: 42 },
    { name: '00:10', value: 48, value2: 35 },
    { name: '00:15', value: 70, value2: 55 },
    { name: '00:20', value: 65, value2: 48 },
    { name: '00:25', value: 85, value2: 62 },
    { name: '00:30', value: 72, value2: 58 },
  ],
  '24h': [
    { name: '00:00', value: 120, value2: 90 },
    { name: '04:00', value: 85, value2: 65 },
    { name: '08:00', value: 145, value2: 110 },
    { name: '12:00', value: 200, value2: 155 },
    { name: '16:00', value: 175, value2: 130 },
    { name: '20:00', value: 160, value2: 120 },
    { name: '24:00', value: 95, value2: 75 },
  ],
  '7d': [
    { name: 'Mon', value: 980, value2: 720 },
    { name: 'Tue', value: 1200, value2: 890 },
    { name: 'Wed', value: 1050, value2: 780 },
    { name: 'Thu', value: 1350, value2: 1010 },
    { name: 'Fri', value: 1100, value2: 820 },
    { name: 'Sat', value: 850, value2: 630 },
    { name: 'Sun', value: 920, value2: 690 },
  ],
  '30d': [
    { name: 'W1', value: 4500, value2: 3400 },
    { name: 'W2', value: 5200, value2: 3900 },
    { name: 'W3', value: 4800, value2: 3600 },
    { name: 'W4', value: 6100, value2: 4600 },
  ],
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-surface-dark/95 backdrop-blur-xl px-4 py-3 shadow-2xl">
      <p className="text-xs font-medium text-white/60 mb-2">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-white/50">{entry.name}:</span>
          <span className="font-semibold text-white">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const timeRanges: { label: string; value: TimeRange }[] = [
  { label: '1H', value: '1h' },
  { label: '24H', value: '24h' },
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
];

export default function RealtimeChart({
  type = 'line',
  data,
  height = 350,
  colors = { primary: '#06b6d4', secondary: '#a855f7', gradient: 'url(#primaryGradient)' },
  title = 'Threat Activity',
}: ChartProps) {
  const [chartType, setChartType] = useState<ChartType>(type);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [isPlaying, setIsPlaying] = useState(true);

  const chartData = data || defaultData[timeRange];

  const GradientDefs = () => (
    <defs>
      <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3} />
        <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
      </linearGradient>
      <linearGradient id="secondaryGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={colors.secondary} stopOpacity={0.2} />
        <stop offset="95%" stopColor={colors.secondary} stopOpacity={0} />
      </linearGradient>
    </defs>
  );

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <GradientDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={colors.primary}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: colors.primary, stroke: '#fff', strokeWidth: 2 }}
              animationDuration={1500}
              animationEasing="ease-out"
            />
            <Line
              type="monotone"
              dataKey="value2"
              stroke={colors.secondary}
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 4"
              activeDot={{ r: 5, fill: colors.secondary, stroke: '#fff', strokeWidth: 2 }}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <GradientDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={colors.primary}
              strokeWidth={2}
              fill="url(#primaryGradient)"
              animationDuration={1500}
              animationEasing="ease-out"
            />
            <Area
              type="monotone"
              dataKey="value2"
              stroke={colors.secondary}
              strokeWidth={2}
              fill="url(#secondaryGradient)"
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <GradientDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}
              iconType="circle"
            />
            <Bar
              dataKey="value"
              fill={colors.primary}
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
              animationEasing="ease-out"
            />
            <Bar
              dataKey="value2"
              fill={colors.secondary}
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </BarChart>
        );
    }
  };

  const chartTypes: { label: string; value: ChartType }[] = [
    { label: 'Line', value: 'line' },
    { label: 'Area', value: 'area' },
    { label: 'Bar', value: 'bar' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-surface/60 backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <span className="flex items-center gap-1.5 text-[10px] text-accent-400">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse" />
            Live
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Chart Type Switcher */}
          <div className="flex rounded-lg border border-white/10 bg-white/5 p-0.5">
            {chartTypes.map((ct) => (
              <button
                key={ct.value}
                onClick={() => setChartType(ct.value)}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-medium rounded-md transition-all duration-200',
                  chartType === ct.value
                    ? 'bg-primary-500/20 text-primary-400 shadow-sm'
                    : 'text-white/40 hover:text-white/60'
                )}
              >
                {ct.label}
              </button>
            ))}
          </div>

          {/* Time Range Selector */}
          <div className="flex rounded-lg border border-white/10 bg-white/5 p-0.5">
            {timeRanges.map((tr) => (
              <button
                key={tr.value}
                onClick={() => setTimeRange(tr.value)}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-medium rounded-md transition-all duration-200',
                  timeRange === tr.value
                    ? 'bg-primary-500/20 text-primary-400 shadow-sm'
                    : 'text-white/40 hover:text-white/60'
                )}
              >
                {tr.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${chartType}-${timeRange}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ResponsiveContainer width="100%" height={height}>
              {renderChart()}
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
