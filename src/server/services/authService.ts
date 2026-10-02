import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken, verifyToken } from '@/lib/auth';

export async function authenticateWithPassword(
  identifier: string,
  password: string,
  requiredRole?: string,
  disallowRole?: string
) {
  const clean = identifier.toLowerCase().trim();

  // Support friendly aliases for all demo accounts
  let targetEmail = clean;
  if (clean === 'student' || clean === 'student1' || clean === 'aarav') targetEmail = 'student@campusiq.edu';
  else if (clean === 'student2' || clean === 'diya') targetEmail = 'diya@campusiq.edu';
  else if (clean === 'student3' || clean === 'kabir') targetEmail = 'kabir@campusiq.edu';
  else if (clean === 'faculty' || clean === 'faculty1' || clean === 'sunita' || clean === 'priya') targetEmail = 'faculty@campusiq.edu';
  else if (clean === 'faculty2' || clean === 'vikram') targetEmail = 'vikram@campusiq.edu';
  else if (clean === 'admin' || clean === 'admin1' || clean === 'rajesh') targetEmail = 'admin@campusiq.edu';
  else if (clean === 'admin2' || clean === 'meenakshi') targetEmail = 'meenakshi@campusiq.edu';

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: targetEmail },
        { email: clean },
        { student: { rollNumber: identifier.trim() } },
        { faculty: { employeeId: identifier.trim() } },
      ],
    },
    include: { student: true, faculty: true },
  });

  if (!user) {
    return { success: false, error: 'Invalid email or password', status: 401 };
  }

  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) {
    return { success: false, error: 'Invalid email or password', status: 401 };
  }

  // Prevent Admins from logging in through the Student/Faculty main portal
  if (disallowRole && user.role === disallowRole) {
    if (disallowRole === 'ADMIN') {
      return {
        success: false,
        error: 'Administrator accounts must log in through the Admin Portal (Top right corner "Admin Login").',
        status: 403,
      };
    }
    return {
      success: false,
      error: `Access Denied: ${disallowRole} accounts cannot log in here.`,
      status: 403,
    };
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
