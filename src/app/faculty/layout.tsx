import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { AccessDenied } from '@/components/AccessDenied';

export const dynamic = 'force-dynamic';

export default async function FacultyLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Enforce strict RBAC: Students cannot access Faculty portal
  if (user && user.role === 'STUDENT') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar currentUser={user} />
        <main className="flex-1 flex items-center justify-center p-4">
          <AccessDenied
            requiredRole="FACULTY"
            currentRole={user.role}
            userName={user.name}
            userEmail={user.email}
          />
        </main>
      </div>
    );
  }

  const facultyUser = user || {
    id: 'demo-faculty',
    name: 'Dr. Sunita Rao',
    email: 'faculty@campusiq.edu',
    role: 'FACULTY' as const,
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar currentUser={facultyUser} />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar role="FACULTY" />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
