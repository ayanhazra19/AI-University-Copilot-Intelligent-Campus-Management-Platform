import { PrismaClient } from '@prisma/client';
import { createEmbedding, serializeEmbedding, deserializeEmbedding } from '../src/server/ai/embeddings';

const prisma = new PrismaClient();

interface PolicyDocData {
  title: string;
  fileName: string;
  fileType: string;
  department: string;
  category: string;
  summary: string;
  chunks: Array<{
    chunkIndex: number;
    pageNumber: number;
    keywords: string;
    content: string;
  }>;
}

const UNIVERSITY_POLICY_CORPUS: PolicyDocData[] = [
  {
    title: 'University Attendance Policy & Regulations (2024-2025)',
    fileName: 'University_Attendance_Policy_2024_25.pdf',
    fileType: 'PDF',
    department: 'Academic Affairs',
    category: 'Academic',
    summary: 'Comprehensive guidelines on mandatory 75% attendance criteria, medical condonation allowances, detention rules, and leave application procedures.',
    chunks: [
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
    ],
  },
  {
    title: 'Academic Regulations, Grading Scheme & Examination Rules',
    fileName: 'Academic_Regulations_and_Grading_System.pdf',
    fileType: 'PDF',
    department: 'Examination Cell',
    category: 'Examination',
    summary: 'Rules governing the 10-point CGPA grading system, pass criteria, re-evaluation timelines, and remedial exam schedules.',
    chunks: [
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
    ],
  },
  {
    title: 'Hostel Resident Code of Conduct & Facilities Manual',
    fileName: 'Hostel_Rules_and_Discipline_Code.pdf',
    fileType: 'PDF',
    department: 'Hostel Administration',
    category: 'Hostel',
    summary: 'Hostel curfew timings, night out pass protocols, visitor policies, room maintenance standards, and anti-ragging mandates.',
    chunks: [
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
    ],
  },
  {
    title: 'Student Grievance Redressal & Complaint Charter',
    fileName: 'Student_Grievance_and_Complaint_Charter.pdf',
    fileType: 'PDF',
    department: 'Dean of Student Welfare',
    category: 'Administration',
    summary: 'Service level agreements (SLAs), escalation matrix, automated routing rules, and appeal procedures for all student grievances.',
    chunks: [
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
    ],
  },
  {
    title: 'Central Library Usage Guidelines & Digital Resource Policy',
    fileName: 'Central_Library_Regulations_2025.pdf',
    fileType: 'PDF',
    department: 'Central Library',
    category: 'Library',
    summary: 'Borrowing allowances, overdue fines, digital journal access via IEEE/ACM, silent study pods, and RFID locker usage.',
    chunks: [
      {
        chunkIndex: 0,
        pageNumber: 2,
        keywords: 'library borrowing, book limit, loan period, renewal, overdue fine',
        content: 'Section 2: Book Borrowing Privileges & Fines\nUndergraduate students may borrow up to 4 books simultaneously for a loan period of 14 calendar days. Postgraduate students may borrow up to 6 books for 21 calendar days. Renewals can be completed online via CampusIQ twice unless a hold has been placed by another student. Overdue fines accrue at $0.50 (INR 10) per day per volume.',
      },
      {
        chunkIndex: 1,
        pageNumber: 4,
        keywords: 'digital library, IEEE Xplore, ACM digital library, remote access, VPN',
        content: 'Section 4: Remote Access to Research Repositories\nAll registered students and faculty have 24/7 authenticated remote access to IEEE Xplore, ScienceDirect, ACM Digital Library, and Springer journals. Access is automatically provisioned using university email single sign-on (SSO) credentials without requiring an on-campus VPN connection.',
      },
    ],
  },
  {
    title: 'Campus IT Acceptable Use, Wi-Fi & Cyber Safety Policy',
    fileName: 'Campus_IT_Acceptable_Use_Policy.pdf',
    fileType: 'PDF',
    department: 'IT Services',
    category: 'IT / Internet',
    summary: 'Guidelines on campus Wi-Fi access, bandwidth allocation, prohibited activities, and incident reporting.',
    chunks: [
      {
        chunkIndex: 0,
        pageNumber: 1,
        keywords: 'wifi, bandwidth, quota, devices, mac address, student login',
        content: 'Section 1: Campus Network Access & Quotas\nEach student is allocated a high-speed data quota of 15 GB per day across campus access points. A maximum of 2 concurrent devices (e.g. laptop and smartphone) may be authenticated per student ID. Network access is automatically reset at midnight. Bandwidth throttling is applied only after daily limits are exceeded.',
      },
      {
        chunkIndex: 1,
        pageNumber: 3,
        keywords: 'it security, torrents, crypto mining, cyber safety, disciplinary',
        content: 'Section 3: Prohibited Network Activities\nPeer-to-peer file sharing (BitTorrent), cryptocurrency mining, unauthorized port scanning, and host penetration testing are strictly prohibited on the university network. Violations trigger automatic MAC address quarantine and disciplinary referral to the Cyber Safety Committee.',
      },
    ],
  },
];

async function main() {
  const forceReembed = process.argv.includes('--force');
  console.log('📚 Starting Idempotent Knowledge Base Ingestion Pipeline...');
  if (forceReembed) {
    console.log('⚠️  --force flag detected: Will re-embed all document chunks.');
  }

  let totalDocsProcessed = 0;
  let totalChunksEmbedded = 0;
  let totalChunksSkipped = 0;

  for (const docData of UNIVERSITY_POLICY_CORPUS) {
    // 1. Find or create KnowledgeDocument
    let doc = await prisma.knowledgeDocument.findFirst({
      where: { fileName: docData.fileName },
      include: { chunks: true },
    });

    if (!doc) {
      doc = await prisma.knowledgeDocument.create({
        data: {
          title: docData.title,
          fileName: docData.fileName,
          fileType: docData.fileType,
          department: docData.department,
          category: docData.category,
          fileSize: 400000,
          processingStatus: 'PROCESSED',
          chunkCount: docData.chunks.length,
          summary: docData.summary,
        },
        include: { chunks: true },
      });
      console.log(`📄 Created document record: "${doc.title}"`);
    } else {
      // Update metadata and summary if changed
      await prisma.knowledgeDocument.update({
        where: { id: doc.id },
        data: {
          title: docData.title,
          department: docData.department,
          category: docData.category,
          chunkCount: docData.chunks.length,
          summary: docData.summary,
        },
      });
    }

    totalDocsProcessed++;

    // 2. Process chunks with Gate 4 Idempotency Check
    for (const chunkItem of docData.chunks) {
      const existingChunk = await prisma.documentChunk.findFirst({
        where: {
          documentId: doc.id,
          chunkIndex: chunkItem.chunkIndex,
        },
      });

      const existingEmbedding = deserializeEmbedding(existingChunk?.embeddingJson);
      const isAlreadyEmbedded = !forceReembed && existingEmbedding && existingEmbedding.length > 0;

      if (isAlreadyEmbedded) {
        totalChunksSkipped++;
        // Content/keywords update if needed without burning API quota
        if (existingChunk) {
          await prisma.documentChunk.update({
            where: { id: existingChunk.id },
            data: {
              content: chunkItem.content,
              keywords: chunkItem.keywords,
              pageNumber: chunkItem.pageNumber,
            },
          });
        }
        continue;
      }

      // Generate embedding (Gemini text-embedding-004 or local fallback)
      const embedding = await createEmbedding(
        `${chunkItem.content} ${chunkItem.keywords} ${doc.title}`
      );
      const serialized = serializeEmbedding(embedding);

      if (existingChunk) {
        await prisma.documentChunk.update({
          where: { id: existingChunk.id },
          data: {
            content: chunkItem.content,
            keywords: chunkItem.keywords,
            pageNumber: chunkItem.pageNumber,
            embeddingJson: serialized,
          },
        });
        console.log(`  ⚡ Updated embedding for chunk [${chunkItem.chunkIndex}] of "${doc.title}"`);
      } else {
        await prisma.documentChunk.create({
          data: {
            documentId: doc.id,
            chunkIndex: chunkItem.chunkIndex,
            pageNumber: chunkItem.pageNumber,
            keywords: chunkItem.keywords,
            content: chunkItem.content,
            embeddingJson: serialized,
          },
        });
        console.log(`  ➕ Created & embedded chunk [${chunkItem.chunkIndex}] of "${doc.title}"`);
      }

      totalChunksEmbedded++;
    }
  }

  console.log('\n=============================================================');
  console.log('🎉 Document Ingestion Complete!');
  console.log(`   Documents Processed : ${totalDocsProcessed}`);
  console.log(`   Chunks Embedded     : ${totalChunksEmbedded}`);
  console.log(`   Chunks Skipped (Cached) : ${totalChunksSkipped}`);
  console.log('=============================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Ingestion failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
