'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  AlertCircle,
  BarChart3,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Database,
  History,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics').then((res) => res.json()),
      fetch('/api/complaints').then((res) => res.json()),
      fetch('/api/audit-logs').then((res) => res.json()),
    ])
      .then(([analyticsData, complaintData, logsData]) => {
        setAnalytics(analyticsData);
        if (complaintData.complaints) setComplaints(complaintData.complaints.slice(0, 5));
        if (logsData.logs) setLogs(logsData.logs.slice(0, 4));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading campus administration metrics...</div>;
  }

  const isLiveDataUnavailable = !analytics?.overview;
  const overview = analytics?.overview || {
    totalStudents: 0,
    totalFaculty: 0,
    totalComplaints: 0,
    openComplaints: 0,
    criticalComplaints: 0,
    avgAttendance: 0,
    avgResolutionHours: 0,
    totalDocuments: 0,
    totalChunks: 0,
  };

  return (
    <div className="space-y-6">
      {/* Live Data Unavailable Notice */}
      {isLiveDataUnavailable && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Live telemetry is currently unavailable. Displaying neutral zero-state values without synthetic estimation.</span>
        </div>
      )}

      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-medium mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CampusIQ Central Administration Command</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">University Operational Overview</h1>
          <p className="text-xs text-indigo-200 mt-1">
            Real-time telemetry across academic cohorts, infrastructure grievances, and knowledge assets.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/analytics"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Ask Campus Data</span>
          </Link>
          <Link
            href="/admin/complaints"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white text-slate-900 font-semibold text-xs shadow-xs hover:bg-slate-100 transition"
          >
            <AlertCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>Triage Board ({overview.openComplaints})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Open Grievances</div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">{overview.openComplaints}</span>
            <span className="text-[11px] text-amber-600 font-semibold">Active SLA</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            {overview.criticalComplaints > 0 ? (
              <span className="text-rose-600 font-semibold">{overview.criticalComplaints} Critical Priority</span>
            ) : (
              '0 Critical Issues'
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Avg Resolution SLA</div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">{overview.avgResolutionHours}</span>
            <span className="text-[11px] text-indigo-600 font-semibold">Hours</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>Under 48h Target SLA</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Cohort Attendance</div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">{overview.avgAttendance}%</span>
            <span className="text-[11px] text-emerald-600 font-semibold">Average</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">Policy Benchmark: 75%</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Knowledge Assets</div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">{overview.totalDocuments || 0} Policies</span>
            <span className="text-[11px] text-indigo-600 font-semibold">RAG Active</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">{overview.totalChunks || 0} Semantic Chunks</div>
        </div>
      </div>

      {/* Two Column Grid: Department Breakdown & Live Grievance Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Complaints by Department</h2>
            </div>
            <Link href="/admin/analytics" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              Interactive Analytics &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {analytics?.departmentDistribution?.map((dept: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-800">{dept.name}</span>
                  <span className="text-slate-500">{dept.count} tickets</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(100, (dept.count / (overview.totalComplaints || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Triage Queue */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <h2 className="text-sm font-bold text-slate-900">Incoming Grievance Queue</h2>
            </div>
            <Link href="/admin/complaints" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              Triage All &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {complaints.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-700">{c.ticketNumber}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : c.status === 'IN_PROGRESS'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="font-semibold text-slate-900 line-clamp-1">{c.title}</div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Student: {c.studentName}</span>
                  <span>Dept: <strong className="text-slate-700">{c.department}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent System Audit Logs */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-bold text-slate-900">Security & Operational Audit Trail</h2>
          </div>
          <Link href="/admin/audit" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
            View Complete Logs &rarr;
          </Link>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {logs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">{log.action}: </span>
                <span className="text-slate-600">{log.details}</span>
              </div>
              <span className="text-[11px] text-slate-400 whitespace-nowrap ml-4">
                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
