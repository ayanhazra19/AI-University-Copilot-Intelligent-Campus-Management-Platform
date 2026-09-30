'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  Plus,
  Sparkles,
  Clock,
  CheckCircle2,
  Filter,
  Send,
  X,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';

export default function StudentComplaintsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading complaints...</div>}>
      <StudentComplaintsContent />
    </Suspense>
  );
}

function StudentComplaintsContent() {
  const searchParams = useSearchParams();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // New Complaint Modal & AI Triage State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState(searchParams.get('title') || '');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [aiClassification, setAiClassification] = useState<any>(null);
  const [classifying, setClassifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  // Auto-open modal if URL has action=new or title
  useEffect(() => {
    if (searchParams.get('action') === 'new' || searchParams.get('title')) {
      setIsModalOpen(true);
      if (searchParams.get('title')) {
        handleClassify(searchParams.get('title') || '', '');
      }
    }
  }, [searchParams]);

  const loadComplaints = () => {
    setLoading(true);
    fetch(`/api/complaints?studentOnly=true&status=${filterStatus}`)
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
      fetch(`/api/complaints?studentOnly=true&status=${filterStatus}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.complaints) setComplaints(data.complaints);
        })
        .catch(() => {});
    }, 5000);

    const onFocus = () => {
      fetch(`/api/complaints?studentOnly=true&status=${filterStatus}`)
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
  }, [filterStatus]);

  // Live AI Classification Trigger
  const handleClassify = async (currTitle: string, currDesc: string, currLoc?: string) => {
    if (!currTitle && !currDesc) return;
    setClassifying(true);
    try {
      const res = await fetch('/api/complaints/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currTitle,
          description: currDesc,
          location: currLoc,
        }),
      });
      const data = await res.json();
      setAiClassification(data);
    } catch (e) {
      console.error(e);
    } finally {
      setClassifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          location,
          category: aiClassification?.category,
          subcategory: aiClassification?.subcategory,
          priority: aiClassification?.priority,
          department: aiClassification?.department,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        setLocation('');
        setAiClassification(null);
        loadComplaints();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-emerald-100 text-emerald-800';
      case 'IN_PROGRESS':
        return 'bg-indigo-100 text-indigo-800';
      case 'UNDER_REVIEW':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Intelligent Complaint Management</h1>
          <p className="text-xs text-slate-500">
            Submit campus grievances with instant AI classification, priority SLA calculation, and real-time status tracking.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Complaint</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-medium mr-2 flex items-center">
          <Filter className="w-3.5 h-3.5 mr-1" />
          Filter:
        </span>
        {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterStatus === st
                ? 'bg-slate-800 text-white font-semibold'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Complaints List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading complaints...</div>
        ) : complaints.length > 0 ? (
          complaints.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-indigo-200 transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {c.ticketNumber}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(c.priority)}`}>
                    {c.priority} PRIORITY
                  </span>
                  <span className="text-xs text-slate-400">&bull; {c.category}</span>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${getStatusColor(c.status)}`}>
                  {c.status.replace('_', ' ')}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{c.description}</p>
              </div>

              {/* AI Auto-Triage Summary Box */}
              {c.aiSummary && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1">
                  <div className="flex items-center space-x-1.5 text-indigo-600 font-semibold text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Classification & Justification</span>
                  </div>
                  <div className="text-[11px] text-slate-600 italic">&quot;{c.aiSummary}&quot;</div>
                  {c.aiPriorityReason && (
                    <div className="text-[11px] text-slate-500">
                      <strong>Priority Rationale:</strong> {c.aiPriorityReason}
                    </div>
                  )}
                </div>
              )}

              {/* Resolution Note if resolved */}
              {c.resolutionNote && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
                  <div className="font-semibold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Resolution Report:</span>
                  </div>
                  <p className="text-[11px]">{c.resolutionNote}</p>
                </div>
              )}

              {/* 5-Stage Lifecycle Stepper */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <div>
                  Assigned Department: <strong className="text-slate-700">{c.department}</strong>
                  {c.assignedTo && <span> &bull; Specialist: <strong>{c.assignedTo}</strong></span>}
                </div>
                <span>Logged: {new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 opacity-60" />
            <p className="font-medium">No complaints matching filter &quot;{filterStatus}&quot;</p>
          </div>
        )}
      </div>

      {/* Modal: New Complaint with Live AI Auto-Assist */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">File a Campus Grievance</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Issue Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wi-Fi is not working in Hostel Block B, 3rd Floor"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    handleClassify(e.target.value, description, location);
                  }}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specific Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hostel Block B, Room 314 area"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the issue in detail..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    handleClassify(title, e.target.value, location);
                  }}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Real-time AI Triage Assistant Box */}
              {aiClassification && (
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-900 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>AI Triage Prediction</span>
                    </span>
                    {classifying && <span className="text-[10px] text-indigo-500 animate-pulse">Analyzing...</span>}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-white border border-indigo-100">
                      <div className="text-[10px] text-slate-400">Category</div>
                      <div className="font-semibold text-slate-800">{aiClassification.category}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-indigo-100">
                      <div className="text-[10px] text-slate-400">Priority</div>
                      <div className="font-bold text-amber-600">{aiClassification.priority}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-indigo-100">
                      <div className="text-[10px] text-slate-400">Auto Department</div>
                      <div className="font-semibold text-emerald-700">{aiClassification.department}</div>
                    </div>
                  </div>

                  <p className="text-[11px] text-indigo-800 leading-relaxed">
                    <strong>Justification:</strong> {aiClassification.priorityReason}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-40 transition flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Registering...' : 'Submit Grievance'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
