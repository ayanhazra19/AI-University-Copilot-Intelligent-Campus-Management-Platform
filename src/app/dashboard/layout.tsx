import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // If user is logged in, use their real profile; otherwise default to Aarav Sharma for resilient demo
  const activeUser = user || {
    id: 'demo-student',
    name: 'Aarav Sharma',
    email: 'student@campusiq.edu',
    role: 'STUDENT' as const,
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar currentUser={activeUser} />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar role={activeUser.role} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
