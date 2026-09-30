# CampusIQ: User Manual & Operational Guide

Welcome to **CampusIQ** — the unified, intelligent operating layer for university administration, academic support, and campus facilities.

---

## 👥 User Roles & Access Matrix

CampusIQ provides customized experiences tailored to three core institutional personas:

| Feature / Workspace | Student (`student@campusiq.edu`) | Faculty (`faculty@campusiq.edu`) | Administrator (`admin@campusiq.edu`) |
|---|:---:|:---:|:---:|
| **AI Copilot (Grounded Policy RAG)** | ✅ Personal & Campus | ✅ Institutional | ✅ Full Institutional |
| **Personal Academic Records & GPA** | ✅ Self only | ❌ | ❌ |
| **Cohort Attendance & Learning Gaps**| ❌ | ✅ Assigned Courses | ✅ Campus-wide |
| **Submit & Track Complaints** | ✅ Submit & Track | ✅ Submit & Track | ✅ Full Triage & Status Control |
| **Complaint SLA & Command Center** | ❌ | ❌ | ✅ 5-Stage Lifecycle |
| **Ask Campus Data (NL Analytics)** | ❌ | ✅ Faculty Overview | ✅ Executive NL Queries |
| **Knowledge Base (Policy Ingestion)**| ❌ (Read-only via RAG)| ❌ | ✅ Upload & Embed Documents |
| **Immutable Audit Logs** | ❌ | ❌ | ✅ Full Security Trail |

---

## 🎓 1. Student Portal Guide

### 1.1 Logging In
- Navigate to `/login` or click the **Student** button on the landing page hero banner.
- Demo credentials: `student@campusiq.edu` / `student123` (Name: **Aarav Sharma**, B.Tech CSE, Sem 4).

### 1.2 Using the AI University Copilot
- Access via **Copilot** in the left navigation sidebar.
- **Official Policy Grounding:** Ask questions regarding university bylaws, such as:
  - *"What is the minimum attendance required to appear for semester exams?"*
  - *"What are the hostel curfew hours on weekdays vs weekends?"*
  - *"How do I apply for re-evaluation of my midterm paper and what is the fee?"*
  - *"What is the daily campus Wi-Fi data quota per student?"*
- **Source Citations:** Every answer will include verified source links citing the exact document title, section, and page number.
- **Academic Self-Inquiry:** Ask *"What should I focus on academically?"* to receive a personalized summary of your grades and attendance alerts.

### 1.3 Academic Intelligence & Attendance Tracking
- Navigate to **Academics**.
- **Attendance Gauges:** View course-by-course attendance percentages. Courses below the **75% regulatory requirement** are highlighted with supportive advisory notes indicating how many consecutive classes are needed to regain eligibility.
- **Learning Gap Diagnostic:** Inspect your assessment history (Quizzes, Midterms, Assignments). The system identifies weak sub-topics (e.g., *Computer Networks: IP Subnetting & CIDR*) with targeted study recommendations.

### 1.4 Intelligent Complaint Submission
- Navigate to **Complaints** &rarr; **Submit Complaint**.
- Enter a title and description of your issue (e.g., *Hostel water heater not working*, *Lab projector flickering*, or *Bus route 4 delayed*).
- Click **Analyze & Triage**:
  - The AI immediately categorizes the issue, assigns an urgency priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), and routes it to the correct department.
  - Review the AI rationale before clicking **Confirm Submission**.
- Track your ticket in real time across the 5 lifecycle stages: `SUBMITTED` &rarr; `UNDER_REVIEW` &rarr; `IN_PROGRESS` &rarr; `RESOLVED` &rarr; `CLOSED`.

---

## 👩‍🏫 2. Faculty Portal Guide

### 2.1 Logging In
- Demo credentials: `faculty@campusiq.edu` / `faculty123` (Name: **Dr. Priya Nair**, Assoc. Professor & HoD Academics).

### 2.2 Cohort Monitoring & Early Warning
- Navigate to **Faculty Academics**.
- Review course enrollment, overall class attendance distribution, and students falling below the 75% attendance threshold.
- Issue supportive advisories and notifications to at-risk students before the end-semester detention cutoff.

### 2.3 Faculty Copilot & Administrative Queries
- Faculty members can query the Copilot for academic scheduling, grading guidelines, and syllabus policies without searching through physical handbooks.
- Access departmental analytics via the integrated **Faculty Analytics** view.

---

## 🏛️ 3. Administrator Portal Guide

### 3.1 Logging In
- Demo credentials: `admin@campusiq.edu` / `admin123` (Name: **Dr. Rajesh Kumar**, Dean of Campus Administration).

### 3.2 Complaint Command Center
- Navigate to **Admin Complaints**.
- Filter tickets by Department (`IT Services`, `Hostel Facilities`, `Academic Affairs`, `Transport`), Status, or Priority.
- Open any ticket to:
  - Transition its lifecycle status (`UNDER_REVIEW`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`).
  - Add internal technician notes and resolution remarks.
  - View SLA countdowns (`CRITICAL`: < 6h, `HIGH`: < 48h).

### 3.3 Natural Language "Ask Campus Data"
- Navigate to **Campus Analytics**.
- Type natural questions into the analytics search bar:
  - *"Which department has the highest resolution time?"*
  - *"Show me the distribution of open complaints by category."*
  - *"What are the current complaint trends this week?"*
- The analytics engine parses your query, runs secure read-only DB aggregations, renders interactive Recharts visualizations (Bar, Pie, or Line), and provides an executive bulleted summary.
- Export aggregated datasets to CSV or JSON with one click.

### 3.4 Knowledge Base & Policy Ingestion
- Navigate to **Knowledge Base**.
- View all 6 currently indexed university policy handbooks and their 14 semantic chunks.
- Upload new PDF/Text institutional handbooks. The system automatically chunks, generates vector embeddings, and registers the documents into the active RAG index.

### 3.5 Security & Audit Trail
- Navigate to **Audit Logs**.
- Review immutable records of all administrative actions, login events, complaint status changes, and policy updates with full user attribution and timestamps.

---

## ⚙️ 4. System Administration & Configuration

### Environment Variables (`.env`)
```bash
# Database connection (SQLite default)
DATABASE_URL="file:./dev.db"

# JWT Signing Secret
JWT_SECRET="campusiq_super_secure_jwt_secret_token_2025"

# Google Gemini API Key (Leave blank for deterministic offline fallback)
GEMINI_API_KEY="your-api-key-here"

# Application Metadata
NEXT_PUBLIC_APP_NAME="CampusIQ"
NEXT_PUBLIC_APP_TAGLINE="One Intelligent Layer for the Entire University"
```

### Running Tests
```bash
npm test
```
Executes the comprehensive 24-point automated test suite covering all four pillars.

### Production Build
```bash
npm run build
npm start
```
Starts the production Next.js server on `http://localhost:3000`.
