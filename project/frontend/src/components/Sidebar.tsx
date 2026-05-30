'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShieldAlert,
  Hexagon,
  Wallet,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '#dashboard' },
  { icon: ShieldAlert, label: 'Threat Intelligence', href: '#threats', badge: '12' },
  { icon: Hexagon, label: 'Blockchain', href: '#blockchain' },
  { icon: Wallet, label: 'Fintech', href: '#fintech' },
  { icon: BarChart3, label: 'Analytics', href: '#analytics' },
  { icon: Settings, label: 'Settings', href: '#settings' },
  { icon: HelpCircle, label: 'Help', href: '#help' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState('Dashboard');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'fixed left-0 top-16 bottom-0 z-40 flex flex-col',
        'border-r border-white/10 bg-surface/80 backdrop-blur-xl'
      )}
    >
      {/* Toggle Button */}
      <motion.button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-surface-dark text-white/40 hover:text-white hover:border-primary-400/50 transition-all z-10"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </motion.button>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = active === item.label;
          const isHovered = hoveredItem === item.label;

          return (
            <div key={item.label} className="relative">
              <motion.a
                href={item.href}
                onClick={() => setActive(item.label)}
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  'group cursor-pointer select-none',
                  collapsed && 'justify-center px-2',
                  isActive
                    ? 'text-white'
                    : 'text-white/40 hover:text-white/70'
                )}
                whileHover={{ x: collapsed ? 0 : 4 }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Active Glow Background */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/20 via-primary-500/10 to-transparent border border-primary-500/20"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Active Glow Effect */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.15)]" />
                )}

                {/* Icon */}
                <div className={cn(
                  'relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-br from-primary-500/20 to-secondary-600/20 text-primary-400'
                    : 'bg-white/5 text-white/40 group-hover:text-white/60'
                )}>
                  <item.icon className="h-4 w-4" />
                  {isActive && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary-400/20 to-secondary-400/20 animate-pulse" />
                  )}
                </div>

                {/* Label */}
                {!collapsed && (
                  <span className="relative z-10">{item.label}</span>
                )}

                {/* Badge */}
                {!collapsed && item.badge && (
                  <span className="relative z-10 ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-danger-500/20 px-1.5 text-[10px] font-bold text-danger-400">
                    {item.badge}
                  </span>
                )}

                {/* Active Indicator Line */}
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-0.5 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                  />
                )}
              </motion.a>

              {/* Tooltip for collapsed mode */}
              {collapsed && isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none"
                >
                  <div className="flex items-center gap-2 rounded-lg bg-surface-dark/95 backdrop-blur-xl border border-white/10 px-3 py-2 shadow-xl">
                    <span className="text-sm font-medium text-white whitespace-nowrap">{item.label}</span>
                    {item.badge && (
                      <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger-500/20 px-1 text-[9px] font-bold text-danger-400">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="border-t border-white/10 p-3">
        {!collapsed ? (
          <div className="rounded-xl bg-gradient-to-br from-primary-500/10 to-secondary-600/10 border border-primary-500/20 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">AI</span>
              </div>
              <span className="text-xs font-medium text-white/80">AI Assistant</span>
            </div>
            <p className="text-[10px] text-white/40 leading-relaxed">
              Need help? Ask our AI assistant for guidance.
            </p>
            <button className="mt-2 w-full rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 text-xs font-medium py-1.5 transition-colors">
              Get Help
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500/10 to-secondary-600/10 border border-primary-500/20 flex items-center justify-center">
              <HelpCircle className="h-4 w-4 text-primary-400" />
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
