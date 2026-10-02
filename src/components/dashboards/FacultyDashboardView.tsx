'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  BookOpen,
  Users,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  BarChart3,
  Search,
  MapPin,
  QrCode,
  FileCheck,
  X,
  UserCheck,
} from 'lucide-react';

export function FacultyDashboardView({ user }: { user?: any }) {
  const router = useRouter();
  const [academics, setAcademics] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copilotQuery, setCopilotQuery] = useState('');
  const [showIdCard, setShowIdCard] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/academics').then((res) => res.json()),
      fetch('/api/complaints?department=Academic%20Affairs').then((res) => res.json()),
      fetch('/api/notices').then((res) => res.json()),
    ])
      .then(([acadData, compData, noticeData]) => {
        setAcademics(acadData);
        if (compData.complaints) setComplaints(compData.complaints);
        if (noticeData.notices) setNotices(noticeData.notices);
      })
      .catch((err) => console.error('Faculty data load error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCopilotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotQuery.trim()) return;
    router.push(`/faculty/copilot?q=${encodeURIComponent(copilotQuery)}`);
  };

  const formatDate = (dateVal: any) => {
    if (!dateVal) return 'Recent';
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? 'Today' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const facultyName = user?.name || 'Dr. Sunita Rao';
  const facultyDept = user?.department || 'Department of Computer Science & Engineering';
  const employeeId = user?.faculty?.employeeId || 'FAC-2018-088';

  const teachingLoad = [
    {
      code: 'CS201',
      name: 'Data Structures & Algorithms',
      credits: 4,
      enrolled: 45,
      avgAttendance: 92.5,
      status: 'On Track',
      room: 'Block B - Room 302',
      nextClass: 'Today, 09:30 AM',
    },
    {
      code: 'CS202',
      name: 'Database Management Systems',
      credits: 4,
      enrolled: 45,
      avgAttendance: 90.0,
      status: 'On Track',
      room: 'Computing Lab 2',
      nextClass: 'Tomorrow, 10:00 AM',
    },
  ];

  const atRiskStudents = [
    {
      name: 'Aarav Sharma',
      roll: 'CSE-2023-042',
      course: 'CS204 Computer Networks',
      attendance: '70.0%',
      issue: 'Requires 3 consecutive attendances to clear 75% exam cutoff',
      action: 'Advisory Notice Sent',
    },
    {
      name: 'Rohan Mehra',
      roll: 'CSE-2023-089',
      course: 'CS202 DBMS',
      attendance: '72.5%',
      issue: 'Missed 2 lab submissions on SQL Indexing',
      action: 'Lab Re-attempt Allowed',
    },
  ];

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
      {/* Faculty Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950 via-indigo-900 to-purple-900 text-white p-6 sm:p-8 shadow-lg border border-purple-900/30">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 right-32 w-48 h-48 bg-indigo-500/15 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-medium mb-3 backdrop-blur-xs border border-purple-400/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Galgotias University • Faculty Academic Command</span>
              <span className="text-purple-300">|</span>
              <span className="font-semibold text-white uppercase tracking-wider">Faculty Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Welcome, {facultyName}!
            </h1>
            <p className="text-xs sm:text-sm text-purple-100/90 mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-medium text-white">{facultyDept}</span>
              <span>•</span>
              <span>Employee ID: {employeeId}</span>
              <span>•</span>
              <span className="inline-flex items-center text-emerald-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active Teaching Session
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowIdCard(true)}
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/20 transition cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-purple-200" />
              <span>Faculty Smart Pass</span>
            </button>
            <Link
              href="/faculty/copilot"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-purple-950 font-bold text-xs shadow-md hover:bg-purple-50 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Faculty AI Copilot</span>
            </Link>
            <Link
              href="/faculty/academics"
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-purple-600/90 hover:bg-purple-500 text-white font-semibold text-xs border border-purple-400/30 transition cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Cohort Analytics</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Assigned Teaching Load</span>
            <BookOpen className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">2 Courses</span>
          </div>
          <p className="text-[11px] text-purple-700 font-medium mt-3">CS201 (DSA) &bull; CS202 (DBMS)</p>
          <p className="text-[11px] text-slate-400 mt-1">90 Total Enrolled Students</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Average Attendance</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">92.5%</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Above Target
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 w-[92.5%]" />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Campus Target: &ge;75% required</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>At-Risk Students Flagged</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600">
              {atRiskStudents.length} Students
            </span>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              Early Alert
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Low attendance & mid-term gap</p>
          <div className="mt-1 text-[11px] text-purple-600 font-medium hover:underline">
            <Link href="/faculty/academics">Review Diagnostic List &rarr;</Link>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Academic Grievances</span>
            <Clock className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {complaints.length} Tickets
            </span>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
              Under Review
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Re-evaluation & Condonation requests</p>
          <div className="mt-1 text-[11px] text-purple-600 font-medium hover:underline">
            <Link href="/faculty/complaints">Manage Department Queue &rarr;</Link>
          </div>
        </div>
      </div>

      {/* AI Copilot Quick Bar */}
      <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-sm relative overflow-hidden">
        <div className="flex items-center space-x-2 text-xs font-bold text-purple-900 mb-2 uppercase tracking-wide">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Faculty AI Copilot (Syllabus, Regulations, Condonation Bylaws)</span>
        </div>
        <form onSubmit={handleCopilotSubmit} className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={copilotQuery}
            onChange={(e) => setCopilotQuery(e.target.value)}
            placeholder="Ask faculty queries (e.g. 'What is the procedure for awarding attendance condonation on medical grounds?', 'Re-evaluation grading rules?')..."
            className="w-full pl-10 pr-24 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition bg-slate-50/50"
          />
          <button
            type="submit"
            className="absolute right-2 px-3.5 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            Ask AI
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-medium">Suggested Inquiries:</span>
          {[
            'Medical condonation up to 10% procedure',
            'Policy for conducting makeup quizzes',
            'Midterm mark submission deadline',
            'Attendance threshold rules for detention',
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCopilotQuery(prompt);
                router.push(`/faculty/copilot?q=${encodeURIComponent(prompt)}`);
              }}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 transition border border-slate-200/60 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Teaching Load + At-Risk Students */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Assigned Courses Section */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <h2 className="text-sm font-bold text-slate-800">Current Semester Teaching Load</h2>
              </div>
              <span className="text-xs text-slate-400">Spring Term 2025</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teachingLoad.map((course) => (
                <div
                  key={course.code}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-purple-200 transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-950">{course.code}: {course.name}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {course.avgAttendance}% Avg
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Enrollment:</span>
                      <strong className="text-slate-800">{course.enrolled} Students</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Location:</span>
                      <span>{course.room}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Next Lecture:</span>
                      <span className="text-purple-700 font-semibold">{course.nextClass}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">{course.credits} Credits</span>
                    <Link href="/faculty/academics" className="text-purple-600 font-bold hover:underline">
                      View Gradebook &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* At-Risk Students Diagnostic Section */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h2 className="text-sm font-bold text-slate-800">Flagged Students Requiring Advisory</h2>
              </div>
              <span className="text-xs text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">
                Attendance &lt; 75%
              </span>
            </div>

            <div className="space-y-3">
              {atRiskStudents.map((stud, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">{stud.name}</span>
                      <span className="text-[11px] text-slate-500 font-mono">({stud.roll})</span>
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                        {stud.attendance}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{stud.issue}</p>
                    <span className="text-[10px] text-purple-700 font-semibold">{stud.course}</span>
                  </div>
                  <div className="self-end sm:self-center shrink-0">
                    <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      {stud.action}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Notices & Grievance Queue */}
        <div className="space-y-6">
          {/* Department Notices */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <h2 className="text-sm font-bold text-slate-800">Faculty Bulletins</h2>
              </div>
              <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                Dean&apos;s Circulars
              </span>
            </div>

            <div className="space-y-3">
              {notices.slice(0, 4).map((notice) => (
                <div
                  key={notice.id}
                  className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold uppercase text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                      {notice.category}
                    </span>
                    <span>{formatDate(notice.createdAt)}</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 line-clamp-1">{notice.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {notice.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Department Academic Inquiries */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-purple-600" />
                <h2 className="text-sm font-bold text-slate-800">Department Inquiries</h2>
              </div>
              <Link href="/faculty/complaints" className="text-[11px] text-purple-600 font-bold hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {complaints.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No active academic tickets in queue.
                </div>
              ) : (
                complaints.slice(0, 3).map((comp) => (
                  <div key={comp.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {comp.category}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">{comp.status}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 line-clamp-1">{comp.title}</div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>Priority: {comp.priority}</span>
                      <span className="text-[10px] text-purple-600 font-medium">SLA: &lt; 24 hrs</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Faculty Smart ID Modal */}
      {showIdCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1e1b4b] via-[#311042] to-[#0f172a] text-white p-6 shadow-2xl border border-purple-400/30">
            <button
              onClick={() => setShowIdCard(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-4 border-b border-purple-400/20">
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
              <h3 className="text-sm font-extrabold tracking-wider uppercase text-purple-100">
                Galgotias University
              </h3>
              <p className="text-[10px] text-purple-300 uppercase tracking-widest">
                Official Faculty & Staff Smart Pass
              </p>
            </div>

            <div className="mt-5 flex items-center space-x-4">
              <div className="w-20 h-24 rounded-xl overflow-hidden bg-slate-700 border-2 border-purple-400/40 shadow-inner shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={facultyName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-white leading-tight">
                  {facultyName}
                </h4>
                <p className="text-xs text-purple-200 mt-0.5">
                  ID: <strong className="text-white">{employeeId}</strong>
                </p>
                <p className="text-[11px] text-purple-300 mt-0.5">
                  Dept: {facultyDept}
                </p>
                <div className="inline-flex items-center space-x-1 mt-2 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-[10px] font-semibold">
                  <UserCheck className="w-3 h-3" />
                  <span>HoD Academic Authority</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-purple-400/20 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-purple-300">Staff RFID Key:</div>
                <div className="text-xs font-mono font-bold text-white tracking-widest">
                  GU-FAC-2018-KEY
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
