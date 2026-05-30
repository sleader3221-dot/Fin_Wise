'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Link2,
  Unlink,
  Copy,
  Check,
  ChevronDown,
  Loader2,
  ExternalLink,
  AlertCircle,
  Bitcoin,
  Zap,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface WalletOption {
  id: string;
  name: string;
  icon: typeof Wallet;
  color: string;
}

const walletOptions: WalletOption[] = [
  { id: 'metamask', name: 'MetaMask', icon: Wallet, color: '#f6851b' },
  { id: 'walletconnect', name: 'WalletConnect', icon: Link2, color: '#3b99fc' },
  { id: 'coinbase', name: 'Coinbase Wallet', icon: Bitcoin, color: '#0052ff' },
];

export default function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [network, setNetwork] = useState('Ethereum Mainnet');
  const [showNetworkPicker, setShowNetworkPicker] = useState(false);

  const mockAddress = '0x7F3e8D8a9b2C4f6E1a0B3c5D7e9F1a2B3c4D5e6';
  const mockBalance = '14.725 ETH';

  const networks = ['Ethereum Mainnet', 'Polygon', 'Arbitrum', 'Optimism', 'Base', 'BNB Chain'];

  const handleConnect = async (walletId: string) => {
    setIsConnecting(true);
    setError(null);
    setSelectedWallet(walletId);
    setShowOptions(false);

    await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.15) {
          resolve(true);
        } else {
          reject(new Error('Connection rejected by user'));
        }
      }, 2000);
    })
      .then(() => {
        setIsConnected(true);
        setIsConnecting(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsConnecting(false);
        setSelectedWallet(null);
      });
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setSelectedWallet(null);
    setError(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(mockAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-surface/60 backdrop-blur-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500/20 to-primary-600/20 border border-accent-500/30">
          <Wallet className="h-5 w-5 text-accent-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Wallet Connect</h3>
          <p className="text-[11px] text-white/40">Manage your Web3 wallet</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <AnimatePresence mode="wait">
          {/* Disconnected State */}
          {!isConnected && !isConnecting && (
            <motion.div
              key="disconnected"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Connect Button */}
              <div className="relative">
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-accent-500 to-primary-600 text-white font-medium text-sm shadow-lg shadow-accent-500/25 hover:shadow-xl hover:shadow-accent-500/30 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Wallet className="h-5 w-5" />
                    <span>Connect Wallet</span>
                  </div>
                  <ChevronDown className={cn('h-4 w-4 transition-transform', showOptions && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {showOptions && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute top-full mt-1 left-0 right-0 rounded-xl border border-white/10 bg-surface-dark/95 backdrop-blur-xl shadow-2xl overflow-hidden z-10"
                    >
                      {walletOptions.map((wallet) => (
                        <button
                          key={wallet.id}
                          onClick={() => handleConnect(wallet.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${wallet.color}20` }}
                          >
                            <wallet.icon className="h-4 w-4" style={{ color: wallet.color }} />
                          </div>
                          <span>{wallet.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20"
                >
                  <AlertCircle className="h-4 w-4 text-danger-400 flex-shrink-0" />
                  <span className="text-xs text-danger-400">{error}</span>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Connecting State */}
          {isConnecting && (
            <motion.div
              key="connecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent-500/30 border-t-accent-400 mb-4"
              >
                <Loader2 className="h-6 w-6 text-accent-400" />
              </motion.div>
              <p className="text-sm font-medium text-white/80">Connecting...</p>
              <p className="text-xs text-white/40 mt-1">
                {selectedWallet === 'metamask' && 'Opening MetaMask...'}
                {selectedWallet === 'walletconnect' && 'Connecting via WalletConnect...'}
                {selectedWallet === 'coinbase' && 'Connecting to Coinbase Wallet...'}
              </p>
              <button
                onClick={() => { setIsConnecting(false); setSelectedWallet(null); }}
                className="mt-4 text-xs text-white/30 hover:text-white/50 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          )}

          {/* Connected State */}
          {isConnected && (
            <motion.div
              key="connected"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {/* Status */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-accent-500/10 border border-accent-500/20">
                <div className="h-2.5 w-2.5 rounded-full bg-accent-400 animate-pulse" />
                <span className="text-xs font-medium text-accent-400">Connected</span>
                <span className="text-xs text-white/30 ml-auto">
                  {walletOptions.find(w => w.id === selectedWallet)?.name}
                </span>
              </div>

              {/* Address */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500/20 to-primary-600/20">
                    <Wallet className="h-3.5 w-3.5 text-accent-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Address</p>
                    <p className="text-sm font-mono font-medium text-white">{truncateAddress(mockAddress)}</p>
                  </div>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-accent-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-white/40" />
                  )}
                </button>
              </div>

              {/* Balance */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-500/10">
                    <Zap className="h-3.5 w-3.5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Balance</p>
                    <p className="text-sm font-semibold text-white">{mockBalance}</p>
                  </div>
                </div>
                <span className="text-[10px] text-white/30">~$46,230</span>
              </div>

              {/* Network Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowNetworkPicker(!showNetworkPicker)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-500/10">
                      <ExternalLink className="h-3.5 w-3.5 text-primary-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-white/50">Network</p>
                      <p className="text-sm font-medium text-white">{network}</p>
                    </div>
                  </div>
                  <ChevronDown className={cn('h-4 w-4 text-white/40 transition-transform', showNetworkPicker && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {showNetworkPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute top-full mt-1 left-0 right-0 rounded-xl border border-white/10 bg-surface-dark/95 backdrop-blur-xl shadow-2xl overflow-hidden z-10"
                    >
                      {networks.map((n) => (
                        <button
                          key={n}
                          onClick={() => { setNetwork(n); setShowNetworkPicker(false); }}
                          className={cn(
                            'w-full text-left px-4 py-2.5 text-sm transition-colors',
                            n === network
                              ? 'bg-accent-500/10 text-accent-400'
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Disconnect */}
              <motion.button
                onClick={handleDisconnect}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-danger-500/30 bg-danger-500/10 text-danger-400 font-medium text-sm hover:bg-danger-500/20 transition-all"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Unlink className="h-4 w-4" />
                Disconnect Wallet
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
