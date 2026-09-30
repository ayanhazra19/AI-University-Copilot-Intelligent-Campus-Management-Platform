'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  GraduationCap,
  AlertCircle,
  Bell,
  FileText,
  BarChart3,
  Database,
  History,
  FolderOpen,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  role: 'STUDENT' | 'FACULTY' | 'ADMIN';
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const studentLinks = [
    { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { label: 'AI Copilot', href: '/student/copilot', icon: Sparkles, highlight: true },
    { label: 'Academics & Gaps', href: '/student/academics', icon: GraduationCap },
    { label: 'Complaints', href: '/student/complaints', icon: AlertCircle },
    { label: 'Notices', href: '/student/notices', icon: Bell },
    { label: 'Document Center', href: '/student/documents', icon: FolderOpen },
  ];

  const facultyLinks = [
    { label: 'Dashboard', href: '/faculty', icon: LayoutDashboard },
    { label: 'Faculty Copilot', href: '/faculty/copilot', icon: Sparkles, highlight: true },
    { label: 'Campus Analytics', href: '/faculty/analytics', icon: BarChart3 },
    { label: 'Academic Analytics', href: '/faculty/academics', icon: GraduationCap },
    { label: 'Department Complaints', href: '/faculty/complaints', icon: AlertCircle },
    { label: 'Notices', href: '/faculty/notices', icon: Bell },
  ];

  const adminLinks = [
    { label: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Admin Copilot', href: '/admin/copilot', icon: Sparkles, highlight: true },
    { label: 'Campus Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Complaint Command', href: '/admin/complaints', icon: AlertCircle },
    { label: 'Knowledge Base', href: '/admin/knowledge', icon: Database },
    { label: 'Notices Manager', href: '/admin/notices', icon: Bell },
    { label: 'Audit Logs', href: '/admin/audit', icon: History },
  ];

  const links = role === 'ADMIN' ? adminLinks : role === 'FACULTY' ? facultyLinks : studentLinks;

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-slate-200/80 bg-white/70 min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-1">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          {role} Workspace
        </div>

        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : link.highlight
                  ? 'text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/70'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? 'text-white'
                      : link.highlight
                      ? 'text-indigo-600'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{link.label}</span>
              </div>
              {isActive ? (
                <ChevronRight className="w-3.5 h-3.5 text-indigo-200" />
              ) : link.highlight ? (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              ) : null}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto pt-6">
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50/80 to-slate-50 border border-indigo-100/80 text-xs">
          <div className="flex items-center space-x-2 text-indigo-700 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CampusIQ AI Core</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            One intelligent layer connecting students, academics, complaints, and campus analytics.
          </p>
        </div>
      </div>
    </aside>
  );
}
