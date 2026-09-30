import { generateJSON, isGeminiAvailable } from '../ai/geminiClient';
import { ROUTER_SYSTEM_INSTRUCTION } from '../ai/prompts';
import { searchKnowledgeBase, RAGSourceCitation } from './knowledgeService';
import { analyzeStudentAcademics } from './academicService';
import { classifyComplaint } from './complaintService';
import { askCampusAnalytics } from './analyticsService';

export interface CopilotChatResponse {
  answer: string;
  queryCategory: 'UNIVERSITY_POLICY_RAG' | 'STUDENT_ACADEMIC' | 'COMPLAINT_ACTION' | 'CAMPUS_ANALYTICS' | 'GENERAL';
  sources?: RAGSourceCitation[];
  actionRecommendation?: {
    type: 'COMPLAINT_DRAFT' | 'ACADEMIC_VIEW' | 'DOCUMENT_VIEW';
    label: string;
    link: string;
    payload?: Record<string, any>;
  };
}

type IntentCategory = 'UNIVERSITY_POLICY_RAG' | 'STUDENT_ACADEMIC' | 'COMPLAINT_ACTION' | 'CAMPUS_ANALYTICS' | 'GENERAL';

/**
 * Keyword fallback intent classifier.
 */
function classifyIntentFallback(query: string): IntentCategory {
  const q = query.toLowerCase().trim();

  // Academic personal data
  if (
    q.includes('my attendance') ||
    q.includes('how is my attendance') ||
    q.includes('my marks') ||
    q.includes('my grades') ||
    q.includes('my gpa') ||
    q.includes('what should i focus on') ||
    q.includes('focus on academically') ||
    q.includes('my performance') ||
    q.includes('learning gap') ||
    q.includes('my subjects')
  ) {
    return 'STUDENT_ACADEMIC';
  }

  // Grievance action
  if (
    (q.includes('not working') ||
      q.includes('broken') ||
      q.includes('complaint') ||
      q.includes('grievance') ||
      q.includes('water leak') ||
      q.includes('no internet') ||
      q.includes('wifi issue') ||
      q.includes('flickering') ||
      q.includes('delay in bus')) &&
    !q.includes('policy') &&
    !q.includes('sla') &&
    !q.includes('how do i submit')
  ) {
    return 'COMPLAINT_ACTION';
  }

  // Campus Analytics
  if (
    q.includes('which department has') ||
    q.includes('most complaints') ||
    q.includes('unresolved complaints') ||
    q.includes('complaint trends') ||
    q.includes('monthly complaint summary') ||
    q.includes('campus analytics') ||
    q.includes('show attendance trends')
  ) {
    return 'CAMPUS_ANALYTICS';
  }

  return 'UNIVERSITY_POLICY_RAG';
}

/**
 * Classifies query intent using Gemini with keyword fallback.
 */
async function classifyIntent(query: string): Promise<IntentCategory> {
  const fallback = classifyIntentFallback(query);

  if (!isGeminiAvailable()) {
    return fallback;
  }

  try {
    const prompt = `USER QUERY: "${query}"`;
    const result = await generateJSON<{ category: IntentCategory; confidence: number }>({
      prompt,
      systemInstruction: ROUTER_SYSTEM_INSTRUCTION,
      temperature: 0.0,
    });

    if (result && result.category) {
      return result.category;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export async function processCopilotQuery(params: {
  query: string;
  userRole: 'STUDENT' | 'FACULTY' | 'ADMIN';
  studentProfileId?: string;
}): Promise<CopilotChatResponse> {
  const { query, userRole, studentProfileId } = params;
  const intent = await classifyIntent(query);

  // 1. Student Academic Intent
  if (intent === 'STUDENT_ACADEMIC' && studentProfileId) {
    try {
      const analysis = await analyzeStudentAcademics(studentProfileId);
      const q = query.toLowerCase();

      let answer = `Here is your current **Academic Performance & Learning Analysis**:\n\n`;
      answer += `- **Current Cumulative GPA:** ${analysis.overallGpa} / 4.0\n`;
      answer += `- **Overall Attendance:** **${analysis.overallAttendancePercentage}%** across ${analysis.totalCourses} enrolled subjects.\n\n`;

      if (q.includes('attendance') || q.includes('how is my attendance')) {
        answer += `### Course Attendance Breakdown:\n`;
        analysis.courseBreakdown.forEach((c) => {
          const statusIcon = c.status === 'ATTENTION_NEEDED' ? '⚠️' : '✅';
          answer += `- ${statusIcon} **${c.name} (${c.code}):** ${c.attendancePct}% (${c.attended}/${c.total} classes)${c.attendancePct < 75 ? ' — *Below 75% threshold!*' : ''}\n`;
        });
        if (analysis.earlyAlerts.length > 0) {
          answer += `\n> **Notice:** ${analysis.earlyAlerts[0].message}`;
        }
      } else {
        answer += `### 💡 Strong Areas:\n`;
        analysis.strongAreas.forEach((s) => {
          answer += `- **${s.subject}:** ${s.topic} — ${s.rationale}\n`;
        });

        if (analysis.learningGaps.length > 0) {
          answer += `\n### 🎯 Recommended Academic Focus & Learning Gaps:\n`;
          analysis.learningGaps.forEach((g) => {
            answer += `- **${g.subject} (${g.topic}):**\n  - *Observation:* ${g.rationale}\n  - *Action Plan:* **${g.recommendedAction}**\n`;
          });
        }

        if (analysis.earlyAlerts.length > 0) {
          answer += `\n> ⚠️ **Academic Alert:** ${analysis.earlyAlerts[0].message}`;
        }
      }

      return {
        answer,
        queryCategory: 'STUDENT_ACADEMIC',
        actionRecommendation: {
          type: 'ACADEMIC_VIEW',
          label: 'View Detailed Academic Dashboard',
          link: '/student/academics',
        },
      };
    } catch (err) {
      console.error('Error fetching academic data:', err);
    }
  }

  // 2. Complaint Action Intent
  if (intent === 'COMPLAINT_ACTION') {
    const classification = await classifyComplaint({
      title: query,
      description: query,
    });

    const answer = `I've analyzed your issue and prepared an automated complaint draft for you:\n\n- **Category:** ${classification.category}\n- **Subcategory:** ${classification.subcategory}\n- **Assigned Department:** **${classification.department}**\n- **Assigned Priority:** **${classification.priority}**\n- **Priority Reason:** ${classification.priorityReason}\n- **Summary:** *"${classification.summary}"*\n\nWould you like me to submit this ticket now to **${classification.department}**? Click below to proceed to the complaint submission form with pre-filled details.`;

    return {
      answer,
      queryCategory: 'COMPLAINT_ACTION',
      actionRecommendation: {
        type: 'COMPLAINT_DRAFT',
        label: 'Open Complaint with AI Pre-Fill',
        link: `/student/complaints?title=${encodeURIComponent(query)}&category=${encodeURIComponent(classification.category)}&priority=${encodeURIComponent(classification.priority)}&department=${encodeURIComponent(classification.department)}`,
        payload: classification,
      },
    };
  }

  // 3. Campus Analytics Intent
  if (intent === 'CAMPUS_ANALYTICS') {
    const analytics = await askCampusAnalytics(query);
    let answer = `${analytics.summary}\n\n### Key Highlights:\n`;
    analytics.insights.forEach((insight) => {
      answer += `- ${insight}\n`;
    });

    // Condition 1: /faculty/analytics now exists and is served under faculty workspace
    const analyticsLink = userRole === 'ADMIN' ? '/admin/analytics' : '/faculty/analytics';

    return {
      answer,
      queryCategory: 'CAMPUS_ANALYTICS',
      actionRecommendation: {
        type: 'DOCUMENT_VIEW',
        label: 'View Campus Analytics Dashboard',
        link: analyticsLink,
      },
    };
  }

  // 4. Default: Grounded University RAG
  const ragResult = await searchKnowledgeBase(query);

  return {
    answer: ragResult.answer,
    queryCategory: 'UNIVERSITY_POLICY_RAG',
    sources: ragResult.sources,
  };
}
