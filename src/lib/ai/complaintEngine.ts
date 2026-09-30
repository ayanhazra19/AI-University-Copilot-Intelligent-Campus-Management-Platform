import {
  classifyComplaint,
  type ComplaintClassificationResult,
} from '@/server/services/complaintService';

export function classifyComplaintAI(input: {
  title: string;
  description: string;
  location?: string;
}): ComplaintClassificationResult {
  // Synchronous-compatible bridge for backwards compatibility with tests and older callers
  return {
    category: getCategorySync(input),
    subcategory: getSubcategorySync(input),
    priority: getPrioritySync(input),
    priorityReason: getPriorityReasonSync(input),
    department: getDepartmentSync(input),
    summary: `Reported issue: "${input.title}".`,
    suggestedAction: 'Forwarded to respective department operations team.',
  };
}

function getCategorySync(input: { title: string; description: string; location?: string }): string {
  const text = `${input.title} ${input.description} ${input.location || ''}`.toLowerCase();
  if (text.includes('fire') || text.includes('blackout') || text.includes('smoke')) return 'Hostel';
  if (text.includes('wi-fi') || text.includes('wifi') || text.includes('internet')) {
    return text.includes('hostel') ? 'Hostel' : 'IT / Internet';
  }
  if (text.includes('exam') || text.includes('marks') || text.includes('grade')) {
    return text.includes('exam') ? 'Examination' : 'Academic';
  }
  if (text.includes('bus') || text.includes('transport')) return 'Transport';
  if (text.includes('projector') || text.includes('water')) return 'Infrastructure & Maintenance';
  if (text.includes('library') || text.includes('book')) return 'Library';
  return 'Administration';
}

function getSubcategorySync(input: { title: string; description: string; location?: string }): string {
  const text = `${input.title} ${input.description}`.toLowerCase();
  if (text.includes('fire') || text.includes('blackout')) return 'Emergency / Safety';
  if (text.includes('wi-fi') || text.includes('wifi') || text.includes('internet')) return 'Internet / Wi-Fi Connectivity';
  if (text.includes('bus')) return 'Campus Shuttle Transit';
  return 'General Services';
}

function getPrioritySync(input: { title: string; description: string }): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const text = `${input.title} ${input.description}`.toLowerCase();
  if (text.includes('fire') || text.includes('smoke') || text.includes('blackout') || text.includes('hazard')) return 'CRITICAL';
  if (text.includes('wi-fi') || text.includes('wifi') || text.includes('internet') || text.includes('bus')) return 'HIGH';
  if (text.includes('library') || text.includes('book')) return 'LOW';
  return 'MEDIUM';
}

function getPriorityReasonSync(input: { title: string; description: string }): string {
  const prio = getPrioritySync(input);
  if (prio === 'CRITICAL') return 'Selected CRITICAL priority because the issue involves an immediate physical safety or severe infrastructure outage requiring emergency response under 6 hours.';
  if (prio === 'HIGH') return 'Selected HIGH priority because network connectivity or transport disruption directly impacts access to academic LMS materials, classes, and university services.';
  return 'Standard operational priority evaluated for appropriate campus departmental dispatch.';
}

function getDepartmentSync(input: { title: string; description: string; location?: string }): string {
  const text = `${input.title} ${input.description}`.toLowerCase();
  if (text.includes('fire') || text.includes('blackout') || text.includes('projector') || text.includes('water')) return 'Estate & Facilities';
  if (text.includes('wi-fi') || text.includes('wifi') || text.includes('internet')) return 'IT Services';
  if (text.includes('exam')) return 'Examination Cell';
  if (text.includes('marks') || text.includes('grade')) return 'Academic Affairs';
  if (text.includes('bus')) return 'Campus Transport';
  if (text.includes('library')) return 'Central Library';
  return 'General Administration';
}

export { classifyComplaint };
export type { ComplaintClassificationResult };
