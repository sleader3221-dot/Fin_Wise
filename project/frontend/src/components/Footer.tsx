'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  Github,
  Twitter,
  Linkedin,
  MessageCircle,
  Heart,
  Sparkles,
} from 'lucide-react';

const socialLinks = [
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: MessageCircle, href: '#', label: 'Discord' },
];

const footerLinks = [
  { label: 'Documentation', href: '#' },
  { label: 'API Reference', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
];

export default function Footer() {
  return (
    <footer className="relative mt-12 border-t border-white/5">
      {/* Gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-400/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <motion.a
              href="#"
              className="flex items-center gap-2.5 group mb-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-secondary-600 shadow-lg shadow-primary-500/25">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                Shield<span className="text-primary-400">Net</span>
              </span>
            </motion.a>
            <p className="text-sm text-white/40 leading-relaxed max-w-md">
              AI-Powered Decentralized Cybersecurity &amp; Fintech Intelligence Platform.
              Protecting the future of decentralized finance with real-time threat detection
              and blockchain security analytics.
            </p>

            {/* AI Badge */}
            <div className="flex items-center gap-2 mt-4">
              <div className="flex items-center gap-1.5 rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5 text-primary-400" />
                <span className="text-[11px] font-medium text-primary-400">Powered by AI</span>
              </div>
              <span className="text-[11px] text-white/20">v2.4.1</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2.5">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/40 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">Connect</h4>
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 hover:text-primary-400 hover:border-primary-400/30 hover:bg-primary-500/10 transition-all"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  title={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>

            <p className="mt-4 text-xs text-white/20">
              Built with <Heart className="h-3 w-3 inline text-danger-400" /> for Web3 security
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">
            &copy; {new Date().getFullYear()} ShieldNet. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[10px] text-white/20">
            <span>Decentralized Security</span>
            <span className="h-1 w-1 rounded-full bg-white/10" />
            <span>Real-time Analytics</span>
            <span className="h-1 w-1 rounded-full bg-white/10" />
            <span>AI-Powered</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
