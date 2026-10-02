'use client';

import React from 'react';
import { AccessDenied } from '@/components/AccessDenied';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <AccessDenied requiredRole="FACULTY" currentRole="STUDENT" />
    </div>
  );
}
