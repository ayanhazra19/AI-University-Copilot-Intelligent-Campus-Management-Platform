'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  UserCheck,
  Check,
  X,
  FileText,
  Search,
} from 'lucide-react';

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Status Change Dialog State
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [technicianNote, setTechnicianNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadComplaints = () => {
    setLoading(true);
    fetch(`/api/complaints?department=${filterDept}&status=${filterStatus}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.complaints) setComplaints(data.complaints);
        if (data.categories) setCategories(data.categories);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadComplaints();

    // Live refresh: periodic background poll and revalidation on tab focus
    const interval = setInterval(() => {
      fetch(`/api/complaints?department=${filterDept}&status=${filterStatus}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.complaints) setComplaints(data.complaints);
        })
        .catch(() => {});
    }, 5000);

    const onFocus = () => {
      fetch(`/api/complaints?department=${filterDept}&status=${filterStatus}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.complaints) setComplaints(data.complaints);
        })
        .catch(() => {});
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [filterDept, filterStatus]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !newStatus) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          note: technicianNote,
          resolutionNote: newStatus === 'RESOLVED' ? resolutionNote : undefined,
        }),
      });

      if (res.ok) {
        setSelectedComplaint(null);
        setNewStatus('');
        setResolutionNote('');
        setTechnicianNote('');
        loadComplaints();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const departments = [
    'ALL',
    'IT Services',
    'Hostel Administration',
    'Academic Affairs',
    'Examination Cell',
    'Estate & Facilities',
    'Campus Transport',
    'Central Library',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Campus Grievance Triage Board</h1>
          <p className="text-xs text-slate-500">
            Centrally review, assign, and update student complaint lifecycles with automated audit logging.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total Queue: <strong className="text-slate-900">{complaints.length}</strong> tickets
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-medium">Department:</span>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-slate-50 focus:outline-none"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-medium">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-slate-50 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Ticket #</th>
                <th className="p-3.5">Student / Title</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">Current Status</th>
                <th className="p-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Loading grievance database...
                  </td>
                </tr>
              ) : complaints.length > 0 ? (
                complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-mono font-bold text-indigo-700">{c.ticketNumber}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{c.title}</div>
                      <div className="text-[11px] text-slate-400">
                        {c.studentName} &bull; {c.location || 'Campus'}
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-700 font-medium">{c.department}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadge(c.priority)}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'IN_PROGRESS'
                            ? 'bg-indigo-100 text-indigo-800'
                            : c.status === 'UNDER_REVIEW'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => {
                          setSelectedComplaint(c);
                          setNewStatus(c.status);
                        }}
                        className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold"
                      >
                        Progress Status
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No complaints matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Progression Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Update Ticket: {selectedComplaint.ticketNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-slate-400">Issue:</span>
                <div className="font-semibold text-slate-800 mt-0.5">{selectedComplaint.title}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit / Technician Note</label>
                <input
                  type="text"
                  placeholder="e.g. Technician dispatched / parts replaced on site"
                  value={technicianNote}
                  onChange={(e) => setTechnicianNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {newStatus === 'RESOLVED' && (
                <div>
                  <label className="block font-semibold text-emerald-800 mb-1">
                    Student Resolution Report
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Explain how the issue was fixed for the student..."
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50/30 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs disabled:opacity-40 transition"
                >
                  {updating ? 'Saving...' : 'Confirm Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
