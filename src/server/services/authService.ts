import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken, verifyToken } from '@/lib/auth';

export async function authenticateWithPassword(email: string, password: string, requiredRole?: string) {
  const cleanEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
    include: { student: true, faculty: true },
  });

  if (!user) {
    return { success: false, error: 'Invalid email or password', status: 401 };
  }

  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) {
    return { success: false, error: 'Invalid email or password', status: 401 };
  }

  if (requiredRole && user.role !== requiredRole) {
    if (requiredRole === 'ADMIN') {
      return {
        success: false,
        error: 'Access Denied: Only authorized University Administrators may access this portal.',
        status: 403,
      };
    }
    return {
      success: false,
      error: `Access Denied: Account does not have ${requiredRole} privileges.`,
      status: 403,
    };
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role as any,
    name: user.name,
  });

  return {
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      avatar: user.avatar,
      student: user.student,
      faculty: user.faculty,
    },
  };
}

export async function authenticateDemoPersona(role: 'STUDENT' | 'FACULTY' | 'ADMIN') {
  let targetEmail = 'student@campusiq.edu';
  if (role === 'FACULTY') targetEmail = 'faculty@campusiq.edu';
  if (role === 'ADMIN') targetEmail = 'admin@campusiq.edu';

  const user = await prisma.user.findUnique({
    where: { email: targetEmail },
    include: { student: true, faculty: true },
  });

  if (!user) {
    return {
      success: false,
      error: `Demo account for role ${role} not found. Please run seed.`,
      status: 404,
    };
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role as any,
    name: user.name,
  });

  return {
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      avatar: user.avatar,
      student: user.student,
      faculty: user.faculty,
    },
  };
}
