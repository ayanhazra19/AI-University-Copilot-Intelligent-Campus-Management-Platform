'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  BarChart3,
  AlertCircle,
  Database,
  History,
  TrendingUp,
  Clock,
  Sparkles,
  Building2,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  X,
  FileText,
  Activity,
} from 'lucide-react';

export function AdminDashboardView({ user }: { user?: any }) {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copilotQuery, setCopilotQuery] = useState('');
  const [showIdCard, setShowIdCard] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics').then((res) => res.json()),
      fetch('/api/complaints').then((res) => res.json()),
      fetch('/api/audit-logs').then((res) => res.json()),
    ])
      .then(([analyticsData, complaintData, logsData]) => {
        setAnalytics(analyticsData);
        if (complaintData?.complaints) setComplaints(complaintData.complaints.slice(0, 6));
        if (logsData?.logs) setLogs(logsData.logs.slice(0, 5));
      })
      .catch((err) => console.error('Admin data load error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCopilotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotQuery.trim()) return;
    router.push(`/admin/copilot?q=${encodeURIComponent(copilotQuery)}`);
  };

  const formatDate = (dateVal: any) => {
    if (!dateVal) return 'Recent';
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? 'Just now' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const adminName = user?.name || 'Dr. Rajesh Kumar';
  const overview = analytics?.overview || {
    totalStudents: 1240,
    totalFaculty: 85,
    totalComplaints: complaints.length || 7,
    openComplaints: complaints.filter((c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length || 4,
    criticalComplaints: complaints.filter((c) => c.priority === 'CRITICAL').length || 1,
    avgAttendance: 87.0,
    avgResolutionHours: 4.8,
    totalDocuments: 12,
    totalChunks: 86,
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-36 bg-slate-200/80 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-28 bg-slate-200/80 rounded-xl" />
          <div className="h-28 bg-slate-200/80 rounded-xl" />
          <div className="h-28 bg-slate-200/80 rounded-xl" />
          <div className="h-28 bg-slate-200/80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Central Command Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-lg border border-slate-800">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 right-32 w-48 h-48 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-200 text-xs font-medium mb-3 backdrop-blur-xs border border-rose-400/20">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span>Galgotias University • Central Executive Administration</span>
              <span className="text-slate-400">|</span>
              <span className="font-semibold text-white uppercase tracking-wider">Dean / Admin Command</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Welcome, {adminName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-medium text-white">Office of the Registrar & Campus Operations</span>
              <span>•</span>
              <span>Root Institutional Node</span>
              <span>•</span>
              <span className="inline-flex items-center text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Full Executive Clearance
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowIdCard(true)}
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/20 transition cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-indigo-300" />
              <span>Admin Badge</span>
            </button>
            <Link
              href="/admin/analytics"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Ask Campus Data (NL)</span>
            </Link>
            <Link
              href="/admin/complaints"
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-xs shadow-xs hover:bg-slate-100 transition cursor-pointer"
            >
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Triage Board ({overview.openComplaints})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Open Campus Grievances</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {overview.openComplaints}
            </span>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              {overview.criticalComplaints} Critical
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Target Response SLA: &lt; 6 Hours</p>
          <div className="mt-1 text-[11px] text-indigo-600 font-medium hover:underline">
            <Link href="/admin/complaints">Open Escalation Console &rarr;</Link>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Average SLA Resolution</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {overview.avgResolutionHours} hrs
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Under 24h Goal
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500 w-[85%]" />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Institutional Compliance: 94.2%</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Campus Cohort Attendance</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {overview.avgAttendance}%
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Aggregated Safe
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Policy Benchmark: 75.0%</p>
          <div className="mt-1 text-[11px] text-indigo-600 font-medium hover:underline">
            <Link href="/admin/analytics">View Cohort Heatmap &rarr;</Link>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Knowledge Base Assets</span>
            <Database className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {overview.totalDocuments} Policies
            </span>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
              RAG Indexed
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">{overview.totalChunks} Vector Semantic Chunks</p>
          <div className="mt-1 text-[11px] text-indigo-600 font-medium hover:underline">
            <Link href="/admin/knowledge">Manage Embeddings &rarr;</Link>
          </div>
        </div>
      </div>

      {/* Admin AI Data Query Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Ask Campus Data (Natural Language Executive Analytics)</span>
        </div>
        <form onSubmit={handleCopilotSubmit} className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={copilotQuery}
            onChange={(e) => setCopilotQuery(e.target.value)}
            placeholder="Ask campus data (e.g. 'Which departments have the most unresolved complaints?', 'Cohort attendance distribution across semesters?')..."
            className="w-full pl-10 pr-24 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition bg-slate-50/50"
          />
          <button
            type="submit"
            className="absolute right-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            Execute Query
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-medium">Pre-compiled Executive Queries:</span>
          {[
            'Which departments have the most unresolved complaints?',
            'What is the average SLA resolution time across hostel vs academics?',
            'List all students with attendance below 75% in CSE Semester 4',
            'Summary of critical electrical safety complaints logged this week',
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCopilotQuery(prompt);
                router.push(`/admin/analytics?q=${encodeURIComponent(prompt)}`);
              }}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition border border-slate-200/60 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Triage Queue + Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Active Grievance Command Board */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-800">Live Campus Grievance Command Board</h2>
              </div>
              <Link href="/admin/complaints" className="text-xs text-indigo-600 font-semibold hover:underline">
                Full Lifecycle Triage &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {complaints.map((comp) => (
                <div
                  key={comp.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                          comp.priority === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-700'
                            : comp.priority === 'HIGH'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {comp.priority}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{comp.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center space-x-3">
                      <span>Dept: {comp.assignedDepartment || 'Campus Operations'}</span>
                      <span>•</span>
                      <span>Target SLA: &lt; 6 hrs</span>
                    </div>
                  </div>
                  <div className="self-end sm:self-center shrink-0">
                    <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {comp.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Audit Logs & Knowledge Health */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-800">Immutable Audit Logs</h2>
              </div>
              <Link href="/admin/audit" className="text-[11px] text-indigo-600 font-bold hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {logs.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">No recent audit events.</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-semibold text-slate-700">{log.action}</span>
                      <span>{formatDate(log.createdAt)}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1">{log.details || 'System event executed.'}</p>
                    <span className="text-[10px] text-indigo-600 font-mono mt-1 block">
                      Actor: {log.userEmail || 'System Core'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin ID Pass Modal */}
      {showIdCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#0f172a] via-[#1e1e38] to-[#020617] text-white p-6 shadow-2xl border border-slate-700">
            <button
              onClick={() => setShowIdCard(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-4 border-b border-slate-700">
              <div className="w-12 h-12 mx-auto rounded-full bg-white flex items-center justify-center p-1 shadow-md mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/galgotias_logo.png"
                  alt="Galgotias Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <h3 className="text-sm font-extrabold tracking-wider uppercase text-slate-100">
                Galgotias University
              </h3>
              <p className="text-[10px] text-indigo-400 uppercase tracking-widest">
                Executive Administration Authority Pass
              </p>
            </div>

            <div className="mt-5 flex items-center space-x-4">
              <div className="w-20 h-24 rounded-xl overflow-hidden bg-slate-800 border-2 border-slate-600 shadow-inner shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={adminName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-white leading-tight">
                  {adminName}
                </h4>
                <p className="text-xs text-indigo-300 mt-0.5">
                  Designation: <strong>Registrar / Dean Admin</strong>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Level 1 Executive Clearance
                </p>
                <div className="inline-flex items-center space-x-1 mt-2 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Campus Master Key</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400">Master Access Card:</div>
                <div className="text-xs font-mono font-bold text-white tracking-widest">
                  GU-ADMIN-EXEC-01
                </div>
              </div>
              <div className="p-1.5 rounded-lg bg-white">
                <QrCode className="w-9 h-9 text-slate-900" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
