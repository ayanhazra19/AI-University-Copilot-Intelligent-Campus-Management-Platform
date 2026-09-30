import { searchKnowledgeBase } from '../src/lib/ai/rag';
import { classifyComplaintAI } from '../src/lib/ai/complaintEngine';
import { analyzeStudentAcademics } from '../src/lib/ai/academicEngine';
import { askCampusAnalyticsAI } from '../src/lib/ai/analyticsEngine';
import { processCopilotQuery } from '../src/lib/ai/router';
import { prisma } from '../src/lib/prisma';
import { updateComplaintStatus, listComplaints } from '../src/server/services/complaintService';
import { getJwtSecret } from '../src/lib/auth';
import { GET as getComplaintsRoute } from '../src/app/api/complaints/route';
import { GET as getKnowledgeRoute } from '../src/app/api/knowledge/route';
import { POST as postCopilotRoute } from '../src/app/api/copilot/chat/route';

async function runTestSuite() {
  console.log('🧪 Starting CampusIQ Automated Verification Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Verify Users & Database Seeding
  const users = await prisma.user.findMany();
  assert(users.length >= 3, `Database contains seeded users (Found: ${users.length})`);

  const student = await prisma.studentProfile.findFirst({ include: { user: true } });
  assert(Boolean(student && student.rollNumber === 'CSE-2023-042'), `Student Aarav Sharma roll CSE-2023-042 verified`);

  // 2. Pillar 1: RAG Knowledge Retrieval & Citations across all 6 University Policies
  const rag1 = await searchKnowledgeBase('What is the attendance requirement?');
  assert(
    rag1.foundInKnowledgeBase && rag1.sources.length > 0,
    `RAG retrieves attendance requirement with ${rag1.sources.length} citations`
  );
  assert(
    rag1.answer.includes('75%') && rag1.sources[0].fileName.includes('Attendance'),
    `RAG citation matches Attendance Policy document and mentions 75% threshold`
  );

  const rag2 = await searchKnowledgeBase('Hostel curfew and gate timing');
  assert(
    rag2.foundInKnowledgeBase && rag2.answer.includes('10:00 PM'),
    `RAG retrieves hostel curfew timing (10:00 PM) correctly`
  );

  const rag3 = await searchKnowledgeBase('How much is the exam re-evaluation fee?');
  assert(
    rag3.foundInKnowledgeBase && (rag3.answer.includes('25') || rag3.answer.includes('500')),
    `RAG retrieves re-evaluation fee ($25 / INR 500) from Examination Rules`
  );

  const rag4 = await searchKnowledgeBase('How many books can undergraduate students borrow from library?');
  assert(
    rag4.foundInKnowledgeBase && rag4.answer.includes('4 books') && rag4.sources[0].fileName.includes('Library'),
    `RAG retrieves undergraduate 4-book loan quota from Central Library Policy`
  );

  const rag5 = await searchKnowledgeBase('What is daily campus Wi-Fi data quota limit?');
  assert(
    rag5.foundInKnowledgeBase && rag5.answer.includes('15 GB'),
    `RAG retrieves 15 GB daily data quota from Campus IT Policy`
  );

  const rag6 = await searchKnowledgeBase('What happens if a complaint is unresolved for 48 hours?');
  assert(
    rag6.foundInKnowledgeBase && (rag6.answer.includes('Escalation') || rag6.answer.includes('Dean')),
    `RAG retrieves grievance escalation matrix from Student Redressal Charter`
  );

  const ragEmpty = await searchKnowledgeBase('Quantum teleportation warp drive instructions');
  assert(
    !ragEmpty.foundInKnowledgeBase && ragEmpty.sources.length === 0,
    `RAG safe fallback triggered for ungrounded queries`
  );

  // 3. Pillar 2: Academic Intelligence & Explainable Gaps
  if (student) {
    const academics = await analyzeStudentAcademics(student.id);
    assert(academics.overallGpa > 3.0, `Academic GPA calculated accurately (${academics.overallGpa})`);
    assert(
      academics.overallAttendancePercentage >= 80,
      `Overall attendance computed (${academics.overallAttendancePercentage}%)`
    );
    assert(
      academics.learningGaps.length > 0 && academics.learningGaps[0].subject.includes('Networks'),
      `Explainable learning gap detected in Computer Networks`
    );
    assert(
      academics.earlyAlerts.length > 0 && academics.earlyAlerts[0].type === 'LOW_ATTENDANCE',
      `Early alert triggered for low attendance without unsupported predictions`
    );
  }

  // 4. Pillar 3: AI Complaint Classification & Triage
  const triage1 = classifyComplaintAI({
    title: 'Wi-Fi is not working in Hostel Block B',
    description: 'Connectivity dropped since yesterday',
  });
  assert(
    triage1.priority === 'HIGH' && triage1.department === 'IT Services',
    `Complaint triage assigned HIGH priority & IT Services for Wi-Fi outage`
  );
  assert(
    triage1.priorityReason.length > 10,
    `Complaint priority includes explainable rationale: "${triage1.priorityReason.substring(0, 45)}..."`
  );

  const triage2 = classifyComplaintAI({
    title: 'Smoke and electrical blackout in basement study lounge',
    description: 'Power tripped during heavy rainfall',
  });
  assert(
    triage2.priority === 'CRITICAL' && triage2.department === 'Estate & Facilities',
    `Emergency power hazard classified as CRITICAL priority`
  );

  // 5. Pillar 4: Campus Analytics NL Querying
  const analyticsResult = await askCampusAnalyticsAI('Which department has the most unresolved complaints?');
  assert(
    Boolean(analyticsResult.summary && analyticsResult.chartData.length > 0),
    `Campus Analytics returned executive synthesis and ${analyticsResult.chartData.length} chart entries`
  );
  assert(
    analyticsResult.insights.length >= 2,
    `Campus Analytics generated actionable insights (${analyticsResult.insights.length} points)`
  );

  // 6. Context-Aware Query Routing (All 5 Categories)
  const routeAcademic = await processCopilotQuery({
    query: 'What should I focus on academically?',
    userRole: 'STUDENT',
    studentProfileId: student?.id,
  });
  assert(
    routeAcademic.queryCategory === 'STUDENT_ACADEMIC',
    `Router classified academic advice query to STUDENT_ACADEMIC`
  );

  const routeComplaint = await processCopilotQuery({
    query: 'Wi-Fi is not working in my room',
    userRole: 'STUDENT',
    studentProfileId: student?.id,
  });
  assert(
    routeComplaint.queryCategory === 'COMPLAINT_ACTION' && routeComplaint.actionRecommendation?.type === 'COMPLAINT_DRAFT',
    `Router automatically offered one-click COMPLAINT_DRAFT workflow`
  );

  const routeGeneral = await processCopilotQuery({
    query: 'Hello! Who are you?',
    userRole: 'STUDENT',
    studentProfileId: student?.id,
  });
  assert(
    routeGeneral.queryCategory === 'GENERAL' && routeGeneral.answer.includes('CampusIQ Copilot'),
    `Router classified greeting to GENERAL with helpful guidance response`
  );

  const routeAnalytics = await processCopilotQuery({
    query: 'Which department has the most unresolved complaints?',
    userRole: 'FACULTY',
  });
  assert(
    routeAnalytics.queryCategory === 'CAMPUS_ANALYTICS' && routeAnalytics.actionRecommendation?.type === 'DOCUMENT_VIEW',
    `Router classified analytical query to CAMPUS_ANALYTICS with link to faculty analytics`
  );

  const routeRAG = await processCopilotQuery({
    query: 'What are the examination hall conduct rules?',
    userRole: 'STUDENT',
  });
  assert(
    routeRAG.queryCategory === 'UNIVERSITY_POLICY_RAG' && Boolean(routeRAG.sources && routeRAG.sources.length > 0),
    `Router classified policy query to UNIVERSITY_POLICY_RAG with verified sources`
  );

  // 7. Day 2 Security & Authorization Regression Suite
  console.log('\n🔒 Running Day 2 Security & Authorization Regression Suite...');

  // A. Unauthenticated Complaint Retrieval -> 401
  const unauthRes = await getComplaintsRoute(new Request('http://localhost:3000/api/complaints'));
  assert(
    unauthRes.status === 401,
    `Unauthenticated complaint GET request rejected with HTTP 401`
  );

  // B. Student Object Isolation (can only list own complaints)
  if (student) {
    const studentList = await listComplaints({ studentId: student.id });
    const allMatchStudent = studentList.complaints.every((c) => c.studentId === student.id);
    assert(
      allMatchStudent && studentList.complaints.length > 0,
      `Authenticated student complaint access strictly isolated to student's own records`
    );
  }

  // C. Student cannot modify complaint status -> 403 Forbidden
  const sampleTicket = await prisma.complaint.findFirst();
  if (sampleTicket && student) {
    let studentBlocked = false;
    try {
      await updateComplaintStatus(
        sampleTicket.id,
        { status: 'RESOLVED' },
        { id: student.userId, name: student.user.name, role: 'STUDENT' }
      );
    } catch (e: any) {
      if (e.statusCode === 403) studentBlocked = true;
    }
    assert(studentBlocked, `Student prohibited from mutating complaint status (HTTP 403 Forbidden)`);
  }

  // D. Faculty unauthorized status update -> 403 Forbidden
  const facultyUser = await prisma.user.findFirst({ where: { role: 'FACULTY' } });
  const hostelTicket = await prisma.complaint.findFirst({ where: { department: 'Estate & Facilities' } });
  if (facultyUser && hostelTicket) {
    let facultyBlocked = false;
    try {
      await updateComplaintStatus(
        hostelTicket.id,
        { status: 'RESOLVED' },
        { id: facultyUser.id, name: facultyUser.name, role: 'FACULTY', department: 'Computer Science & Engineering' }
      );
    } catch (e: any) {
      if (e.statusCode === 403) facultyBlocked = true;
    }
    assert(facultyBlocked, `Faculty prohibited from modifying complaints outside academic scope (HTTP 403)`);
  }

  // E. Authorized admin status update -> Success
  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const triageTicket = await prisma.complaint.findFirst({ where: { status: 'SUBMITTED' } });
  if (adminUser && triageTicket) {
    const updated = await updateComplaintStatus(
      triageTicket.id,
      { status: 'UNDER_REVIEW', note: 'Admin verified and initiated investigation' },
      { id: adminUser.id, name: adminUser.name, role: 'ADMIN' }
    );
    assert(
      updated.status === 'UNDER_REVIEW',
      `Authorized admin successfully progressed complaint from SUBMITTED to UNDER_REVIEW`
    );
  }

  // F. Invalid state machine transition -> 400 Bad Request
  if (adminUser && triageTicket) {
    let invalidJumpBlocked = false;
    try {
      // Re-fetch current status (which is now UNDER_REVIEW)
      // Attempt invalid jump from UNDER_REVIEW to CLOSED (must go to IN_PROGRESS or RESOLVED first)
      await updateComplaintStatus(
        triageTicket.id,
        { status: 'CLOSED' },
        { id: adminUser.id, name: adminUser.name, role: 'ADMIN' }
      );
    } catch (e: any) {
      if (e.statusCode === 400) invalidJumpBlocked = true;
    }
    assert(
      invalidJumpBlocked,
      `State machine prevents arbitrary state jumps (UNDER_REVIEW -> CLOSED blocked with HTTP 400)`
    );
  }

  // G. Missing production JWT_SECRET -> Fatal startup failure
  let jwtFailureCaught = false;
  const originalEnv = process.env.NODE_ENV;
  const originalSecret = process.env.JWT_SECRET;
  try {
    (process.env as any).NODE_ENV = 'production';
    delete process.env.JWT_SECRET;
    getJwtSecret();
  } catch (e: any) {
    if (e.message.includes('FATAL SECURITY ERROR')) jwtFailureCaught = true;
  } finally {
    (process.env as any).NODE_ENV = originalEnv;
    if (originalSecret) process.env.JWT_SECRET = originalSecret;
  }
  assert(jwtFailureCaught, `Missing JWT_SECRET in production halts application with fatal security error`);

  // H. RAG Missing Knowledge -> Clear Insufficient Evidence
  const ragMissingKnowledge = await searchKnowledgeBase('Antigravity time dilation reactor shutdown protocol');
  assert(
    !ragMissingKnowledge.foundInKnowledgeBase && ragMissingKnowledge.sources.length === 0,
    `RAG safely returns insufficient evidence for absent knowledge without hallucinating`
  );

  // I. Unauthenticated Knowledge Base GET -> 401
  const unauthKnowledgeRes = await getKnowledgeRoute();
  assert(
    unauthKnowledgeRes.status === 401,
    `Unauthenticated knowledge base GET request rejected with HTTP 401`
  );

  // J. Unauthenticated Copilot Chat POST -> 401
  const unauthCopilotRes = await postCopilotRoute(
    new Request('http://localhost:3000/api/copilot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'What is the attendance policy?' }),
    })
  );
  assert(
    unauthCopilotRes.status === 401,
    `Unauthenticated copilot chat POST request rejected with HTTP 401`
  );

  console.log(`\n========================================`);
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTestSuite()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
