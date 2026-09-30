import { prisma } from '@/lib/prisma';

export async function generateComplaintsReport(format: 'json' | 'csv' = 'json') {
  const complaints = await prisma.complaint.findMany({
    orderBy: { createdAt: 'desc' },
  });

  if (format === 'csv') {
    const header = 'TicketNumber,Title,Category,Priority,Department,Status,StudentName,CreatedAt\n';
    const rows = complaints
      .map(
        (c) =>
          `"${c.ticketNumber}","${c.title.replace(/"/g, '""')}","${c.category}","${c.priority}","${c.department}","${c.status}","${c.studentName}","${c.createdAt.toISOString()}"`
      )
      .join('\n');

    return {
      type: 'csv' as const,
      contentType: 'text/csv',
      fileName: 'CampusIQ_Complaints_Report.csv',
      data: header + rows,
    };
  }

  return {
    type: 'json' as const,
    data: { reportType: 'Complaints', generatedAt: new Date(), data: complaints },
  };
}

export async function generateAttendanceReport(format: 'json' | 'csv' = 'json') {
  const attendances = await prisma.attendance.findMany({
    include: { course: true, student: { include: { user: true } } },
  });

  if (format === 'csv') {
    const header = 'StudentName,RollNumber,CourseCode,CourseName,Attended,Total,Percentage\n';
    const rows = attendances
      .map(
        (a) =>
          `"${a.student.user.name}","${a.student.rollNumber}","${a.course.code}","${a.course.name}",${a.attendedClasses},${a.totalClasses},${a.percentage}%`
      )
      .join('\n');

    return {
      type: 'csv' as const,
      contentType: 'text/csv',
      fileName: 'CampusIQ_Attendance_Report.csv',
      data: header + rows,
    };
  }

  return {
    type: 'json' as const,
    data: { reportType: 'Attendance', generatedAt: new Date(), data: attendances },
  };
}
