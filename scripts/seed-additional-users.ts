import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding additional demo users (2 Students, 1 Faculty, 1 Admin)...');

  const studentPasswordHash = bcrypt.hashSync('student123', 10);
  const facultyPasswordHash = bcrypt.hashSync('faculty123', 10);
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);

  // 1. Student 2: Diya Patel (ECE)
  const diyaUser = await prisma.user.upsert({
    where: { email: 'diya@campusiq.edu' },
    update: {
      name: 'Diya Patel',
      password: studentPasswordHash,
      department: 'Electronics & Communication Engineering',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    create: {
      email: 'diya@campusiq.edu',
      password: studentPasswordHash,
      name: 'Diya Patel',
      role: 'STUDENT',
      department: 'Electronics & Communication Engineering',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
  });

  const diyaProfile = await prisma.studentProfile.upsert({
    where: { userId: diyaUser.id },
    update: {
      rollNumber: 'ECE-2023-118',
      semester: 4,
      department: 'Electronics & Communication Engineering',
      gpa: 3.88,
      academicStatus: "Dean's List / Honors",
      mentorName: 'Dr. Vikram Malhotra',
    },
    create: {
      userId: diyaUser.id,
      rollNumber: 'ECE-2023-118',
      semester: 4,
      department: 'Electronics & Communication Engineering',
      gpa: 3.88,
      academicStatus: "Dean's List / Honors",
      mentorName: 'Dr. Vikram Malhotra',
    },
  });

  // 2. Student 3: Kabir Mehta (Mechanical)
  const kabirUser = await prisma.user.upsert({
    where: { email: 'kabir@campusiq.edu' },
    update: {
      name: 'Kabir Mehta',
      password: studentPasswordHash,
      department: 'Mechanical Engineering',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    create: {
      email: 'kabir@campusiq.edu',
      password: studentPasswordHash,
      name: 'Kabir Mehta',
      role: 'STUDENT',
      department: 'Mechanical Engineering',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  const kabirProfile = await prisma.studentProfile.upsert({
    where: { userId: kabirUser.id },
    update: {
      rollNumber: 'ME-2023-075',
      semester: 4,
      department: 'Mechanical Engineering',
      gpa: 3.45,
      academicStatus: 'Good Standing',
      mentorName: 'Dr. Sunita Rao',
    },
    create: {
      userId: kabirUser.id,
      rollNumber: 'ME-2023-075',
      semester: 4,
      department: 'Mechanical Engineering',
      gpa: 3.45,
      academicStatus: 'Good Standing',
      mentorName: 'Dr. Sunita Rao',
    },
  });

  // 3. Faculty 2: Dr. Vikram Malhotra (ECE & Dean Research)
  const vikramUser = await prisma.user.upsert({
    where: { email: 'vikram@campusiq.edu' },
    update: {
      name: 'Dr. Vikram Malhotra',
      password: facultyPasswordHash,
      department: 'Electronics & Communication Engineering',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    create: {
      email: 'vikram@campusiq.edu',
      password: facultyPasswordHash,
      name: 'Dr. Vikram Malhotra',
      role: 'FACULTY',
      department: 'Electronics & Communication Engineering',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  });

  await prisma.facultyProfile.upsert({
    where: { userId: vikramUser.id },
    update: {
      employeeId: 'FAC-ECE-204',
      department: 'Electronics & Communication Engineering',
      designation: 'Professor & Dean of Research',
      officeLocation: 'Academic Block C, Room 405',
    },
    create: {
      userId: vikramUser.id,
      employeeId: 'FAC-ECE-204',
      department: 'Electronics & Communication Engineering',
      designation: 'Professor & Dean of Research',
      officeLocation: 'Academic Block C, Room 405',
    },
  });

  // 4. Admin 2: Dr. Meenakshi Sundaram (Student Affairs)
  await prisma.user.upsert({
    where: { email: 'meenakshi@campusiq.edu' },
    update: {
      name: 'Dr. Meenakshi Sundaram',
      password: adminPasswordHash,
      department: 'Office of Student Affairs & Welfare',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
    create: {
      email: 'meenakshi@campusiq.edu',
      password: adminPasswordHash,
      name: 'Dr. Meenakshi Sundaram',
      role: 'ADMIN',
      department: 'Office of Student Affairs & Welfare',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 5. Connect courses to Diya and Kabir
  const courses = await prisma.course.findMany({ take: 3 });
  if (courses.length > 0) {
    for (const c of courses) {
      // Diya attendances
      await prisma.attendance.create({
        data: {
          studentId: diyaProfile.id,
          courseId: c.id,
          totalClasses: 32,
          attendedClasses: 30,
          percentage: 93.8,
        },
      });

      // Kabir attendances
      await prisma.attendance.create({
        data: {
          studentId: kabirProfile.id,
          courseId: c.id,
          totalClasses: 32,
          attendedClasses: 26,
          percentage: 81.3,
        },
      });
    }
  }

  console.log('✅ Successfully seeded:');
  console.log('   - Student: Diya Patel (diya@campusiq.edu / student123, Roll: ECE-2023-118)');
  console.log('   - Student: Kabir Mehta (kabir@campusiq.edu / student123, Roll: ME-2023-075)');
  console.log('   - Faculty: Dr. Vikram Malhotra (vikram@campusiq.edu / faculty123, ID: FAC-ECE-204)');
  console.log('   - Admin: Dr. Meenakshi Sundaram (meenakshi@campusiq.edu / admin123)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
