'use client';

import React, { useState, useEffect } from 'react';
import { FacultyDashboardView } from '@/components/dashboards/FacultyDashboardView';
import { AccessDenied } from '@/components/AccessDenied';

export default function FacultyDashboardSubPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setUser(data?.user);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Verifying faculty authorization...</div>;
  }

  // If user is a student, deny access
  if (user && user.role === 'STUDENT') {
    return (
      <AccessDenied
        requiredRole="FACULTY"
        currentRole={user.role}
        userName={user.name}
        userEmail={user.email}
      />
    );
  }

  return <FacultyDashboardView user={user} />;
}
