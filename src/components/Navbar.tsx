'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Sparkles,
  Search,
  Bell,
  User,
  LogOut,
  Compass,
  CheckCircle,
  Menu,
  X,
  PlayCircle,
  ChevronDown,
} from 'lucide-react';
import { CommandPalette } from './CommandPalette';
import { NotificationDrawer, NotificationItem } from './NotificationDrawer';
import { DemoTourModal } from './DemoTourModal';

interface NavbarProps {
  currentUser?: {
    id: string;
    name: string;
    email: string;
    role: 'STUDENT' | 'FACULTY' | 'ADMIN';
    department?: string | null;
    avatar?: string | null;
  } | null;
}

export function Navbar({ currentUser }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [switching, setSwitching] = useState(false);

  const activeRole = currentUser?.role || 'STUDENT';

  // Fetch notifications
  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications) setNotifications(data.notifications);
      })
      .catch(() => {});
  }, [pathname]);

  const handleRoleSwitch = async (targetRole: 'STUDENT' | 'FACULTY' | 'ADMIN') => {
    if (switching) return;
    setSwitching(true);
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });
      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSwitching(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  const handleMarkAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link href={currentUser ? '/dashboard' : '/'} className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/25 group-hover:scale-105 transition">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition">
                  Campus<span className="text-indigo-600">IQ</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide -mt-0.5 hidden sm:inline">
                  AI University Operating Layer
                </span>
              </div>
            </Link>

            {/* Role Badge */}
            {currentUser && (
              <span
                className={`hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase border ${
                  activeRole === 'ADMIN'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : activeRole === 'FACULTY'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {activeRole}
              </span>
            )}
          </div>

          {/* Verified Institutional Role Indicator (No cross-account switcher) */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200/80 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                activeRole === 'ADMIN'
                  ? 'bg-rose-500 animate-pulse'
                  : activeRole === 'FACULTY'
                  ? 'bg-purple-600'
                  : 'bg-emerald-500'
              }`}
            />
            <span className="font-semibold text-slate-800">
              {activeRole === 'ADMIN'
                ? 'Central Administrator'
                : activeRole === 'FACULTY'
                ? 'Faculty Academic Authority'
                : 'Student'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-slate-500 font-medium">
              {currentUser?.name || (activeRole === 'ADMIN' ? 'Prof. Rajesh' : activeRole === 'FACULTY' ? 'Dr. Sunita Rao' : 'Aarav Sharma')}
            </span>
          </div>

          {/* Actions & Utilities */}
          <div className="flex items-center space-x-2.5">
            {/* Global Search / Cmd+K trigger */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-500 text-xs transition border border-slate-200"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-white rounded border border-slate-300">
                ⌘K
              </kbd>
            </button>

            {/* Interactive Demo Guide button */}
            <button
              onClick={() => setIsTourOpen(true)}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition shadow-2xs"
            >
              <PlayCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>Demo Guide</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            {/* User Profile / Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 animate-in fade-in zoom-in-95 duration-100 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="text-xs font-semibold text-slate-900 truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                      <div className="text-[10px] text-indigo-600 font-medium uppercase mt-0.5">
                        {currentUser.role} &bull; {currentUser.department}
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href={`/${activeRole.toLowerCase()}`}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href={`/${activeRole.toLowerCase()}/copilot`}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        AI Copilot
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-xs text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-3.5 h-3.5 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleRoleSwitch('STUDENT')}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
              >
                Launch Demo
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{currentUser?.name || 'Active Account'}</span>
              <span className="text-slate-400">({activeRole})</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-2 px-3 rounded-lg bg-rose-50 text-rose-700 font-semibold text-xs flex items-center justify-center space-x-2 cursor-pointer border border-rose-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </header>

      {/* Global Modals */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        userRole={activeRole}
      />

      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllRead}
      />

      <DemoTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onSwitchRole={handleRoleSwitch}
      />
    </>
  );
}
