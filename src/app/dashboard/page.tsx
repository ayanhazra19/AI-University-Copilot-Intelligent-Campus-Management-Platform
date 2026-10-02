'use client';

import React, { useState, useEffect } from 'react';
import { StudentDashboardView } from '@/components/dashboards/StudentDashboardView';
import { FacultyDashboardView } from '@/components/dashboards/FacultyDashboardView';
import { AdminDashboardView } from '@/components/dashboards/AdminDashboardView';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
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

  const role = currentUser?.role || 'STUDENT';

  // Strictly render only the dashboard corresponding to the authenticated user's role
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {role === 'ADMIN' ? (
        <AdminDashboardView user={currentUser} />
      ) : role === 'FACULTY' ? (
        <FacultyDashboardView user={currentUser} />
      ) : (
        <StudentDashboardView user={currentUser} />
      )}
    </div>
  );
}
