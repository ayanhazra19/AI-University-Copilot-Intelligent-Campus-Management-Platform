# CampusIQ — Comprehensive Technical Architecture & Code Audit Report

**Date of Audit:** September 30, 2026  
**Auditor Role:** Senior Software Architect & Code Auditor  
**Scope:** Full repository technical audit for Galgotias University SparkX 3.0 International Challenge (Track 4: AI University Copilot & Intelligent Campus Management Platform).  
**Mode:** AUDIT ONLY (Zero feature modifications, zero destructive rewrites, zero migrations).

---

## 1. Executive Summary

CampusIQ is engineered as a unified, AI-first operating layer connecting Students, Faculty, and Administrators across university operations. The platform is built on Next.js 16 (App Router / Turbopack), TypeScript 5, Tailwind CSS v4, Prisma 6 ORM with SQLite, and the Google Gemini GenAI SDK (`@google/genai`).

### Primary Audit Findings:
1. **Runtime & Build Health:** The production build (`next build`) compiles cleanly (20/20 routes green, zero TypeScript compiler errors). The test suite executes 24 automated assertions covering RAG retrieval, academic calculation, complaint triage, and analytics synthesis. 
2. **AI Implementation Status:** Gemini integration is implemented with multi-model failover (`gemini-3.5-flash` &rarr; `gemini-3.1-flash-lite` &rarr; `gemini-flash-latest`) and fallback support. However, when dense embeddings (`gemini-embedding-2`) are active, the RAG similarity floor baseline (~0.43) causes ungrounded queries to occasionally score above the 20-point cutoff, failing strict negative fallback assertions unless thresholds are adjusted.
3. **Database & Metrics Integrity:** All fabricated placeholder metrics (such as the hardcoded 28.4 hours, 96% accuracy) have been eliminated from the active service and presentation layers. All analytics charts are derived strictly from database aggregations (`findMany`, `count`), with the LLM used strictly for synthesis and visualization selection.
4. **Security & RBAC:** Session management uses signed JWT cookies (`campusiq_token`). While admin endpoints (`/api/knowledge`, `/api/notices`) enforce strict `user.role === 'ADMIN'`, the complaint retrieval endpoint (`GET /api/complaints`) lacks an unauthenticated check, allowing anonymous callers to fetch all campus complaints. Furthermore, the complaint status update endpoint (`PUT /api/complaints/[id]/status`) lacks role-based validation, allowing any authenticated student to mutate complaint status.
5. **Competition Differentiation:** The application demonstrates strong technical differentiation in its grounded RAG with verifiable page citations, explainable topic-level academic gap diagnostics, and automated emergency complaint triage. However, several faculty screens (e.g. `/faculty/academics`) currently render static mock cards instead of live database cohort queries.

---

## 2. Current Architecture

```
                                  [ Browser / Client ]
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
                [ App Router Pages ]                 [ UI Components ]
             /student, /faculty, /admin           CopilotChat, Navbar, Sidebar
                        │                                     │
                        └──────────────────┬──────────────────┘
                                           ▼
                                   [ API Routes ]
                      /api/copilot/chat, /api/complaints, /api/academics,
                      /api/analytics, /api/knowledge, /api/notices
                                           │
                                           ▼
                                 [ Service Layer ]
                      copilotService.ts, academicService.ts,
                      complaintService.ts, analyticsService.ts,
                      knowledgeService.ts, authService.ts
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
                [ AI Subsystem ]                      [ Data Layer ]
            geminiClient.ts (Failover)              Prisma ORM Client
            retrieval.ts (Hybrid Search)                    │
            embeddings.ts (Cosine / FNV)                    ▼
            prompts.ts (Instructions)               SQLite Database (dev.db)
                        │
                        ▼
             [ Google Gemini API ]
      gemini-3.5-flash / gemini-3.1-flash-lite
            gemini-embedding-2
```

---

## 3. Repository Inventory

### 3.1 Application Routes & Pages
- `src/app/page.tsx`: Landing page with hero overview, 4 pillar highlights, and 1-click demo login buttons.
- `src/app/login/page.tsx`: Universal authentication page.
- `src/app/student/page.tsx`: Student dashboard (KPIs, active complaints, notices, quick copilot prompts).
- `src/app/student/academics/page.tsx`: Academic performance, GPA (3.72), subject attendance gauges with 75% threshold indicators, and learning gap recommendations.
- `src/app/student/complaints/page.tsx`: Grievance submission interface with real-time AI triage preview and active ticket tracking.
- `src/app/student/copilot/page.tsx`: Dedicated full-screen AI Copilot interface for policy and academic inquiries.
- `src/app/student/notices/page.tsx`: Categorized campus notices and announcements.
- `src/app/student/documents/page.tsx`: Searchable student policy handbook repository.
- `src/app/faculty/page.tsx`: Faculty dashboard (assigned courses, student attendance alerts).
- `src/app/faculty/academics/page.tsx`: Course cohort performance (currently static UI).
- `src/app/faculty/complaints/page.tsx`: Departmental complaint escalation view.
- `src/app/faculty/copilot/page.tsx`: Faculty assistant for institutional guidelines.
- `src/app/faculty/notices/page.tsx`: Faculty circulars and administrative alerts.
- `src/app/faculty/analytics/page.tsx`: Faculty analytics dashboard (renders admin analytics in faculty shell).
- `src/app/admin/page.tsx`: Executive campus control center (KPIs, active alerts, triage backlog).
- `src/app/admin/complaints/page.tsx`: Full administrative complaint triage board with status transition controls.
- `src/app/admin/analytics/page.tsx`: Natural language "Ask Campus Data" interface with Recharts visualizations and CSV export.
- `src/app/admin/knowledge/page.tsx`: Document ingestion, chunk inspection, and embedding management.
- `src/app/admin/audit/page.tsx`: System-wide immutable security audit log viewer.
- `src/app/admin/notices/page.tsx`: Notice creation and publishing management.

### 3.2 React Components
- `src/components/Navbar.tsx`: Global navigation header with role badge, notification popover, and instant persona switcher.
- `src/components/Sidebar.tsx`: Role-aware persistent sidebar navigation.
- `src/components/CopilotChat.tsx`: Conversational AI chat component with citation badges and action recommendations.
- `src/components/NotificationDrawer.tsx`: Flyout drawer for system, complaint, and academic alerts.
- `src/components/CommandPalette.tsx`: Global keyboard shortcut (`Cmd+K`) quick-navigation palette.
- `src/components/CampusLoginPage.tsx`: Tabbed login form supporting credentials and 1-click demo accounts.
- `src/components/DemoTourModal.tsx`: Interactive onboarding walkthrough modal for competition judges.

### 3.3 API Routes
- `src/app/api/auth/login/route.ts`: Password verification and JWT cookie issuance.
- `src/app/api/auth/demo-login/route.ts`: 1-click persona switching (Aarav, Dr. Priya, Dr. Rajesh).
- `src/app/api/auth/logout/route.ts`: Session cookie clearing.
- `src/app/api/auth/me/route.ts`: Returns current authenticated user profile.
- `src/app/api/copilot/chat/route.ts`: Conversational intent routing, RAG retrieval, and academic copilot synthesis.
- `src/app/api/complaints/route.ts`: List complaints with filters; create new complaints.
- `src/app/api/complaints/[id]/status/route.ts`: Transition complaint status (SUBMITTED &rarr; CLOSED).
- `src/app/api/complaints/classify/route.ts`: Real-time AI categorization and priority triage endpoint.
- `src/app/api/academics/route.ts`: Fetch student GPA, attendance, assessments, and learning gaps.
- `src/app/api/analytics/route.ts`: NL "Ask Campus Data" query engine and KPI overview endpoint.
- `src/app/api/knowledge/route.ts`: List, upload, chunk, and delete policy documents.
- `src/app/api/notices/route.ts`: List and publish campus announcements.
- `src/app/api/notifications/route.ts`: List user notifications and mark as read.
- `src/app/api/reports/route.ts`: Export complaint and attendance data in JSON and CSV formats.
- `src/app/api/audit-logs/route.ts`: Fetch administrative audit logs.
- `src/app/api/health/route.ts`: Health check endpoint for uptime monitoring.

### 3.4 Server-Side Services
- `src/server/services/copilotService.ts`: Context-aware query routing across 5 distinct intent branches.
- `src/server/services/knowledgeService.ts`: Document chunking, keyword extraction, and vector index management.
- `src/server/services/academicService.ts`: GPA computation, attendance threshold validation, and assessment gap analysis.
- `src/server/services/complaintService.ts`: AI complaint categorization, SLA calculation, and 5-stage lifecycle state machine.
- `src/server/services/analyticsService.ts`: Strict database-computed aggregations and LLM-assisted executive synthesis.
- `src/server/services/authService.ts`: User authentication, bcrypt verification, and demo token generation.
- `src/server/services/noticeService.ts`: Notice publishing, filtering, and role targeting.
- `src/server/services/notificationService.ts`: User alert dispatch and unread badge tracking.
- `src/server/services/reportService.ts`: CSV / JSON data export formatting.
- `src/server/services/auditService.ts`: Immutable action logging for compliance.

### 3.5 AI & RAG Subsystem
- `src/server/ai/geminiClient.ts`: SDK client with multi-model failover (`gemini-3.5-flash`, `gemini-3.1-flash-lite`, `gemini-flash-latest`) and embeddings (`gemini-embedding-2`).
- `src/server/ai/retrieval.ts`: Hybrid semantic vector + lexical token retrieval engine with reciprocal scoring.
- `src/server/ai/embeddings.ts`: Cosine similarity computation and deterministic 256-dim FNV-1a fallback vectorizer.
- `src/server/ai/prompts.ts`: Curated system instructions for Copilot RAG, Complaint Triage, and Campus Analytics.
- `src/lib/ai/router.ts`: Backward-compatibility wrapper for query routing.
- `src/lib/ai/complaintEngine.ts`: Backward-compatibility wrapper for complaint triage.
- `src/lib/ai/academicEngine.ts`: Backward-compatibility wrapper for academic intelligence.
- `src/lib/ai/analyticsEngine.ts`: Re-export for campus analytics.
- `src/lib/ai/rag.ts`: Re-export for knowledge base retrieval.

### 3.6 Tests & Scripts
- `tests/platform.test.ts`: Comprehensive 24-point automated test suite covering all 4 SparkX pillars.
- `tests/smoke.ts`: End-to-end HTTP smoke test suite simulating user flows.
- `scripts/ingest-documents.ts`: Standalone document ingestion and vectorization script.
- `prisma/seed.ts`: Complete synthetic seed generator (3 personas, 10 complaints, 5 assessments, 4 notices, 6 policy documents / 14 chunks).

---

## 4. Runtime Verification Results

| Command | Status | Duration / Output | Observations |
|---|---|---|---|
| `npm install` | ✅ PASS | 8s, 511 packages | Clean install. 3 high-severity sub-dependency notices in dev tooling. |
| `npx prisma generate` | ✅ PASS | 60ms | Prisma Client v6.19.3 generated cleanly. |
| `npx prisma db push` | ✅ PASS | 53ms | SQLite schema synchronized with zero diffs. |
| `npm run seed` | ✅ PASS | ~12s | Successfully seeded 3 users, courses, attendances, assessments, complaints, and 14 vectorized document chunks. |
| `npm run lint` | ❌ FAIL | 174 problems (65 errors, 109 warnings) | Failed due to strict `@typescript-eslint/no-explicit-any` and `react-hooks/purity` (`Date.now()` during render). |
| `npm run build` | ✅ PASS | 570ms compilation | Next.js 16 (Turbopack) successfully generated all 20 static/dynamic routes with zero TypeScript errors. |
| `npm test` | 🟡 23/24 PASS | 23 passed, 1 failed | When live Gemini embedding API is active, ungrounded fallback test failed due to high embedding similarity floor (~0.43). All 24 pass under offline fallback. |

### Verified User Flows:
- **Student Persona (Aarav Sharma):** Login &rarr; Dashboard &rarr; Policy RAG Copilot (75% attendance rule returned with page citations) &rarr; Academics (GPA 3.72, CS204 early warning) &rarr; Grievance submission with AI triage.
- **Faculty Persona (Dr. Priya Nair):** Login &rarr; Courses &rarr; Faculty Analytics (redirected to shared analytics in faculty layout).
- **Admin Persona (Dr. Rajesh Kumar):** Login &rarr; Dashboard KPIs &rarr; Complaint Command (lifecycle status transitions) &rarr; Natural language "Ask Campus Data" &rarr; Knowledge Base inspection &rarr; Security Audit Logs.

---

## 5. AI Implementation Audit

| Feature | Categorization | Implementation Mechanism | Notes & Fallback Behavior |
|---|---|---|---|
| **Query Intent Classification** | A &amp; C (Hybrid) | Gemini structured JSON output via `ROUTER_SYSTEM_INSTRUCTION`. | Deterministic keyword fallback (`classifyIntentFallback`) triggers if Gemini fails or is offline. |
| **Policy Document RAG** | A &amp; B (Hybrid) | Hybrid BM25 keyword matching + `gemini-embedding-2` vector cosine similarity. | If no chunks match, returns ungrounded fallback; if Gemini offline, generates deterministic 256-dim fallback embeddings. |
| **Grounded Citation Generation** | A &amp; B | Prompt constraints enforce document title, section, and page metadata extraction. | Verified citations cite exact PDF source and page numbers. |
| **Complaint Category & Priority Triage** | A &amp; C (Hybrid) | Gemini JSON generation evaluating safety, physical hazard, and academic deadlines. | Deterministic rule-based triage (`triageComplaintFallback`) accurately detects electrical/fire hazards as `CRITICAL`. |
| **Academic Learning Gap Diagnostics** | C (Deterministic) | Computed strictly from assessment scores (&lt; 65% triggers topic diagnostic). | 100% deterministic calculation based on SQLite database records. LLM does not fabricate grades. |
| **Early Attendance Advisories** | C (Deterministic) | Computed against the 75% regulatory cutoff (`CS204 at 70%` triggers supportive alert). | Pure database calculation; non-punitive messaging. |
| **Natural Language "Ask Campus Data"** | A &amp; C (Hybrid) | SQL aggregations executed via Prisma; dataset passed to Gemini for executive narration. | Numbers strictly derived from SQLite; LLM cannot alter metrics or execute SQL mutations. |

---

## 6. RAG (Retrieval-Augmented Generation) Audit

### 6.1 Chunking Strategy
- **Implementation:** Chunks are created in `knowledgeService.ts` using fixed paragraph/section boundaries with 100-character sliding overlaps and keyword tagging.
- **Metadata Retained:** `documentId`, `chunkIndex`, `pageNumber`, `keywords`, `documentTitle`, `fileName`.
- **Current Corpus:** 6 official university policies (Attendance, Examination, Student Grievance, Hostel Rules, IT Policy, Library Guidelines) indexed across 14 semantic chunks.

### 6.2 Vector Embeddings & Similarity
- **Primary Model:** `gemini-embedding-2` (3072 dimensions).
- **Offline Fallback:** 256-dimensional normalized FNV-1a hash vectorizer with character 3-gram sub-word matching.
- **Scoring Function:** $Score = 0.50 \times \text{CosineSimilarity} + 0.50 \times \text{KeywordScore}$.
- **RAG Anomaly Identified:** Real Gemini embeddings for generic text often exhibit a cosine similarity floor of 0.40–0.45. Combined with a relevance cutoff of 20 points, queries with zero semantic relation can yield scores around 21–23, preventing negative fallback activation unless the threshold is raised or keyword weighting is required for ungrounded queries.

---

## 7. Database Audit (`prisma/schema.prisma`)

| Model | Purpose | Relationships | Used By | Missing Indexes | Issues / Technical Debt |
|---|---|---|---|---|---|
| `User` | Base authentication entity | 1:1 `StudentProfile`, 1:1 `FacultyProfile`, 1:N `Notification`, 1:N `AuditLog` | Auth, Nav, Admin | None (`email` unique) | `role` is a plain string instead of Prisma enum. |
| `StudentProfile` | Student academic profile | 1:1 `User`, 1:N `Attendance`, 1:N `Assessment`, 1:N `LearningInsight`, 1:N `AcademicAlert`, 1:N `Complaint` | Student Portal, Academics | Index on `department` | `academicStatus` stored as unstructured string. |
| `FacultyProfile` | Faculty instructor profile | 1:1 `User`, 1:N `Course` | Faculty Portal | None | Lacks direct relation to department entity. |
| `Course` | Academic course listing | N:1 `FacultyProfile`, 1:N `Attendance`, 1:N `Assessment` | Academics, Faculty | Index on `department`, `semester` | `credits` integer default 4. |
| `Attendance` | Course attendance record | N:1 `StudentProfile`, N:1 `Course` | Academics, Alerts | Composite index `[studentId, courseId]` missing | Stores computed `percentage` instead of deriving on demand. |
| `Assessment` | Exam / Quiz / Midterm score | N:1 `StudentProfile`, N:1 `Course` | Academics, Gaps | Index on `[studentId, courseId]` | `type` is plain string instead of enum. |
| `LearningInsight` | AI topic diagnostic | N:1 `StudentProfile` | Academics | Index on `studentId` | `status` is plain string instead of enum. |
| `AcademicAlert` | Early warning notifications | N:1 `StudentProfile` | Academics, Navbar | Index on `studentId` | `severity` is plain string. |
| `ComplaintCategory`| Predefined grievance categories | None (independent lookup) | Complaint Triage | None (`name` unique) | Not linked to `Complaint` via foreign key relation. |
| `Complaint` | Grievance ticket | N:1 `StudentProfile`, 1:N `ComplaintStatusHistory` | Complaints, Analytics | Index on `department`, `status`, `priority` | `status` and `priority` are plain strings; redundant `studentName` field. |
| `ComplaintStatusHistory` | Lifecycle transition audit | N:1 `Complaint` | Complaints Board | Index on `complaintId` | `fromStatus` / `toStatus` plain strings. |
| `Notice` | Campus announcements | None | Notices Portal | Index on `category`, `publishedAt` | `targetRole` is plain string. |
| `KnowledgeDocument`| Policy handbook metadata | 1:N `DocumentChunk` | Knowledge Base, RAG | Index on `category` | None. |
| `DocumentChunk` | Semantic policy text chunk | N:1 `KnowledgeDocument` | RAG Retrieval | Index on `documentId` | `embeddingJson` stores serialized JSON vector in SQLite text field. |
| `Notification` | In-app user alerts | N:1 `User` | Navbar, NotificationDrawer | Index on `userId`, `isRead` | None. |
| `AuditLog` | Security & compliance log | N:1 `User` | Admin Audit | Index on `createdAt`, `action` | `userId` nullable. |

---

## 8. Security Audit

### 8.1 Authentication & Session Management
- **Token Generation:** Cryptographically signed JWT (`signToken`) with 7-day expiration.
- **Password Storage:** Hashed using `bcryptjs` (salt rounds: 10).
- **Cookie Security:** Cookies are transmitted via `campusiq_token` with `httpOnly: true`, `sameSite: 'lax'`, and path `/`.
- **Finding:** If `JWT_SECRET` is unset in the environment, it falls back to a hardcoded default string (`campusiq_super_secure_jwt_secret_token_2025`).

### 8.2 Authorization & RBAC
- **Admin Endpoint Protection:** `POST /api/knowledge`, `DELETE /api/knowledge`, and `POST /api/notices` correctly enforce `if (!user || user.role !== 'ADMIN') return 403`.
- **CRITICAL Vulnerability 1 (Anonymous Information Disclosure):** In `src/app/api/complaints/route.ts`, the `GET` handler does not enforce session existence. If an unauthenticated caller requests `/api/complaints`, `user` is null, causing `studentId` to remain undefined and returning **all student complaints** campus-wide.
- **CRITICAL Vulnerability 2 (Broken Access Control / IDOR on Complaint Status):** In `src/app/api/complaints/[id]/status/route.ts`, the `PUT` handler only verifies `if (!user) return 401`. It does not restrict caller role. Any authenticated user holding a `STUDENT` token can send status updates to transition any ticket to `RESOLVED` or `CLOSED`.

### 8.3 Natural Language Analytics & SQL Injection
- **Verification:** The "Ask Campus Data" feature (`analyticsService.ts`) does **NOT** accept or execute raw SQL from the user or the LLM.
- **Execution Guardrails:** Analytics queries are handled exclusively via Prisma `findMany` and in-memory aggregation. The LLM only receives aggregated JSON numbers and outputs text narratives and chart type preferences (`bar` | `pie` | `line`).
- **Conclusion:** There is **zero risk of SQL injection, DROP, INSERT, or unauthorized mutation** via the NL analytics feature.

---

## 9. UX Audit

| Surface / Page | UX Evaluation | Findings & Recommendations |
|---|---|---|
| **Landing Page (`/`)** | High Impact | Clean presentation with quick persona launchers and feature cards. Works seamlessly. |
| **Student Dashboard (`/student`)** | High Impact | Clear KPI cards, live attendance gauge, recent notices, and quick copilot launcher. |
| **Student Academics (`/student/academics`)** | High Impact | Good visual distinction between overall GPA, attendance gauges, and learning gap action items. |
| **Student Complaints (`/student/complaints`)** | High Impact | Real-time AI triage preview provides immediate feedback on priority and routing before final submission. |
| **Faculty Academics (`/faculty/academics`)** | Moderate / Mocked | Displays static mock data cards instead of live cohort records from the database. |
| **Admin Analytics (`/admin/analytics`)** | High Impact | Interactive Recharts visualizations with prompt suggestions, live metrics, and CSV export. |
| **Admin Knowledge Base (`/admin/knowledge`)** | High Impact | Document chunk viewer allows inspecting indexed chunks and embedding metadata. |
| **Global Navigation (`Navbar`)** | High Impact | Persona switcher allows instantaneous switching between Aarav, Dr. Priya, and Dr. Rajesh without relogging. |
| **Command Palette (`Cmd+K`)** | High Impact | Keyboard-driven navigation across all portal views. |

---

## 10. SparkX Track 4 Requirement Matrix

| Requirement | SparkX Challenge Description | Current Status | Technical Implementation Evidence |
|---|---|---|---|
| **Pillar 1: AI Copilot** | AI Student & Administrative Copilot | ✅ REAL &amp; WORKING | Context-aware routing across 5 intent categories in `copilotService.ts`. |
| **Pillar 1: Grounded RAG** | Policy handbooks RAG with citations | ✅ REAL &amp; WORKING | Hybrid vector + lexical search citing exact document names and page numbers in `knowledgeService.ts`. |
| **Pillar 2: Performance Tracking**| GPA, subject attendance computation | ✅ REAL &amp; WORKING | Computed directly from database records (GPA: 3.72, Attendance: 87.5%) in `academicService.ts`. |
| **Pillar 2: Learning Gaps** | Explainable topic diagnostic | ✅ REAL &amp; WORKING | Diagnoses exam/quiz topic patterns (CS204 Subnetting at 58%) with study action items. |
| **Pillar 2: Early Advisories** | Attendance cutoff warning | ✅ REAL &amp; WORKING | Detects attendance below 75% threshold with supportive class deficit count. |
| **Pillar 3: Triage & Priority** | Auto category, priority, department | ✅ REAL &amp; WORKING | Gemini + deterministic rule engine triaging safety hazards to `CRITICAL` in `complaintService.ts`. |
| **Pillar 3: SLA & Routing** | Target SLA commitment | ✅ REAL &amp; WORKING | Assigns target SLAs (&lt;6h for CRITICAL, &lt;48h for HIGH) and department routing. |
| **Pillar 3: Lifecycle Management** | 5-stage tracking with history | ✅ REAL &amp; WORKING | `ComplaintStatusHistory` logs state transitions with author attribution. |
| **Pillar 4: NL Campus Data** | Natural language analytics queries | ✅ REAL &amp; WORKING | Prisma aggregations narrated by Gemini into Recharts charts and executive summaries. |
| **Pillar 4: Reports & Dashboards**| Visual charts & data export | ✅ REAL &amp; WORKING | Bar, Pie, and Line charts in Recharts with one-click CSV and JSON export. |
| **Faculty Cohort Intelligence** | Live cohort grade distribution | 🟡 PARTIAL | UI exists on `/faculty/academics` but currently renders static cards rather than live DB queries. |

---

## 11. Current Strengths

1. **Zero Fabricated Metrics in Backend:** All statistics and analytics metrics are dynamically computed from the database.
2. **Resilient Multi-Model Failover:** The Gemini client seamlessly falls back across `gemini-3.5-flash`, `gemini-3.1-flash-lite`, and deterministic local rules upon 503 high-demand spikes.
3. **Safe Read-Only Analytics:** Natural language queries are isolated from raw database execution, entirely preventing AI SQL injection.
4. **Verifiable Policy Grounding:** RAG responses cite exact university policy documents and page numbers rather than ungrounded free text.
5. **Instant Persona Switcher:** Allows live demonstration across Student, Faculty, and Admin personas in seconds without session friction.

---

## 12. Critical Issues (Must Address Before Competition)

1. **Anonymous Access to Campus Complaints (`/api/complaints`):** The `GET` handler does not enforce authentication, exposing all student grievances to unauthenticated requests.
2. **Unauthorized Complaint Status Mutation (`/api/complaints/[id]/status`):** The `PUT` endpoint does not enforce role-based access control, allowing student accounts to transition complaint tickets to `RESOLVED` or `CLOSED`.

---

## 13. High-Priority Issues

1. **RAG Embedding Similarity Floor Anomaly:** The dense vector baseline (~0.43) causes ungrounded queries (e.g., "Quantum teleportation warp drive") to score above the 20-point relevance cutoff, preventing negative fallback activation during live Gemini execution.
2. **ESLint Errors in Client Components:** 65 lint errors primarily caused by `@typescript-eslint/no-explicit-any` and impure `Date.now()` calls inside render passes in `CopilotChat.tsx`.
3. **Faculty Cohort View Mocking:** `/faculty/academics` uses static placeholder copy rather than querying live cohort attendance distributions from `prisma.attendance`.

---

## 14. Medium-Priority Issues

1. **Prisma String Enums:** Fields such as `User.role`, `Complaint.status`, `Complaint.priority`, and `Assessment.type` are stored as plain strings rather than native Prisma enums.
2. **Missing Database Performance Indexes:** Missing indexes on `Attendance(studentId, courseId)`, `Complaint(department, status)`, and `DocumentChunk(documentId)`.
3. **Missing Auto-Refresh on Complaint Board:** Administrative complaint board requires manual reload or route re-entry to reflect updates submitted in other tabs.

---

## 15. Recommended 12-Day Development Priorities

| Days | Focus Area | Specific Actions |
|---|---|---|
| **Days 1–2** | **Security & Access Hardening** | Enforce auth checks in `GET /api/complaints`; restrict `PUT /api/complaints/[id]/status` to `ADMIN` and `FACULTY`. |
| **Days 3–4** | **RAG Threshold Calibration** | Adjust similarity cutoff formula in `retrieval.ts` so ungrounded queries cleanly trigger negative fallbacks with dense vectors. |
| **Days 5–6** | **Faculty Cohort Integration** | Wire `/faculty/academics` to fetch real cohort attendance and grade distributions from `academicService`. |
| **Days 7–8** | **Code Quality & Lint Cleanup** | Fix React purity violations in `CopilotChat.tsx` and type annotations to achieve a clean `npm run lint`. |
| **Days 9–10** | **Demo Polishing & Seed Realism** | Fine-tune synthetic complaints and notices so the campus appears active and vibrant on first load. |
| **Days 11–12** | **Rehearsal & Offline Freeze** | Dry-run the 3-minute demo script under complete offline network isolation. |

---

## 16. Out-of-Scope Features (Do NOT Build)

Due to the fixed hackathon timeline and demo focus, the team should explicitly **AVOID** building:
1. Multi-tenant database migrations (e.g. migrating away from SQLite to cloud PostgreSQL during demo preparation).
2. Third-party OAuth providers (Google, Microsoft SSO) — 1-click persona switching is superior for live judging.
3. Complex microservices or vector database infrastructure (Pinecone, Milvus, Qdrant) — SQLite with local serialization is zero-dependency and 100% reliable offline.
4. Voice/audio streaming integration with Gemini Live API — introduces high audio latency and failure risks in noisy competition halls.
5. End-to-end payment gateway for exam re-evaluation fees — unnecessary for Track 4 judging criteria.
