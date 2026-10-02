'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, LogOut, Lock, AlertTriangle } from 'lucide-react';

interface AccessDeniedProps {
  requiredRole: 'STUDENT' | 'FACULTY' | 'ADMIN';
  currentRole?: string;
  userName?: string;
  userEmail?: string;
}

export function AccessDenied({
  requiredRole,
  currentRole = 'STUDENT',
  userName,
  userEmail,
}: AccessDeniedProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
      router.push('/login');
    }
  };

  const roleLabel =
    requiredRole === 'ADMIN'
      ? 'University Administrators'
      : requiredRole === 'FACULTY'
      ? 'Verified Faculty Members'
      : 'Students';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl bg-white border border-rose-200/80 p-6 sm:p-8 shadow-xl text-center relative overflow-hidden">
        {/* Accent top banner */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-red-600 to-amber-500" />

        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-inner mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold uppercase tracking-wider mb-2">
          <Lock className="w-3 h-3" />
          <span>403 &bull; Access Restricted</span>
        </div>

        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Unauthorized Access
        </h1>

        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          This portal requires <strong>{roleLabel}</strong> privileges. Your active session is currently authenticated as:
        </p>

        {/* User Identity Chip */}
        <div className="my-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800">{userName || 'Active Account'}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
              {currentRole}
            </span>
          </div>
          {userEmail && <div className="text-[11px] text-slate-500 mt-0.5">{userEmail}</div>}
        </div>

        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/60 text-left text-[11px] text-amber-800 space-y-1 mb-6">
          <div className="flex items-center space-x-1 font-semibold text-amber-900">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Institutional Security Notice</span>
          </div>
          <p className="text-amber-700/90 leading-tight">
            Role-Based Access Control (RBAC) is strictly enforced per Galgotias University IT bylaws.
          </p>
        </div>

        <div className="space-y-2.5">
          <Link
            href="/dashboard"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to My Dashboard</span>
          </Link>

          <button
            onClick={handleLogout}
            type="button"
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>Log In With Different Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
