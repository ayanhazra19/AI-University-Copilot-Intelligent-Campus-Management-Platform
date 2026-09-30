import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createEmbedding, serializeEmbedding } from '../src/server/ai/embeddings';

const prisma = new PrismaClient();

async function prepareChunks(
  docTitle: string,
  chunks: Array<{ chunkIndex: number; pageNumber: number; keywords: string; content: string }>
) {
  return Promise.all(
    chunks.map(async (c) => ({
      ...c,
      embeddingJson: serializeEmbedding(await createEmbedding(`${c.content} ${c.keywords} ${docTitle}`)),
    }))
  );
}

async function main() {
  console.log('🌱 Starting CampusIQ synthetic demo data seeding...');

  // 1. Clean existing records
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.documentChunk.deleteMany({});
  await prisma.knowledgeDocument.deleteMany({});
  await prisma.complaintStatusHistory.deleteMany({});
  await prisma.complaint.deleteMany({});
  await prisma.complaintCategory.deleteMany({});
  await prisma.academicAlert.deleteMany({});
  await prisma.learningInsight.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.notice.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.facultyProfile.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Passwords
  const studentPasswordHash = bcrypt.hashSync('student123', 10);
  const facultyPasswordHash = bcrypt.hashSync('faculty123', 10);
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);

  // 3. Create Users
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@campusiq.edu',
      password: studentPasswordHash,
      name: 'Aarav Sharma',
      role: 'STUDENT',
      department: 'Computer Science & Engineering',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const facultyUser = await prisma.user.create({
    data: {
      email: 'faculty@campusiq.edu',
      password: facultyPasswordHash,
      name: 'Dr. Sunita Rao',
      role: 'FACULTY',
      department: 'Computer Science & Engineering',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@campusiq.edu',
      password: adminPasswordHash,
      name: 'Prof. Rajesh Verma',
      role: 'ADMIN',
      department: 'Academic & Campus Administration',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 4. Create Profiles
  const studentProfile = await prisma.studentProfile.create({
    data: {
      userId: studentUser.id,
      rollNumber: 'CSE-2023-042',
      semester: 4,
      department: 'Computer Science & Engineering',
      gpa: 3.72,
      academicStatus: 'Good Standing',
      mentorName: 'Dr. Sunita Rao',
    },
  });

  const facultyProfile = await prisma.facultyProfile.create({
    data: {
      userId: facultyUser.id,
      employeeId: 'FAC-CSE-109',
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor & HoD Academics',
      officeLocation: 'Academic Block 4, Room 312',
    },
  });

  // 5. Create Courses
  const coursesData = [
    {
      code: 'CS201',
      name: 'Data Structures & Algorithms',
      department: 'Computer Science & Engineering',
      semester: 4,
      credits: 4,
      facultyId: facultyProfile.id,
    },
    {
      code: 'CS202',
      name: 'Database Management Systems',
      department: 'Computer Science & Engineering',
      semester: 4,
      credits: 4,
      facultyId: facultyProfile.id,
    },
    {
      code: 'CS203',
      name: 'Operating Systems Architecture',
      department: 'Computer Science & Engineering',
      semester: 4,
      credits: 4,
    },
    {
      code: 'CS204',
      name: 'Computer Networks & Protocols',
      department: 'Computer Science & Engineering',
      semester: 4,
      credits: 3,
    },
    {
      code: 'CS205',
      name: 'Software Engineering & Agile Methods',
      department: 'Computer Science & Engineering',
      semester: 4,
      credits: 3,
    },
  ];

  const createdCourses = [];
  for (const c of coursesData) {
    const course = await prisma.course.create({ data: c });
    createdCourses.push(course);
  }

  // 6. Attendance for Student Aarav Sharma
  // Target: Overall ~87%, but CS204 is at 70% to trigger realistic early alert!
  const attendanceRecords = [
    { courseId: createdCourses[0].id, total: 40, attended: 38, pct: 95.0 }, // CS201 DSA
    { courseId: createdCourses[1].id, total: 40, attended: 36, pct: 90.0 }, // CS202 DBMS
    { courseId: createdCourses[2].id, total: 40, attended: 33, pct: 82.5 }, // CS203 OS
    { courseId: createdCourses[3].id, total: 40, attended: 28, pct: 70.0 }, // CS204 Networks (Alert trigger!)
    { courseId: createdCourses[4].id, total: 40, attended: 39, pct: 97.5 }, // CS205 SE
  ];

  for (const att of attendanceRecords) {
    await prisma.attendance.create({
      data: {
        studentId: studentProfile.id,
        courseId: att.courseId,
        totalClasses: att.total,
        attendedClasses: att.attended,
        percentage: att.pct,
      },
    });
  }

  // 7. Assessments & Marks
  const assessmentsData = [
    // CS201 - Data Structures
    { courseId: createdCourses[0].id, type: 'MIDTERM', title: 'Midterm Examination', score: 92, maxScore: 100, topic: 'Trees, Heaps, Graph Traversals' },
    { courseId: createdCourses[0].id, type: 'ASSIGNMENT', title: 'Graph Traversal Implementation', score: 96, maxScore: 100, topic: 'Dijkstra & A* Pathfinding' },
    { courseId: createdCourses[0].id, type: 'QUIZ', title: 'Complexity Analysis Quiz', score: 88, maxScore: 100, topic: 'Asymptotic Notations' },

    // CS202 - DBMS
    { courseId: createdCourses[1].id, type: 'MIDTERM', title: 'Midterm Examination', score: 86, maxScore: 100, topic: 'Relational Algebra & Normalization' },
    { courseId: createdCourses[1].id, type: 'ASSIGNMENT', title: 'Complex SQL Queries & Indexing', score: 90, maxScore: 100, topic: 'SQL Query Optimization' },
    { courseId: createdCourses[1].id, type: 'QUIZ', title: 'Transaction ACID Properties', score: 84, maxScore: 100, topic: 'Concurrency Control' },

    // CS203 - OS
    { courseId: createdCourses[2].id, type: 'MIDTERM', title: 'Midterm Examination', score: 79, maxScore: 100, topic: 'CPU Scheduling & Memory Management' },
    { courseId: createdCourses[2].id, type: 'ASSIGNMENT', title: 'POSIX Thread Synchronization', score: 82, maxScore: 100, topic: 'Mutex & Semaphores' },

    // CS204 - Networks (Shows Learning Gap)
    { courseId: createdCourses[3].id, type: 'MIDTERM', title: 'Midterm Examination', score: 64, maxScore: 100, topic: 'OSI Reference Model & Data Link Layer' },
    { courseId: createdCourses[3].id, type: 'QUIZ', title: 'IP Subnetting & CIDR Calculations', score: 58, maxScore: 100, topic: 'VLSM & CIDR Calculations' },
    { courseId: createdCourses[3].id, type: 'ASSIGNMENT', title: 'Socket Programming in C', score: 74, maxScore: 100, topic: 'TCP/UDP Client-Server' },

    // CS205 - Software Engineering
    { courseId: createdCourses[4].id, type: 'MIDTERM', title: 'Midterm Examination', score: 94, maxScore: 100, topic: 'Design Patterns & UML Modelling' },
    { courseId: createdCourses[4].id, type: 'ASSIGNMENT', title: 'Sprint Backlog & CI/CD Pipeline', score: 98, maxScore: 100, topic: 'Agile & DevOps Automation' },
  ];

  for (const a of assessmentsData) {
    await prisma.assessment.create({
      data: {
        studentId: studentProfile.id,
        courseId: a.courseId,
        type: a.type,
        title: a.title,
        score: a.score,
        maxScore: a.maxScore,
        topic: a.topic,
      },
    });
  }

  // 8. Explainable Learning Insights
  await prisma.learningInsight.createMany({
    data: [
      {
        studentId: studentProfile.id,
        subject: 'Data Structures & Algorithms (CS201)',
        topic: 'Graph Algorithms & Trees',
        status: 'STRONG',
        explainableReason: 'Consistent scores above 90% across Midterm (92%) and Graph Assignment (96%). High conceptual clarity in greedy and dynamic programming paradigms.',
        recommendedAction: 'Explore advanced competitive programming topics such as Fenwick Trees and Max-Flow min-cut theorems.',
      },
      {
        studentId: studentProfile.id,
        subject: 'Software Engineering (CS205)',
        topic: 'Design Patterns & DevOps Practices',
        status: 'STRONG',
        explainableReason: 'Scored 94% on Midterm and 98% on CI/CD Sprint backlog. Strong architectural design and team workflow comprehension.',
        recommendedAction: 'Consider leading the microservices architecture project in the upcoming semester capstone.',
      },
      {
        studentId: studentProfile.id,
        subject: 'Operating Systems (CS203)',
        topic: 'Process Synchronization & Semaphores',
        status: 'MODERATE',
        explainableReason: 'Average score of 80.5%. Good understanding of basic deadlocks, but marginal errors in complex multi-threaded barrier synchronization.',
        recommendedAction: 'Practice implementing Dining Philosophers problem with monitors and condition variables in the lab simulator.',
      },
      {
        studentId: studentProfile.id,
        subject: 'Computer Networks (CS204)',
        topic: 'IP Subnetting & CIDR Address Planning',
        status: 'NEEDS_ATTENTION',
        explainableReason: 'Recent Quiz score was 58/100 and Midterm score was 64/100. Specific difficulty with variable-length subnet masks (VLSM) and routing table lookup optimization.',
        recommendedAction: 'Complete the interactive Subnetting Practice Module on the LMS and attend Prof. Verma’s tutorial session on Thursday at 4 PM.',
      },
    ],
  });

  // 9. Academic Early Alerts (Safe, Explainable, Supportive)
  await prisma.academicAlert.createMany({
    data: [
      {
        studentId: studentProfile.id,
        type: 'LOW_ATTENDANCE',
        severity: 'HIGH',
        message: 'Attendance in Computer Networks (CS204) is currently 70.0% (28/40 classes), below the mandatory 75% university policy threshold. Additional attendance in the next 4 sessions is advised to maintain exam eligibility.',
        isResolved: false,
      },
      {
        studentId: studentProfile.id,
        type: 'LEARNING_GAP',
        severity: 'MEDIUM',
        message: 'Identified learning gap in CS204 Subnetting & CIDR calculations based on the recent assessment score of 58%. Recommended revision resources have been assigned.',
        isResolved: false,
      },
      {
        studentId: studentProfile.id,
        type: 'DEADLINE',
        severity: 'LOW',
        message: 'CS202 Database Systems Final Project submission is due in 6 days (March 31, 2025).',
        isResolved: false,
      },
    ],
  });

  // 10. Complaint Categories
  const categories = [
    { name: 'IT / Internet', description: 'Campus Wi-Fi, Ethernet, LMS login, and computer lab equipment issues', defaultDepartment: 'IT Services', defaultPriority: 'HIGH' },
    { name: 'Hostel', description: 'Room maintenance, hot water, electricity, cleanliness, and mess facilities', defaultDepartment: 'Hostel Administration', defaultPriority: 'MEDIUM' },
    { name: 'Academic', description: 'Curriculum questions, lecture rescheduling, and course material accessibility', defaultDepartment: 'Academic Affairs', defaultPriority: 'MEDIUM' },
    { name: 'Examination', description: 'Hall tickets, grade transcripts, re-evaluation, and schedule conflicts', defaultDepartment: 'Examination Cell', defaultPriority: 'HIGH' },
    { name: 'Infrastructure & Maintenance', description: 'Classroom projectors, furniture, HVAC, water dispensers, and campus grounds', defaultDepartment: 'Estate & Facilities', defaultPriority: 'MEDIUM' },
    { name: 'Library', description: 'Digital journal access, physical book borrowing, RFID gates, and study pods', defaultDepartment: 'Central Library', defaultPriority: 'LOW' },
    { name: 'Transport', description: 'Campus shuttle schedules, bus pass renewal, and route deviations', defaultDepartment: 'Campus Transport', defaultPriority: 'MEDIUM' },
    { name: 'Fees & Accounts', description: 'Fee receipts, scholarship disbursement, and online payment discrepancies', defaultDepartment: 'Finance Office', defaultPriority: 'MEDIUM' },
  ];

  for (const cat of categories) {
    await prisma.complaintCategory.create({ data: cat });
  }

  // 11. Synthetic Complaints with AI Summaries and Priority Justifications
  const c1 = await prisma.complaint.create({
    data: {
      ticketNumber: 'CIQ-8021',
      studentId: studentProfile.id,
      studentName: 'Aarav Sharma',
      title: 'Wi-Fi connectivity dropped in Hostel Block B, 3rd Floor',
      description: 'Since yesterday evening, the Wi-Fi access point near Room 314 in Hostel Block B has been blinking amber. Neither 5GHz nor 2.4GHz SSID is accepting student logins, which is preventing access to the online LMS portal for upcoming midterm preparation.',
      category: 'Hostel',
      subcategory: 'Internet / Wi-Fi',
      priority: 'HIGH',
      department: 'IT Services',
      status: 'IN_PROGRESS',
      location: 'Hostel Block B, 3rd Floor, Room 314 area',
      aiSummary: 'Student reports failure of Wi-Fi AP in Hostel Block B 3rd Floor preventing access to academic LMS materials.',
      aiPriorityReason: 'High priority because loss of connectivity affects multiple students residing on the 3rd floor preparing for ongoing academic assessments.',
      assignedTo: 'Engineer K. Murthy (Network Ops)',
      statusHistory: {
        create: [
          { fromStatus: 'NONE', toStatus: 'SUBMITTED', changedBy: 'Aarav Sharma (Student)', note: 'Complaint lodged through student portal with AI classification' },
          { fromStatus: 'SUBMITTED', toStatus: 'UNDER_REVIEW', changedBy: 'Admin Dispatcher', note: 'AI routed to IT Services. Verified ticket details.' },
          { fromStatus: 'UNDER_REVIEW', toStatus: 'IN_PROGRESS', changedBy: 'Engineer K. Murthy', note: 'Technician dispatched to replace PoE injector switch on floor 3.' },
        ],
      },
    },
  });

  const c2 = await prisma.complaint.create({
    data: {
      ticketNumber: 'CIQ-7940',
      studentId: studentProfile.id,
      studentName: 'Aarav Sharma',
      title: 'Classroom 302 projector flickering and HDMI port loose',
      description: 'The ceiling projector in Classroom 302 shuts off intermittently during afternoon lectures when instructors plug in via HDMI. Audio also buzzes through the wall speakers.',
      category: 'Infrastructure & Maintenance',
      subcategory: 'Audio/Visual Equipment',
      priority: 'MEDIUM',
      department: 'Estate & Facilities',
      status: 'RESOLVED',
      location: 'Academic Block 3, Classroom 302',
      aiSummary: 'Intermittent projector power shutdown and HDMI connection fault reported during class lectures.',
      aiPriorityReason: 'Medium priority: Disrupts lecture presentations but alternative whiteboards and backup portable projector were temporarily available.',
      assignedTo: 'Facilities AV Team',
      resolutionNote: 'HDMI wall plate replaced and ceiling projector power supply recalibrated on Feb 22. Tested successfully with faculty laptop.',
      statusHistory: {
        create: [
          { fromStatus: 'NONE', toStatus: 'SUBMITTED', changedBy: 'Aarav Sharma (Student)', note: 'Initial submission' },
          { fromStatus: 'SUBMITTED', toStatus: 'IN_PROGRESS', changedBy: 'AV Services Admin', note: 'Work order #AV-401 issued' },
          { fromStatus: 'IN_PROGRESS', toStatus: 'RESOLVED', changedBy: 'Technician Raman', note: 'Replaced wall plate cable and confirmed image stability' },
        ],
      },
    },
  });

  const c3 = await prisma.complaint.create({
    data: {
      ticketNumber: 'CIQ-8104',
      studentId: studentProfile.id,
      studentName: 'Aarav Sharma',
      title: 'Discrepancy in CS202 Midterm Marks Sheet on student portal',
      description: 'The marked physical answer sheet shows 86/100, but the official university ERP portal currently lists 76/100 for Midterm Assessment. Requesting correction before final grade calculation.',
      category: 'Academic',
      subcategory: 'Grade Discrepancy',
      priority: 'MEDIUM',
      department: 'Academic Affairs',
      status: 'UNDER_REVIEW',
      location: 'Academic Portal / CS Dept',
      aiSummary: 'Student identifies a 10-point clerical discrepancy between physical paper and portal entry for CS202 Midterm.',
      aiPriorityReason: 'Medium priority: Requires verification of faculty grade ledger before final grade freeze.',
      assignedTo: 'Academic Registrar Desk',
      statusHistory: {
        create: [
          { fromStatus: 'NONE', toStatus: 'SUBMITTED', changedBy: 'Aarav Sharma (Student)', note: 'Submitted with scanned image of verified marks slip' },
          { fromStatus: 'SUBMITTED', toStatus: 'UNDER_REVIEW', changedBy: 'Dr. Sunita Rao (Faculty)', note: 'Retrieving original grade submission sheet for confirmation.' },
        ],
      },
    },
  });

  // Additional complaints from other students across campus for rich analytics
  await prisma.complaint.create({
    data: {
      ticketNumber: 'CIQ-8118',
      studentId: studentProfile.id,
      studentName: 'Priya Patel',
      title: 'Water dispenser cooling malfunction in Central Library 2nd Floor',
      description: 'The cold water dispenser near the reading hall has been dispensing lukewarm water for 3 days.',
      category: 'Infrastructure & Maintenance',
      subcategory: 'Sanitation & Amenities',
      priority: 'LOW',
      department: 'Estate & Facilities',
      status: 'RESOLVED',
      location: 'Central Library, 2nd Floor',
      aiSummary: 'Library reading room water dispenser cooling system not functional.',
      aiPriorityReason: 'Low priority: Water supply is hygienic and functional; cooling compressor needs routine service.',
      resolutionNote: 'Coolant refill completed by vendor on March 18.',
    },
  });

  await prisma.complaint.create({
    data: {
      ticketNumber: 'CIQ-8135',
      studentId: studentProfile.id,
      studentName: 'Rohan Mehra',
      title: 'Campus Shuttle Route #4 delayed by 35 minutes daily',
      description: 'Morning bus route 4 from City Metro station arrives past 8:50 AM, causing students to arrive late for 8:30 AM lab classes.',
      category: 'Transport',
      subcategory: 'Bus Schedule',
      priority: 'HIGH',
      department: 'Campus Transport',
      status: 'SUBMITTED',
      location: 'North Campus Bus Bay',
      aiSummary: 'Frequent morning delay on Bus Route 4 impacting student 8:30 AM laboratory attendance.',
      aiPriorityReason: 'High priority: Recurring timing failure directly induces academic attendance penalties for commuters.',
    },
  });

  await prisma.complaint.create({
    data: {
      ticketNumber: 'CIQ-8142',
      studentId: studentProfile.id,
      studentName: 'Neha Deshmukh',
      title: 'Critical power blackout in Girl’s Hostel Block D Basement Study Hall',
      description: 'All lights and power sockets in the underground 24/7 study zone tripped an hour ago during heavy rainfall.',
      category: 'Hostel',
      subcategory: 'Electrical / Safety',
      priority: 'CRITICAL',
      department: 'Estate & Facilities',
      status: 'IN_PROGRESS',
      location: 'Hostel Block D, Basement Study Lounge',
      aiSummary: 'Total electrical outage in 24/7 study zone during rainstorm with safety and accessibility concerns.',
      aiPriorityReason: 'Critical priority: Electrical tripping in an enclosed basement area poses safety hazard and immediate disruption.',
      assignedTo: 'Emergency Electrical Response Team',
    },
  });

  // 12. Knowledge Base Documents & Structured Chunks (for Grounded RAG)
  const doc1 = await prisma.knowledgeDocument.create({
    data: {
      title: 'University Attendance Policy & Regulations (2024-2025)',
      fileName: 'University_Attendance_Policy_2024_25.pdf',
      fileType: 'PDF',
      department: 'Academic Affairs',
      category: 'Academic',
      fileSize: 412000,
      processingStatus: 'PROCESSED',
      chunkCount: 3,
      summary: 'Comprehensive guidelines on minimum 75% attendance criteria, medical condonation allowances, detention rules, and leave application procedures.',
      chunks: {
        create: await prepareChunks('University Attendance Policy & Regulations (2024-2025)', [
          {
            chunkIndex: 0,
            pageNumber: 1,
            keywords: 'attendance, mandatory, 75 percent, eligibility, semester exam, detention',
            content: 'Section 1.1: Mandatory Attendance Requirement\nAll undergraduate and postgraduate students are strictly required to maintain a minimum of 75% aggregate attendance across each registered theoretical and practical course during the semester. Students whose attendance falls below 75% in any subject are rendered ineligible to appear for the End-Semester Final Examination in that subject and shall be categorized as "Detained" (Grade FA).',
          },
          {
            chunkIndex: 1,
            pageNumber: 2,
            keywords: 'medical leave, condonation, 65 percent, doctor certificate, academic leave',
            content: 'Section 2.4: Medical & Duty Leave Condonation\nIn cases of genuine medical hospitalization, prolonged illness, or official representation of the University in sports/cultural/academic hackathons, an attendance condonation of up to 10% may be granted by the Academic Council. Under no circumstances may a student be allowed to take final exams if attendance falls below 65%. To claim medical condonation, an official medical certificate from a registered practitioner must be submitted through the CampusIQ portal within 7 calendar days of resuming classes.',
          },
          {
            chunkIndex: 2,
            pageNumber: 4,
            keywords: 'leave application, procedure, student portal, approval, mentor',
            content: 'Section 3.2: Procedure to Apply for Academic Leave\n1. Login to the CampusIQ portal.\n2. Navigate to Academics > Leave Application.\n3. Fill in the leave dates, reason, and attach supporting documentation (medical slip or event invitation).\n4. Submit for Faculty Mentor endorsement.\n5. Upon mentor recommendation, the application is forwarded to the Head of Department (HoD) for final electronic sign-off. Processing takes 2-3 business days.',
          },
        ]),
      },
    },
  });

  const doc2 = await prisma.knowledgeDocument.create({
    data: {
      title: 'Academic Regulations, Grading Scheme & Examination Rules',
      fileName: 'Academic_Regulations_and_Grading_System.pdf',
      fileType: 'PDF',
      department: 'Examination Cell',
      category: 'Examination',
      fileSize: 580000,
      processingStatus: 'PROCESSED',
      chunkCount: 3,
      summary: 'Rules governing the 10-point CGPA grading system, pass criteria, re-evaluation timelines, and remedial exam schedules.',
      chunks: {
        create: await prepareChunks('Academic Regulations, Grading Scheme & Examination Rules', [
          {
            chunkIndex: 0,
            pageNumber: 3,
            keywords: 'grading, 10 point scale, CGPA, GPA, passing grade, D grade',
            content: 'Section 4: Grading Scale & CGPA Evaluation\nThe University adopts a 10-point absolute and relative grading scale: Grade O (Outstanding, 90-100%, 10 points), A+ (Excellent, 80-89%, 9 points), A (Very Good, 70-79%, 8 points), B+ (Good, 60-69%, 7 points), B (Above Average, 50-59%, 6 points), C (Average, 45-49%, 5 points), D (Pass, 40-44%, 4 points), and F (Fail, <40%, 0 points). A minimum grade of "D" is required to earn credits in a course.',
          },
          {
            chunkIndex: 1,
            pageNumber: 6,
            keywords: 're-evaluation, grade review, fee, deadline, answer sheet inspection',
            content: 'Section 7.3: Re-Evaluation & Answer Script Review Procedure\nStudents who wish to appeal their semester examination marks may apply for official Re-Evaluation within 15 calendar days from the date of online result announcement. The fee is $25 (or INR 500) per course. The Examination Controller assigns an independent external evaluator. If the revised score differs by more than 15%, the script is referred to a three-member evaluation board whose decision is final.',
          },
          {
            chunkIndex: 2,
            pageNumber: 9,
            keywords: 'malpractice, exam rules, electronic devices, smart watch, suspension',
            content: 'Section 9.1: Examination Hall Conduct & Malpractice Rules\nStudents must arrive at the examination venue at least 20 minutes prior to the start time. No entry is permitted 15 minutes after examination commencement. Mobile phones, smart watches, programmable calculators, and unauthorized printed sheets are strictly banned inside examination halls. Possession of prohibited electronics results in immediate confiscation, debarment from the remaining exams, and referral to the Proctorial Board.',
          },
        ]),
      },
    },
  });

  const doc3 = await prisma.knowledgeDocument.create({
    data: {
      title: 'Hostel Resident Code of Conduct & Facilities Manual',
      fileName: 'Hostel_Rules_and_Discipline_Code.pdf',
      fileType: 'PDF',
      department: 'Hostel Administration',
      category: 'Hostel',
      fileSize: 320000,
      processingStatus: 'PROCESSED',
      chunkCount: 2,
      summary: 'Hostel curfew timings, night out pass protocols, visitor policies, room maintenance standards, and anti-ragging mandates.',
      chunks: {
        create: await prepareChunks('Hostel Resident Code of Conduct & Facilities Manual', [
          {
            chunkIndex: 0,
            pageNumber: 2,
            keywords: 'curfew, night out, biometric entry, gate timing, hostel gate',
            content: 'Hostel Regulation 2.1: Entry & Curfew Timings\nThe entry gates for all residential student hostels close promptly at 10:00 PM on weekdays and 10:30 PM on weekends. All residents must record their biometric entry. Any return after curfew requires written warden clearance. For planned overnight absences or weekend visits home, residents must submit a digital "Night-Out Pass" via CampusIQ at least 12 hours in advance, accompanied by parental phone confirmation.',
          },
          {
            chunkIndex: 1,
            pageNumber: 5,
            keywords: 'complaints, hostel maintenance, plumber, electrician, internet, room change',
            content: 'Hostel Regulation 5: Room Maintenance & Grievances\nRepairs regarding electrical fittings, plumbing, Wi-Fi connectivity, or furniture defects must be logged directly into the CampusIQ Complaints module under the "Hostel" category. Routine maintenance tickets are serviced between 10:00 AM and 5:00 PM on weekdays. Emergency issues (power outage, water leaks) receive rapid priority response within 2 hours.',
          },
        ]),
      },
    },
  });

  const doc4 = await prisma.knowledgeDocument.create({
    data: {
      title: 'Student Grievance Redressal & Complaint Charter',
      fileName: 'Student_Grievance_and_Complaint_Charter.pdf',
      fileType: 'PDF',
      department: 'Dean of Student Welfare',
      category: 'Administration',
      fileSize: 260000,
      processingStatus: 'PROCESSED',
      chunkCount: 2,
      summary: 'Service level agreements (SLAs), escalation matrix, automated routing rules, and appeal procedures for all student grievances.',
      chunks: {
        create: await prepareChunks('Student Grievance Redressal & Complaint Charter', [
          {
            chunkIndex: 0,
            pageNumber: 1,
            keywords: 'complaint, SLA, resolution time, priority, critical, high, medium, low',
            content: 'Grievance Charter Section 3: Priority SLAs & Resolution Commitments\nEvery ticket lodged on CampusIQ receives an automated AI priority tag and resolution deadline:\n- CRITICAL (Emergency safety, severe water/electrical blackout): Under 6 hours\n- HIGH (Internet outage, transport disruption, exam conflicts): Under 24-48 hours\n- MEDIUM (Classroom AV equipment, grade verification, plumbing): Under 3-5 business days\n- LOW (Library book suggestions, general cosmetic repairs): Under 7-10 business days.',
          },
          {
            chunkIndex: 1,
            pageNumber: 3,
            keywords: 'escalation, dean, ombudsman, unresolved ticket, appeal',
            content: 'Grievance Charter Section 6: Automatic Escalation Matrix\nIf a complaint remains unresolved beyond its SLA deadline, it is automatically escalated:\n- Level 1 Escalation: Department Supervisor / Senior Engineer\n- Level 2 Escalation (at +48h overdue): Campus Administrative Officer\n- Level 3 Escalation: Dean of Student Welfare & University Ombudsman for direct oversight.',
          },
        ]),
      },
    },
  });

  // 13. University Notices
  await prisma.notice.createMany({
    data: [
      {
        title: 'Midterm Examination Schedule - Spring Semester 2025',
        content: 'The official timetable for Midterm Examinations for all 2nd and 4th semester B.Tech and M.Tech students is now published. Exams begin on April 7, 2025. Students are requested to check seating arrangements and ensure 75% attendance criteria.',
        category: 'EXAM',
        targetRole: 'ALL',
        department: 'Examination Cell',
        isImportant: true,
        authorName: 'Controller of Examinations',
      },
      {
        title: 'Campus High-Speed Fiber Backbone Maintenance & Upgrade',
        content: 'IT Services will be upgrading the primary core router and Wi-Fi access points across North Campus hostels on Saturday, March 29, between 02:00 AM and 05:00 AM. Intermittent downtime of 15 minutes is expected.',
        category: 'GENERAL',
        targetRole: 'ALL',
        department: 'IT Services',
        isImportant: false,
        authorName: 'Director of IT Infrastructure',
      },
      {
        title: 'Annual CampusIQ Hackathon & Innovation Challenge 2025',
        content: 'Registrations are now open for the 30-Day Innovation Challenge. Cash prizes totaling $10,000 for top AI solutions in Campus Management, Student Support, and Smart Infrastructure. Submit project briefs by March 31.',
        category: 'EVENT',
        targetRole: 'STUDENT',
        department: 'Innovation & Incubation Centre',
        isImportant: true,
        authorName: 'Innovation Hub Coordinator',
      },
      {
        title: 'Central Library Extended 24/7 Reading Hours for Revision Week',
        content: 'Starting next Monday, the 1st and 2nd floor silent study halls in the Central Library will remain accessible 24 hours daily with valid student RFID badges. Complimentary coffee stations will be operational after 11 PM.',
        category: 'ACADEMIC',
        targetRole: 'ALL',
        department: 'Central Library',
        isImportant: false,
        authorName: 'Chief University Librarian',
      },
    ],
  });

  // 14. Notifications for Aarav Sharma (Student)
  await prisma.notification.createMany({
    data: [
      {
        userId: studentUser.id,
        title: 'Complaint Update: CIQ-8021',
        message: 'Your Wi-Fi complaint for Hostel Block B has been assigned to Engineer K. Murthy and is currently IN PROGRESS.',
        type: 'COMPLAINT',
        isRead: false,
        link: '/student/complaints',
      },
      {
        userId: studentUser.id,
        title: 'Academic Alert: Attendance Notice',
        message: 'Your attendance in CS204 (Computer Networks) is currently 70.0%. Please consult your course instructor.',
        type: 'ACADEMIC',
        isRead: false,
        link: '/student/academics',
      },
      {
        userId: studentUser.id,
        title: 'Midterm Timetable Published',
        message: 'Midterm Examination Schedule for Spring 2025 is now available in the Document Center.',
        type: 'NOTICE',
        isRead: true,
        link: '/student/notices',
      },
    ],
  });

  // 15. Admin Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        userName: 'Prof. Rajesh Verma',
        role: 'ADMIN',
        action: 'DOCUMENT_UPLOAD',
        entity: 'KnowledgeDocument',
        details: 'Uploaded "University_Attendance_Policy_2024_25.pdf" to Academic category and generated 3 semantic chunks.',
      },
      {
        userId: adminUser.id,
        userName: 'Prof. Rajesh Verma',
        role: 'ADMIN',
        action: 'COMPLAINT_STATUS_UPDATE',
        entity: 'Complaint',
        details: 'Updated ticket #CIQ-7940 from IN_PROGRESS to RESOLVED with technician resolution notes.',
      },
      {
        userId: facultyUser.id,
        userName: 'Dr. Sunita Rao',
        role: 'FACULTY',
        action: 'MARKS_PUBLISHED',
        entity: 'Assessment',
        details: 'Published Midterm Examination scores for CS201 Data Structures & Algorithms (45 students).',
      },
    ],
  });

  console.log('✅ Seeding completed successfully!');
  console.log('Demo Accounts:');
  console.log('  Student: student@campusiq.edu / student123 (Aarav Sharma - Roll: CSE-2023-042)');
  console.log('  Faculty: faculty@campusiq.edu / faculty123 (Dr. Sunita Rao - Assoc. Professor)');
  console.log('  Admin:   admin@campusiq.edu   / admin123   (Prof. Rajesh Verma - Dean)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
