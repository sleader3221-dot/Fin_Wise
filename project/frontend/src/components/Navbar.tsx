'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Menu,
  X,
  Shield,
  ChevronDown,
  LogOut,
  Settings,
  User,
  Moon,
  Sun,
  Wallet,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const navLinks = [
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Threat Intelligence', href: '#threats' },
  { label: 'Blockchain', href: '#blockchain' },
  { label: 'Fintech', href: '#fintech' },
  { label: 'Analytics', href: '#analytics' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [notifications] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'bg-surface-darker/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
          : 'bg-transparent'
      )}
    >
      <div className="relative border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-secondary-500/5 to-primary-500/5" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-400/30 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <motion.a
              href="#"
              className="flex items-center gap-2.5 group"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-secondary-600 shadow-lg shadow-primary-500/25">
                <Shield className="h-5 w-5 text-white" />
                <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                Shield<span className="text-primary-400">Net</span>
              </span>
            </motion.a>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  className="relative px-3.5 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {link.label}
                  <span className="absolute inset-x-2 bottom-0 h-[2px] bg-gradient-to-r from-primary-400 to-secondary-400 scale-x-0 group-hover:scale-x-100 transition-transform rounded-full" />
                </motion.a>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search */}
              <motion.div
                className={cn(
                  'relative hidden sm:block transition-all duration-300',
                  isSearchFocused ? 'w-72' : 'w-48'
                )}
                animate={{ width: isSearchFocused ? 288 : 192 }}
              >
                <div
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300',
                    isSearchFocused
                      ? 'border-primary-400/50 bg-white/10 shadow-lg shadow-primary-500/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  )}
                >
                  <Search className="h-4 w-4 text-white/40 flex-shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search threats, blocks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none"
                  />
                  {!isSearchFocused && (
                    <kbd className="hidden lg:inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-white/30">
                      <span>⌘</span>K
                    </kbd>
                  )}
                </div>
              </motion.div>

              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  {isDark ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="h-4 w-4 text-yellow-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="h-4 w-4 text-white/70" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Wallet Connect */}
              <motion.button
                onClick={() => setIsWalletConnected(!isWalletConnected)}
                className={cn(
                  'hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-sm font-medium transition-all duration-300',
                  isWalletConnected
                    ? 'border-accent-500/30 bg-accent-500/10 text-accent-400 shadow-lg shadow-accent-500/10'
                    : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                )}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Wallet className={cn('h-4 w-4', isWalletConnected && 'animate-pulse')} />
                <span>{isWalletConnected ? '0x7F3e...9aB2' : 'Connect Wallet'}</span>
                {isWalletConnected && (
                  <span className="h-2 w-2 rounded-full bg-accent-400 animate-pulse" />
                )}
              </motion.button>

              {/* Notifications */}
              <motion.button
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Bell className="h-4 w-4 text-white/70" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-[9px] font-bold text-white ring-2 ring-surface-darker">
                    {notifications}
                  </span>
                )}
              </motion.button>

              {/* Profile Dropdown */}
              <div ref={profileRef} className="relative">
                <motion.button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1 pr-2 hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-secondary-600">
                    <User className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-white/80">Admin</span>
                  <ChevronDown className={cn('h-3.5 w-3.5 text-white/40 transition-transform', isProfileOpen && 'rotate-180')} />
                </motion.button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 8, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full w-56 rounded-xl border border-white/10 bg-surface/95 backdrop-blur-xl shadow-2xl overflow-hidden"
                    >
                      <div className="p-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white">Admin User</p>
                        <p className="text-xs text-white/40">admin@shieldnet.io</p>
                      </div>
                      <div className="p-1.5">
                        {[
                          { icon: User, label: 'Profile' },
                          { icon: Settings, label: 'Settings' },
                          { icon: Wallet, label: 'Wallet' },
                        ].map((item) => (
                          <button
                            key={item.label}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-white/10 p-1.5">
                        <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-danger-400 hover:bg-danger-500/10 transition-colors">
                          <LogOut className="h-4 w-4" />
                          Disconnect
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Toggle */}
              <motion.button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isMobileOpen ? (
                  <X className="h-4 w-4 text-white/70" />
                ) : (
                  <Menu className="h-4 w-4 text-white/70" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-white/5 lg:hidden"
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 space-y-1 bg-surface-darker/95 backdrop-blur-xl">
                {/* Mobile Search */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 mb-3">
                  <Search className="h-4 w-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search threats, blocks..."
                    className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none"
                  />
                </div>

                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}

                {/* Mobile Wallet */}
                <button
                  onClick={() => setIsWalletConnected(!isWalletConnected)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Wallet className="h-4 w-4" />
                  {isWalletConnected ? '0x7F3e...9aB2' : 'Connect Wallet'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
