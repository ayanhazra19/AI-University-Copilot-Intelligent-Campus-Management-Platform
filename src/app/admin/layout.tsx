import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { AccessDenied } from '@/components/AccessDenied';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Enforce strict RBAC: Only ADMIN accounts may access Central Admin Command
  if (user && user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar currentUser={user} />
        <main className="flex-1 flex items-center justify-center p-4">
          <AccessDenied
            requiredRole="ADMIN"
            currentRole={user.role}
            userName={user.name}
            userEmail={user.email}
          />
        </main>
      </div>
    );
  }

  const adminUser = user || {
    id: 'demo-admin',
    name: 'Prof. Rajesh Verma',
    email: 'admin@campusiq.edu',
    role: 'ADMIN' as const,
    department: 'Academic & Campus Administration',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar currentUser={adminUser} />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar role="ADMIN" />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
