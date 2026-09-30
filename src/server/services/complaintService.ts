import { prisma } from '@/lib/prisma';
import { generateJSON, isGeminiAvailable } from '../ai/geminiClient';
import { COMPLAINT_CLASSIFIER_SYSTEM_INSTRUCTION } from '../ai/prompts';
import { createNotification } from './notificationService';
import { recordAuditLog } from './auditService';

export interface ComplaintClassificationResult {
  category: string;
  subcategory: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  priorityReason: string;
  department: string;
  summary: string;
  suggestedAction: string;
}

/**
 * Deterministic offline rule fallback for complaint classification.
 */
function classifyComplaintFallback(input: {
  title: string;
  description: string;
  location?: string;
}): ComplaintClassificationResult {
  const text = `${input.title} ${input.description} ${input.location || ''}`.toLowerCase();

  // 1. Critical safety / total outage checks
  if (
    text.includes('fire') ||
    text.includes('smoke') ||
    text.includes('shock') ||
    text.includes('blackout') ||
    text.includes('gas leak') ||
    text.includes('flooding') ||
    text.includes('emergency') ||
    text.includes('hazard')
  ) {
    return {
      category: 'Hostel',
      subcategory: 'Emergency / Safety',
      priority: 'CRITICAL',
      priorityReason: 'Selected CRITICAL priority because the issue involves an immediate physical safety or severe infrastructure outage requiring emergency response under 6 hours.',
      department: 'Estate & Facilities',
      summary: `Critical emergency reported: "${input.title}". Immediate facility dispatch initiated.`,
      suggestedAction: 'Immediate notification dispatched to Campus Safety and Facilities Rapid Response Team.',
    };
  }

  // 2. Wi-Fi / Internet / IT issues
  if (
    text.includes('wi-fi') ||
    text.includes('wifi') ||
    text.includes('internet') ||
    text.includes('network') ||
    text.includes('router') ||
    text.includes('lan') ||
    text.includes('ethernet') ||
    text.includes('lms') ||
    text.includes('portal')
  ) {
    const isHostel = text.includes('hostel') || text.includes('block') || text.includes('room');
    return {
      category: isHostel ? 'Hostel' : 'IT / Internet',
      subcategory: 'Internet / Wi-Fi Connectivity',
      priority: 'HIGH',
      priorityReason: 'Selected HIGH priority because network connectivity disruption directly impacts access to academic LMS materials, online assignments, and university services.',
      department: 'IT Services',
      summary: `Network connectivity failure reported at ${input.location || 'campus facility'}: "${input.title}".`,
      suggestedAction: 'Network Operations technician assigned for AP diagnostics and switch port verification.',
    };
  }

  // 3. Academic / Marks / Exams
  if (
    text.includes('marks') ||
    text.includes('exam') ||
    text.includes('grade') ||
    text.includes('transcript') ||
    text.includes('discrepancy') ||
    text.includes('score') ||
    text.includes('quiz') ||
    text.includes('hall ticket')
  ) {
    const isExam = text.includes('hall ticket') || text.includes('schedule') || text.includes('re-evaluation');
    return {
      category: isExam ? 'Examination' : 'Academic',
      subcategory: isExam ? 'Examination Administration' : 'Grade & Assessment Review',
      priority: isExam ? 'HIGH' : 'MEDIUM',
      priorityReason: isExam
        ? 'High priority due to proximity to official examination deadlines.'
        : 'Medium priority: Standard academic verification required with course instructor and department ledger.',
      department: isExam ? 'Examination Cell' : 'Academic Affairs',
      summary: `Academic grievance regarding assessment/examination records: "${input.title}".`,
      suggestedAction: 'Ticket queued for Course Faculty verification and Examination Controller records audit.',
    };
  }

  // 4. Transport
  if (
    text.includes('bus') ||
    text.includes('shuttle') ||
    text.includes('transport') ||
    text.includes('route') ||
    text.includes('driver')
  ) {
    return {
      category: 'Transport',
      subcategory: 'Campus Shuttle Transit',
      priority: 'HIGH',
      priorityReason: 'High priority because bus timing or route failures directly induce student attendance delays and safety risks.',
      department: 'Campus Transport',
      summary: `Campus transport schedule or operational failure reported: "${input.title}".`,
      suggestedAction: 'Forwarded to Transport In-Charge for fleet route tracking and driver shift inspection.',
    };
  }

  // 5. Infrastructure / Classroom AV / Projector / Water / AC
  if (
    text.includes('projector') ||
    text.includes('classroom') ||
    text.includes('speaker') ||
    text.includes('ac') ||
    text.includes('air condition') ||
    text.includes('water') ||
    text.includes('fan') ||
    text.includes('light') ||
    text.includes('bench') ||
    text.includes('desk')
  ) {
    return {
      category: 'Infrastructure & Maintenance',
      subcategory: text.includes('projector') || text.includes('speaker') ? 'Classroom AV Equipment' : 'Civil & Electrical Maintenance',
      priority: 'MEDIUM',
      priorityReason: 'Medium priority: Affects classroom or facility comfort, with alternative facilities available in the interim.',
      department: 'Estate & Facilities',
      summary: `Facility maintenance defect reported at ${input.location || 'campus premises'}: "${input.title}".`,
      suggestedAction: 'Work order generated for technician site inspection within 24 hours.',
    };
  }

  // 6. Library
  if (text.includes('library') || text.includes('book') || text.includes('journal') || text.includes('rfid')) {
    return {
      category: 'Library',
      subcategory: 'Library Services & Resources',
      priority: 'LOW',
      priorityReason: 'Low priority: Standard resource cataloging or facility inquiry with negligible academic disruption.',
      department: 'Central Library',
      summary: `Library resource request or minor maintenance inquiry: "${input.title}".`,
      suggestedAction: 'Logged with Chief Librarian desk for catalog and equipment follow-up.',
    };
  }

  // 7. General Fallback
  return {
    category: 'Administration',
    subcategory: 'General Campus Services',
    priority: 'MEDIUM',
    priorityReason: 'Medium priority: General administrative query requiring departmental dispatch.',
    department: 'General Administration',
    summary: `Student submitted campus query: "${input.title}".`,
    suggestedAction: 'Routed to Central Campus Administrative Desk for review.',
  };
}

/**
 * Intelligent complaint triage using Gemini 2.5 Flash with fallback.
 */
export async function classifyComplaint(input: {
  title: string;
  description: string;
  location?: string;
}): Promise<ComplaintClassificationResult> {
  const fallback = classifyComplaintFallback(input);

  if (!isGeminiAvailable()) {
    return fallback;
  }

  try {
    const prompt = `COMPLAINT DETAILS:\nTitle: ${input.title}\nDescription: ${input.description}\nLocation: ${input.location || 'Campus premises'}`;
    const result = await generateJSON<ComplaintClassificationResult>({
      prompt,
      systemInstruction: COMPLAINT_CLASSIFIER_SYSTEM_INSTRUCTION,
      temperature: 0.1,
    });

    if (result && result.category && result.priority && result.department) {
      return {
        category: result.category,
        subcategory: result.subcategory || fallback.subcategory,
        priority: result.priority,
        priorityReason: result.priorityReason || fallback.priorityReason,
        department: result.department,
        summary: result.summary || fallback.summary,
        suggestedAction: result.suggestedAction || fallback.suggestedAction,
      };
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export async function listComplaints(filters: {
  department?: string | null;
  status?: string | null;
  priority?: string | null;
  category?: string | null;
  studentId?: string | null;
}) {
  const where: any = {};
  if (filters.department && filters.department !== 'ALL') where.department = filters.department;
  if (filters.status && filters.status !== 'ALL') where.status = filters.status;
  if (filters.priority && filters.priority !== 'ALL') where.priority = filters.priority;
  if (filters.category && filters.category !== 'ALL') where.category = filters.category;
  if (filters.studentId) where.studentId = filters.studentId;

  const [complaints, categories] = await Promise.all([
    prisma.complaint.findMany({
      where,
      include: {
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.complaintCategory.findMany({
      where: { isActive: true },
    }),
  ]);

  return { complaints, categories };
}

export async function createComplaint(
  input: {
    title: string;
    description: string;
    location?: string;
    category?: string;
    subcategory?: string;
    priority?: string;
    department?: string;
  },
  user: { id: string; name: string; role: string; studentId?: string }
) {
  // 1. Triage with AI (or fallback)
  const classification = await classifyComplaint({
    title: input.title,
    description: input.description,
    location: input.location,
  });

  // Determine student ID
  let studentId = user.studentId;
  let studentName = user.name;
  if (!studentId) {
    const firstStudent = await prisma.studentProfile.findFirst({
      include: { user: true },
    });
    studentId = firstStudent?.id || user.id;
    studentName = firstStudent?.user?.name || user.name;
  }

  const randomTicketSuffix = Math.floor(1000 + Math.random() * 9000);
  const ticketNumber = `CIQ-${randomTicketSuffix}`;

  const finalCategory = input.category || classification.category;
  const finalSubcategory = input.subcategory || classification.subcategory;
  const finalPriority = (input.priority || classification.priority) as any;
  const finalDepartment = input.department || classification.department;

  const complaint = await prisma.complaint.create({
    data: {
      ticketNumber,
      studentId,
      studentName,
      title: input.title,
      description: input.description,
      location: input.location || 'Main Campus',
      category: finalCategory,
      subcategory: finalSubcategory,
      priority: finalPriority,
      department: finalDepartment,
      status: 'SUBMITTED',
      aiSummary: classification.summary,
      aiPriorityReason: classification.priorityReason,
      statusHistory: {
        create: [
          {
            fromStatus: 'NONE',
            toStatus: 'SUBMITTED',
            changedBy: `${studentName} (${user.role})`,
            note: 'Complaint registered and triaged via CampusIQ AI Classification.',
          },
        ],
      },
    },
    include: {
      statusHistory: true,
    },
  });

  // Notify student
  await createNotification({
    userId: user.id,
    title: `Ticket Created: ${complaint.ticketNumber}`,
    message: `Your grievance has been auto-assigned to ${complaint.department} with ${complaint.priority} priority.`,
    type: 'COMPLAINT',
    link: '/student/complaints',
  });

  // Audit log
  await recordAuditLog({
    userId: user.id,
    userName: user.name,
    role: user.role,
    action: 'COMPLAINT_CREATED',
    entity: 'Complaint',
    details: `Created ticket ${complaint.ticketNumber} [${complaint.category} -> ${complaint.department} (${complaint.priority})]`,
  });

  return { complaint, classification };
}

export async function updateComplaintStatus(
  id: string,
  updateData: {
    status: string;
    note?: string;
    assignedTo?: string;
    resolutionNote?: string;
  },
  user: { id: string; name: string; role: string }
) {
  const existingComplaint = await prisma.complaint.findUnique({
    where: { id },
    include: { student: { include: { user: true } } },
  });

  if (!existingComplaint) {
    throw new Error('Complaint not found');
  }

  const updated = await prisma.complaint.update({
    where: { id },
    data: {
      status: updateData.status,
      assignedTo: updateData.assignedTo ?? existingComplaint.assignedTo,
      resolutionNote: updateData.resolutionNote ?? existingComplaint.resolutionNote,
      statusHistory: {
        create: {
          fromStatus: existingComplaint.status,
          toStatus: updateData.status,
          changedBy: `${user.name} (${user.role})`,
          note: updateData.note || `Status progressed to ${updateData.status}`,
        },
      },
    },
    include: {
      statusHistory: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  // Notify student
  if (existingComplaint.student?.userId) {
    await createNotification({
      userId: existingComplaint.student.userId,
      title: `Status Update: ${existingComplaint.ticketNumber}`,
      message: `Your grievance status was changed to "${updateData.status}" by ${user.name}. ${updateData.note ? `Note: ${updateData.note}` : ''}`,
      type: 'COMPLAINT',
      link: '/student/complaints',
    });
  }

  // Record audit log
  await recordAuditLog({
    userId: user.id,
    userName: user.name,
    role: user.role,
    action: 'COMPLAINT_STATUS_UPDATE',
    entity: 'Complaint',
    details: `Updated ${existingComplaint.ticketNumber} from ${existingComplaint.status} to ${updateData.status}. Note: ${updateData.note || 'N/A'}`,
  });

  return updated;
}
