'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Minimize2,
  Maximize2,
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  Code,
  Loader2,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isCode?: boolean;
}

const suggestions = [
  { icon: Shield, label: 'Analyze smart contract security' },
  { icon: TrendingUp, label: 'Show threat trends' },
  { icon: Zap, label: 'Check wallet health' },
  { icon: Code, label: 'DeFi risk assessment' },
];

const assistantResponses: Record<string, string> = {
  default: "I'm ShieldNet's AI assistant. I can help you with threat analysis, smart contract auditing, blockchain monitoring, and DeFi risk assessment. What would you like to explore?",
  'analyze smart contract security': `## Smart Contract Security Analysis

To analyze a smart contract, follow these steps:

1. **Static Analysis** - Check for common vulnerabilities:
   \`\`\`
   - Reentrancy attacks
   - Integer overflow/underflow  
   - Access control issues
   - Front-running vulnerabilities
   \`\`\`

2. **Use our Auditor** - Navigate to the Smart Contract Auditor panel and paste your contract code.

3. **Run Dynamic Analysis** - Our AI will simulate various attack vectors and provide a comprehensive risk score.

Would you like me to guide you through a specific analysis?`,
  'show threat trends': `## Current Threat Landscape

\`\`\`
📊 Last 24 Hours:
• DDoS Attacks: +47% ↑
• DeFi Exploits: 3 incidents
• New Malware Strains: 12
• Phishing Sites Blocked: 1,284
• Smart Contract Vulns: 8 critical
\`\`\`

**Key Insight**: Cross-chain bridge attacks have increased by 73% this month. Consider reviewing your bridge exposure.

View the Threat Map and Analytics dashboard for real-time tracking.`,
  'check wallet health': `## Wallet Health Check

\`\`\`
✅ Wallet: 0x7F3e...9aB2
📈 Risk Score: 12/100 (Low Risk)
💰 Total Value: $46,230

Security Status:
✓ No suspicious interactions
✓ Low gas usage pattern
✓ Validated transaction history
✓ No flagged addresses

⚠️ Recommendations:
• Rotate permissions on 3 DeFi protocols
• Consider hardware wallet for >$100K
\`\`\`

Your wallet appears healthy. Set up alerts for abnormal activity.`,
  'defi risk assessment': `## DeFi Risk Assessment

### Protocol Exposure
| Protocol | Exposure | Risk Level |
|----------|----------|------------|
| Uniswap V3 | $12,000 | 🟢 Low |
| Aave V3 | $8,500 | 🟡 Medium |
| Curve | $5,200 | 🟢 Low |

### Market Conditions
- **Impermanent Loss Risk**: 2.3%
- **Liquidation Risk**: 8.7% (at 15% drop)
- **Smart Contract Risk**: Audited (3 months ago)

### Recommendations
1. Diversify across 3+ protocols
2. Set stop-loss at 12% drawdown
3. Monitor governance proposals
4. Consider insurance coverage`,
};

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: assistantResponses.default,
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (content: string) => {
    if (!content.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setMessage('');
    setIsTyping(true);

    // Simulate typing delay
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 1500));

    const normalized = content.trim().toLowerCase();
    let response = assistantResponses.default;

    for (const [key, value] of Object.entries(assistantResponses)) {
      if (normalized.includes(key)) {
        response = value;
        break;
      }
    }

    const aiMsg: Message = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(message);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 text-white shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105 transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <MessageSquare className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent-400 border-2 border-surface-darker animate-pulse" />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? 'auto' : '560px',
              width: isMinimized ? 'auto' : '400px',
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'fixed bottom-6 right-6 z-50 flex flex-col',
              'rounded-2xl border border-white/10 bg-surface/80 backdrop-blur-xl shadow-2xl',
              'overflow-hidden',
              isMinimized ? 'w-72' : 'w-[400px]'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-surface-dark/50">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-600/20 border border-primary-500/30">
                  <Bot className="h-4 w-4 text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">AI Assistant</p>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse" />
                    <span className="text-[10px] text-white/40">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
                >
                  {isMinimized ? (
                    <Maximize2 className="h-3.5 w-3.5 text-white/40" />
                  ) : (
                    <Minimize2 className="h-3.5 w-3.5 text-white/40" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-white/40" />
                </button>
              </div>
            </div>

            {/* Minimized state only shows header */}
            {!isMinimized && (
              <>
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'flex gap-2.5',
                        msg.role === 'user' ? 'flex-row-reverse' : ''
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0',
                          msg.role === 'assistant'
                            ? 'bg-gradient-to-br from-primary-500/20 to-secondary-600/20'
                            : 'bg-accent-500/20'
                        )}
                      >
                        {msg.role === 'assistant' ? (
                          <Bot className="h-3.5 w-3.5 text-primary-400" />
                        ) : (
                          <User className="h-3.5 w-3.5 text-accent-400" />
                        )}
                      </div>
                      <div
                        className={cn(
                          'max-w-[80%] rounded-xl px-3.5 py-2.5',
                          msg.role === 'assistant'
                            ? 'bg-white/5 border border-white/5 text-white/80'
                            : 'bg-gradient-to-r from-primary-500/20 to-secondary-600/20 border border-primary-500/20 text-white/90'
                        )}
                      >
                        <div className="text-[13px] leading-relaxed whitespace-pre-wrap">
                          {msg.content.split('```').map((part, idx) => {
                            if (idx % 2 === 1) {
                              return (
                                <pre
                                  key={idx}
                                  className="my-2 p-2.5 rounded-lg bg-surface-dark/80 border border-white/5 overflow-x-auto"
                                >
                                  <code className="text-[11px] font-mono text-primary-300">{part}</code>
                                </pre>
                              );
                            }
                            return <span key={idx}>{part}</span>;
                          })}
                        </div>
                        <p className="text-[9px] text-white/20 mt-1">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-2.5"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-600/20">
                        <Bot className="h-3.5 w-3.5 text-primary-400" />
                      </div>
                      <div className="flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/5 px-3.5 py-3">
                        <motion.span
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                          className="h-1.5 w-1.5 rounded-full bg-primary-400"
                        />
                        <motion.span
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear', delay: 0.2 }}
                          className="h-1.5 w-1.5 rounded-full bg-primary-400"
                        />
                        <motion.span
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear', delay: 0.4 }}
                          className="h-1.5 w-1.5 rounded-full bg-primary-400"
                        />
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Suggestions */}
                {messages.length <= 1 && (
                  <div className="px-4 pb-2">
                    <div className="flex flex-wrap gap-1.5">
                      {suggestions.map((s) => (
                        <button
                          key={s.label}
                          onClick={() => handleSend(s.label)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-[11px] text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                        >
                          <s.icon className="h-3 w-3" />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 focus-within:border-primary-500/30 transition-colors">
                      <input
                        ref={inputRef}
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything..."
                        className="flex-1 bg-transparent text-sm text-white/80 placeholder-white/30 outline-none"
                      />
                    </div>
                    <motion.button
                      onClick={() => handleSend(message)}
                      disabled={!message.trim() || isTyping}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl transition-all',
                        message.trim() && !isTyping
                          ? 'bg-gradient-to-br from-primary-500 to-secondary-600 text-white shadow-lg shadow-primary-500/20'
                          : 'bg-white/5 text-white/30'
                      )}
                      whileTap={message.trim() ? { scale: 0.9 } : {}}
                    >
                      {isTyping ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
