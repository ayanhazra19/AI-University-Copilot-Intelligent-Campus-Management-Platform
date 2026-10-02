'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  GraduationCap,
  AlertCircle,
  Bell,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BookOpen,
  ShieldCheck,
  Search,
  MapPin,
  QrCode,
  Award,
  X,
} from 'lucide-react';

export function StudentDashboardView({ user }: { user?: any }) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copilotQuery, setCopilotQuery] = useState('');
  const [showIdCard, setShowIdCard] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/academics').then((res) => res.json()),
      fetch('/api/complaints?studentOnly=true').then((res) => res.json()),
      fetch('/api/notices').then((res) => res.json()),
    ])
      .then(([academicData, complaintData, noticeData]) => {
        setData(academicData);
        if (complaintData?.complaints) setComplaints(complaintData.complaints);
        if (noticeData?.notices) setNotices(noticeData.notices);
      })
      .catch((err) => console.error('Student data load error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCopilotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotQuery.trim()) return;
    router.push(`/student/copilot?q=${encodeURIComponent(copilotQuery)}`);
  };

  const formatDate = (dateVal: any) => {
    if (!dateVal) return 'Recent';
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? 'Today' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const student = data?.student || {
    name: user?.name || 'Aarav Sharma',
    rollNumber: user?.student?.rollNumber || 'CSE-2023-042',
    semester: user?.student?.semester || 4,
    department: user?.department || 'Computer Science & Engineering',
    gpa: user?.student?.gpa || 3.72,
    academicStatus: 'Good Standing',
  };

  const analysis = data?.analysis || {
    overallAttendancePercentage: 87.0,
    overallGpa: 3.72,
    earlyAlerts: [
      {
        courseCode: 'CS204',
        courseName: 'Computer Networks',
        attendancePercentage: 70.0,
        consecutiveClassesNeeded: 3,
        threshold: 75,
      },
    ],
    learningGaps: [
      {
        courseCode: 'CS204',
        courseName: 'Computer Networks',
        topic: 'IP Subnetting & CIDR calculations',
        scorePercentage: 58,
        recommendedAction: 'Practice VLSM subnet allocation worksheets & review Chapter 5 lecture recordings.',
      },
    ],
  };

  const courses = data?.courses || [
    { code: 'CS201', name: 'Data Structures & Algorithms', credits: 4, attendancePercentage: 92.5, grade: 'A', instructor: 'Dr. Priya Nair' },
    { code: 'CS204', name: 'Computer Networks', credits: 4, attendancePercentage: 70.0, grade: 'B-', instructor: 'Prof. Vikram Rao' },
    { code: 'CS203', name: 'Operating Systems', credits: 4, attendancePercentage: 85.0, grade: 'A-', instructor: 'Dr. Ananya Roy' },
    { code: 'MA201', name: 'Discrete Mathematics', credits: 3, attendancePercentage: 88.0, grade: 'A', instructor: 'Prof. R. S. Gupta' },
  ];

  const todayClasses = [
    { time: '09:30 AM - 10:45 AM', code: 'CS201', name: 'Data Structures & Algorithms', room: 'Block B - Room 302', faculty: 'Dr. Priya Nair', status: 'Completed' },
    { time: '11:15 AM - 12:30 PM', code: 'CS204', name: 'Computer Networks (Lab)', room: 'Computing Lab 4', faculty: 'Prof. Vikram Rao', status: 'In Progress' },
    { time: '02:00 PM - 03:15 PM', code: 'CS203', name: 'Operating Systems', room: 'Block B - Room 305', faculty: 'Dr. Ananya Roy', status: 'Upcoming' },
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
      {/* Galgotias Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d233a] via-[#1e3a8a] to-[#2563eb] text-white p-6 sm:p-8 shadow-lg border border-blue-900/30">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 right-32 w-48 h-48 bg-indigo-500/15 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-medium mb-3 backdrop-blur-xs border border-blue-400/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Galgotias University • Spring Term 2025</span>
              <span className="text-blue-300">|</span>
              <span className="font-semibold text-white uppercase tracking-wider">Student Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Welcome back, {student.name}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-medium text-white">{student.department}</span>
              <span>•</span>
              <span>Semester {student.semester}</span>
              <span>•</span>
              <span>Roll: {student.rollNumber}</span>
              <span>•</span>
              <span className="inline-flex items-center text-emerald-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified Active Session
              </span>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowIdCard(true)}
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/20 transition cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-blue-200" />
              <span>Digital Campus ID</span>
            </button>
            <Link
              href="/student/copilot"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-blue-950 font-bold text-xs shadow-md hover:bg-blue-50 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#2563eb]" />
              <span>Launch AI Copilot</span>
            </Link>
            <Link
              href="/student/complaints"
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white font-semibold text-xs border border-blue-400/30 transition cursor-pointer"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Grievance / Tickets</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Overall Attendance</span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {analysis.overallAttendancePercentage}%
            </span>
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                analysis.overallAttendancePercentage >= 75
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {analysis.overallAttendancePercentage >= 75 ? 'Safe (>75%)' : 'At Risk (<75%)'}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                analysis.overallAttendancePercentage >= 75
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, analysis.overallAttendancePercentage)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2.5 flex items-center">
            <span>Galgotias Exam Rule: &ge;75% required</span>
          </p>
        </div>

        {/* GPA & Standing */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Cumulative GPA</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {analysis.overallGpa}
            </span>
            <span className="text-xs font-bold text-slate-400">/ 4.00</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-3 flex items-center space-x-1.5 bg-emerald-50/80 px-2 py-1 rounded-lg border border-emerald-100">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Top 10% in CSE Cohort</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Status: {student.academicStatus || 'Good Standing'}</p>
        </div>

        {/* Active Grievances */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Active Complaints</span>
            <Clock className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {complaints.filter((c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length}
            </span>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              In Triage
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 flex items-center justify-between">
            <span>Avg Response SLA:</span>
            <span className="font-semibold text-slate-700">&lt; 6 Hours</span>
          </p>
          <div className="mt-2 text-[11px] text-blue-600 font-medium hover:underline">
            <Link href="/student/complaints">
              View Live Ticket Status &rarr;
            </Link>
          </div>
        </div>

        {/* Campus Card & Access */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Campus Access Pass</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-lg font-bold text-slate-900">RFID Active</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600">
            <span>Wi-Fi Quota:</span>
            <span className="font-semibold text-blue-700">50 GB / Mo (Active)</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-600">
            <span>Hostel Turnstile:</span>
            <span className="font-semibold text-emerald-600">Authorized Gate 2</span>
          </div>
        </div>
      </div>

      {/* AI Copilot Quick Ask Interactive Bar */}
      <div className="p-5 rounded-2xl bg-white border border-blue-100 shadow-sm relative overflow-hidden">
        <div className="flex items-center space-x-2 text-xs font-bold text-blue-900 mb-2 uppercase tracking-wide">
          <Sparkles className="w-4 h-4 text-[#2563eb]" />
          <span>Ask Galgotias AI Copilot (Grounded Institutional Knowledge)</span>
        </div>
        <form onSubmit={handleCopilotSubmit} className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={copilotQuery}
            onChange={(e) => setCopilotQuery(e.target.value)}
            placeholder="Ask anything (e.g. 'What is the attendance condonation rule?', 'Hostel gate timings?', 'Midterm timetable?')..."
            className="w-full pl-10 pr-24 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 transition bg-slate-50/50"
          />
          <button
            type="submit"
            className="absolute right-2 px-3.5 py-1.5 rounded-lg bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            Ask AI
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-medium">Quick Prompts:</span>
          {[
            'Minimum attendance for exams?',
            'Medical condonation policy & criteria',
            'Hostel night curfew & biometric timings',
            'How to request grade re-evaluation?',
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCopilotQuery(prompt);
                router.push(`/student/copilot?q=${encodeURIComponent(prompt)}`);
              }}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition border border-slate-200/60 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Schedule + Academic Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Lectures / Schedule */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Today&apos;s Class Schedule</h2>
              </div>
              <span className="text-xs text-slate-400">Semester 4 • Room Allocations</span>
            </div>

            <div className="space-y-3">
              {todayClasses.map((cls, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition gap-2"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-2 rounded-full bg-blue-500 self-stretch shrink-0" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">{cls.code}: {cls.name}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            cls.status === 'Completed'
                              ? 'bg-slate-200 text-slate-700'
                              : cls.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-700 animate-pulse'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {cls.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-3">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-slate-400" />
                          {cls.time}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                          {cls.room}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-slate-600 self-end sm:self-center">
                    {cls.faculty}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Courses & Attendance Tracker */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Enrolled Courses & Attendance Status</h2>
              </div>
              <Link href="/student/academics" className="text-xs text-blue-600 hover:underline font-semibold">
                Detailed Analysis &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {courses.map((course: any) => {
                const isBelow = course.attendancePercentage < 75;
                return (
                  <div
                    key={course.code}
                    className={`p-4 rounded-xl border transition ${
                      isBelow
                        ? 'border-amber-300 bg-amber-50/40'
                        : 'border-slate-200/70 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{course.code}</span>
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        Grade: {course.grade}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 font-medium line-clamp-1 mb-2">
                      {course.name}
                    </div>

                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500">Attendance:</span>
                      <span className={`font-bold ${isBelow ? 'text-amber-700' : 'text-slate-800'}`}>
                        {course.attendancePercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          isBelow ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, course.attendancePercentage)}%` }}
                      />
                    </div>

                    {isBelow && (
                      <div className="mt-2 text-[10px] text-amber-800 font-medium flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Need 3 more consecutive classes for 75% exam threshold</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explainable AI Learning Gaps */}
          {analysis.learningGaps && analysis.learningGaps.length > 0 && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-blue-50/40 border border-indigo-100 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-indigo-900 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Explainable AI Learning Diagnostic</span>
                </div>
                <span className="text-[11px] text-indigo-600 font-semibold bg-indigo-100/60 px-2 py-0.5 rounded-md">
                  Actionable Advice
                </span>
              </div>
              <div className="space-y-3">
                {analysis.learningGaps.map((gap: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white border border-indigo-100/80 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        {gap.courseCode} • {gap.topic}
                      </span>
                      <span className="text-[11px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">
                        Midterm: {gap.scorePercentage}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      💡 <strong>Targeted Study Recommendation:</strong> {gap.recommendedAction}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Notices & Grievances */}
        <div className="space-y-6">
          {/* Official Notices */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Campus Notices</h2>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                Live Bulletins
              </span>
            </div>

            <div className="space-y-3">
              {notices.slice(0, 4).map((notice) => (
                <div
                  key={notice.id}
                  className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition group"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold uppercase text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                      {notice.category}
                    </span>
                    <span>{formatDate(notice.createdAt)}</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition line-clamp-1">
                    {notice.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {notice.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Grievance / Complaints Status */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800">Your Recent Grievances</h2>
              </div>
              <Link
                href="/student/complaints?action=new"
                className="text-[11px] text-blue-600 font-bold hover:underline"
              >
                + New Ticket
              </Link>
            </div>

            <div className="space-y-3">
              {complaints.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No open complaints. Everything looks smooth!
                </div>
              ) : (
                complaints.slice(0, 3).map((comp) => (
                  <div key={comp.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                          comp.priority === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-700'
                            : comp.priority === 'HIGH'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {comp.priority} PRIORITY
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {comp.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 line-clamp-1">{comp.title}</div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>Dept: {comp.assignedDepartment || 'General'}</span>
                      <span className="text-[10px] text-blue-600 font-medium">SLA: &lt; 6 hrs</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Digital Campus ID Modal */}
      {showIdCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#0d233a] via-[#1e3a8a] to-[#0f172a] text-white p-6 shadow-2xl border border-blue-400/30">
            <button
              onClick={() => setShowIdCard(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-4 border-b border-blue-400/20">
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
              <h3 className="text-sm font-extrabold tracking-wider uppercase text-blue-100">
                Galgotias University
              </h3>
              <p className="text-[10px] text-blue-300 uppercase tracking-widest">
                Digital Student Smart Pass
              </p>
            </div>

            <div className="mt-5 flex items-center space-x-4">
              <div className="w-20 h-24 rounded-xl overflow-hidden bg-slate-700 border-2 border-blue-400/40 shadow-inner shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-white leading-tight">
                  {student.name}
                </h4>
                <p className="text-xs text-blue-200 mt-0.5">
                  Roll: <strong className="text-white">{student.rollNumber}</strong>
                </p>
                <p className="text-[11px] text-blue-300 mt-0.5">
                  Dept: {student.department}
                </p>
                <div className="inline-flex items-center space-x-1 mt-2 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Valid Through 2026</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-blue-400/20 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-blue-300">RFID Card No:</div>
                <div className="text-xs font-mono font-bold text-white tracking-widest">
                  GU-2023-8849-RFID
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
