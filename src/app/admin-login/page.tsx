'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  KeyRound,
  Sparkles,
} from 'lucide-react';

export default function DedicatedAdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide administrator credentials.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          requiredRole: 'ADMIN', // STRICT: ONLY ADMINS CAN LOG IN HERE!
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Administrator authentication failed.');
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col font-sans select-none overflow-x-hidden">
      {/* Background with executive dark overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: "url('/campus_background.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[3px]" />
      </div>

      {/* Top Header */}
      <header className="relative z-20 w-full h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition">
              Campus<span className="text-indigo-400">IQ</span>
            </span>
          </Link>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-widest">
            Executive Portal
          </span>
        </div>

        <div>
          <Link
            href="/"
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-semibold backdrop-blur-xs border border-white/15 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Student & Faculty Portal</span>
          </Link>
        </div>
      </header>

      {/* Main Center Form */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-[440px] bg-slate-900/90 rounded-[28px] shadow-2xl border border-slate-700/80 p-6 sm:p-8 backdrop-blur-md text-white animate-in fade-in zoom-in-95 duration-200">
          {/* Emblem & Authority Banner */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 shadow-inner mb-3">
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase tracking-wider mb-2 border border-rose-500/30">
              <Lock className="w-3 h-3" />
              <span>Restricted • Staff Only</span>
            </div>

            <h1 className="text-xl font-bold text-white tracking-tight">
              Administrator Login
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Galgotias University &bull; Central Executive Command
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-xs text-rose-300 flex items-start space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin User ID / Email
              </label>
              <input
                type="text"
                required
                placeholder="e.g. admin, rajesh, meenakshi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition bg-slate-800/80"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Administrative Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition pr-10 bg-slate-800/80"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition duration-150 flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In to Admin Command'}</span>
            </button>

            {/* Quick Demo Autofill for Admins */}
            <div className="pt-4 border-t border-slate-800 text-center space-y-2">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                1-Click Demo Administrators:
              </span>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin');
                    setPassword('admin123');
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-indigo-300 transition cursor-pointer border border-slate-700"
                >
                  Prof. Rajesh (Registrar)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('meenakshi');
                    setPassword('admin123');
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-indigo-300 transition cursor-pointer border border-slate-700"
                >
                  Dr. Meenakshi (Welfare)
                </button>
              </div>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-4 pt-3 border-t border-slate-800/60 text-[10px] text-slate-500 text-center leading-relaxed">
            Note: Students and Faculty must use the standard campus portal. Access attempts here are logged to the immutable audit trail.
          </div>
        </div>
      </main>
    </div>
  );
}
