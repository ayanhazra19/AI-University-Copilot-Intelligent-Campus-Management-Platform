'use client';

import React, { useState, useEffect } from 'react';
import { AdminDashboardView } from '@/components/dashboards/AdminDashboardView';
import { AccessDenied } from '@/components/AccessDenied';

export default function AdminDashboardSubPage() {
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
    return <div className="p-8 text-center text-xs text-slate-400">Verifying administrative authorization...</div>;
  }

  // If user is not an admin, deny access
  if (user && user.role !== 'ADMIN') {
    return (
      <AccessDenied
        requiredRole="ADMIN"
        currentRole={user.role}
        userName={user.name}
        userEmail={user.email}
      />
    );
  }

  return <AdminDashboardView user={user} />;
}
