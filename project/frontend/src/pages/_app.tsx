import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import '@/styles/globals.css';

interface AppState {
  theme: 'dark' | 'light';
  isConnected: boolean;
  walletAddress: string | null;
  networkId: number | null;
  setTheme: (theme: 'dark' | 'light') => void;
  setConnected: (connected: boolean) => void;
  setWalletAddress: (address: string | null) => void;
  setNetworkId: (id: number | null) => void;
}

import { create } from 'zustand';

export const useAppStore = create<AppState>((set) => ({
  theme: 'dark',
  isConnected: false,
  walletAddress: null,
  networkId: null,
  setTheme: (theme) => set({ theme }),
  setConnected: (isConnected) => set({ isConnected }),
  setWalletAddress: (walletAddress) => set({ walletAddress }),
  setNetworkId: (networkId) => set({ networkId }),
}));

export default function App({ Component, pageProps, router }: AppProps) {
  const { theme } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    useAppStore.getState().setTheme('dark');
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-surface-darker flex items-center justify-center">
        <div className="loading-spinner w-8 h-8" />
      </div>
    );
  }

  return (
    <div className={clsx('min-h-screen bg-surface-darker', theme === 'light' && 'bg-gray-50')}>
      <AnimatePresence mode="wait">
        <motion.div
          key={router.route}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#e2e8f0',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#0f172a' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#0f172a' },
          },
        }}
      />
    </div>
  );
}
