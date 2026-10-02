'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
} from 'lucide-react';

export function CampusLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both your registered email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, disallowRole: 'ADMIN' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
        return;
      }

      // Route directly to the new dashboard page
      router.push('/dashboard');
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
      {/* Background Image with slight natural overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: "url('/campus_background.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-slate-900/10 backdrop-brightness-[0.98]" />
      </div>

      {/* Top Header */}
      <header className="relative z-20 w-full h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between shadow-xs">
        {/* Brand Name on Left */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center group">
            <span className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition">
              CampusIQ
            </span>
          </Link>
        </div>

        {/* Top Right Corner - USER SPECIFIED: "there will be an login option for admin page from where onli admin can log in" */}
        <div className="flex items-center space-x-3">
          <Link
            href="/admin-login"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md shadow-slate-900/15 border border-slate-700 hover:border-indigo-400 transition group"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition" />
            <span>Admin Login</span>
            <span className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-semibold bg-indigo-500/30 text-indigo-200 rounded uppercase tracking-wider">
              Staff Only
            </span>
          </Link>
        </div>
      </header>

      {/* Center Floating Login Card Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-[440px] bg-white/98 rounded-[28px] shadow-2xl border border-white/60 p-6 sm:p-8 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          {/* University Emblem & Crest */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="flex items-center justify-center space-x-3 mb-1.5">
              <img
                src="/galgotias_emblem.png"
                alt="Galgotias University Emblem"
                className="w-12 h-12 object-contain drop-shadow-xs"
              />
              <div className="text-left font-serif select-none">
                <div className="text-base font-black text-[#0f2952] tracking-wider leading-none uppercase">
                  GALGOTIAS
                </div>
                <div className="text-[10.5px] font-bold text-[#003b73] tracking-[0.24em] leading-tight uppercase mt-0.5">
                  UNIVERSITY
                </div>
              </div>
            </div>

            <div className="text-xs font-semibold text-slate-800 mt-1">
              Galgotias University
            </div>

            <button
              type="button"
              onClick={() => alert('Galgotias University is configured as the active primary campus node.')}
              className="text-[11px] text-[#0284c7] hover:underline font-medium mt-0.5"
            >
              Not from Galgotias University?
            </button>
          </div>

          {/* Heading */}
          <h1 className="text-center text-lg font-bold text-slate-800 mb-5">
            Login
          </h1>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* User name input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                User name
              </label>
              <input
                type="text"
                required
                placeholder="Registered email or User ID (e.g. student, CSE-2023-042)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#5097ea] focus:ring-1 focus:ring-[#5097ea] transition bg-white"
              />
            </div>

            {/* Password input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#5097ea] focus:ring-1 focus:ring-[#5097ea] transition pr-10 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Forgot password link */}
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to your registered academic email.')}
                  className="text-[11px] text-[#0284c7] hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#5097ea] hover:bg-[#3b82f6] text-white text-xs font-semibold shadow-xs transition duration-150 flex items-center justify-center space-x-1.5 disabled:opacity-60 cursor-pointer"
            >
              <span>{loading ? 'Logging in...' : 'Login'}</span>
            </button>

            {/* Quick Demo Credentials Autofill */}
            <div className="pt-3 border-t border-slate-100 text-center space-y-2">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                1-Click Demo Accounts:
              </span>

              {/* Students (3) */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-blue-700 flex items-center justify-center space-x-1">
                  <span>🎓 Students:</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('student');
                      setPassword('student123');
                    }}
                    className="px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-[10px] font-semibold text-blue-800 transition cursor-pointer border border-blue-200"
                  >
                    Aarav (CSE)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('diya');
                      setPassword('student123');
                    }}
                    className="px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-[10px] font-semibold text-blue-800 transition cursor-pointer border border-blue-200"
                  >
                    Diya (ECE)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('kabir');
                      setPassword('student123');
                    }}
                    className="px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-[10px] font-semibold text-blue-800 transition cursor-pointer border border-blue-200"
                  >
                    Kabir (ME)
                  </button>
                </div>
              </div>

              {/* Faculty */}
              <div className="flex items-center justify-center gap-1.5 pt-1 flex-wrap text-[10px]">
                <span className="font-bold text-purple-700">👩‍🏫 Faculty:</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('faculty');
                    setPassword('faculty123');
                  }}
                  className="px-2 py-1 rounded-md bg-purple-50 hover:bg-purple-100 font-semibold text-purple-800 transition cursor-pointer border border-purple-200"
                >
                  Dr. Sunita (HoD)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('vikram');
                    setPassword('faculty123');
                  }}
                  className="px-2 py-1 rounded-md bg-purple-50 hover:bg-purple-100 font-semibold text-purple-800 transition cursor-pointer border border-purple-200"
                >
                  Dr. Vikram (Research)
                </button>
              </div>

            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
