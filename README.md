# CampusIQ — AI University Copilot & Intelligent Campus Management Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-1B222D.svg)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **"One Intelligent Layer for the Entire University."**  
> Developed for the **30-Day Innovation Challenge (Challenge #4)**.

---

## 📌 Executive Summary

Traditional universities operate across disconnected software silos: fragmented portals for attendance, physical paper queues for academic leaves, untracked hostel maintenance emails, and static PDF policy handbooks. 

**CampusIQ** delivers a unified, production-grade AI operating layer connecting **Students**, **Faculty**, and **Administrators** through four core functional pillars:

1. **AI University Copilot & Grounded RAG Knowledge Base** — Verifiable source citations, zero hallucinations, and context-aware query routing.
2. **Academic Intelligence & Student Support** — Explainable learning gap analysis, subject-wise attendance tracking against the 75% examination threshold, and supportive early alerts.
3. **Intelligent Complaint Management** — Real-time AI categorization, priority evaluation with safety justification, automated department routing, and full 5-stage lifecycle tracking.
4. **AI Campus Analytics & Decision Support** — Natural language *"Ask Campus Data"* querying with strictly read-only execution, interactive visualizations, and one-click report exports.

---

## 🚀 Live Demo Accounts & Instant Persona Switcher

CampusIQ includes rich synthetic demo data and a **1-Click Persona Switcher** in the top navigation bar for seamless live demonstrations:

| Role | Demo Email | Password | Persona Overview | Primary Workspaces |
|---|---|---|---|---|
| **Student** | `student@campusiq.edu` | `student123` | **Aarav Sharma** &bull; B.Tech CSE (Sem 4) &bull; Roll: `CSE-2023-042` | Dashboard, Copilot, Academics, Complaints, Notices, Documents |
| **Faculty** | `faculty@campusiq.edu` | `faculty123` | **Dr. Priya Nair** &bull; Assoc. Professor &amp; HoD Academics | Courses (DSA &amp; DBMS), Cohort Attendance, Early Advisories |
| **Administrator** | `admin@campusiq.edu` | `admin123` | **Dr. Rajesh Kumar** &bull; Dean of Campus Administration | Executive KPIs, Triage Board, Knowledge Base, Campus Analytics |

---

## 🎯 The Four Official Challenge Pillars

### Pillar 1: AI University Copilot & Grounded RAG
- **Auditable RAG Pipeline:** Ingests university handbooks, parses text, splits into semantic chunks with metadata (document ID, page, keywords), and scores relevance using hybrid tokenized vectors.
- **Verifiable Source Citations:** Every policy response explicitly cites the source document and page number (e.g. `University_Attendance_Policy_2024_25.pdf, Page 1`).
- **Context-Aware Routing:** Classifies prompts into:
  - `UNIVERSITY_POLICY_RAG`: University attendance thresholds, medical leaves, hostel curfew, exam conduct.
  - `STUDENT_ACADEMIC`: Personal grades, attendance %, learning gaps, study recommendations.
  - `COMPLAINT_ACTION`: Wi-Fi failures, projector issues, transport delays (auto-prefills ticket form).
  - `CAMPUS_ANALYTICS`: Department statistics and resolution trends.

### Pillar 2: Academic Intelligence & Explainable Gaps
- **Explainable Learning Gap Analysis:** Diagnoses assessment patterns to identify precise conceptual topics needing revision (e.g., *Computer Networks: IP Subnetting & CIDR calculations at 58%*).
- **Supportive Early Alerts:** Detects attendance falling below 75% (e.g., *CS204 at 70%*) and triggers supportive advisories without ungrounded predictions such as "You will fail."
- **Attendance vs Examination Eligibility:** Tracks attended classes vs total classes per course with visual threshold indicators.

### Pillar 3: Intelligent Complaint Management
- **Instant AI Triage:** Classifies complaints into categories (*Hostel, IT/Internet, Academic, Examination, Facilities, Transport*), evaluates priority (*LOW, MEDIUM, HIGH, CRITICAL*), explains the safety/urgency rationale, and routes directly to the responsible department.
- **SLA Commitments:**
  - `CRITICAL`: Under 6 hours (safety hazards, major electrical outages)
  - `HIGH`: Under 24–48 hours (Wi-Fi outages, bus transit disruptions)
  - `MEDIUM`: Under 3–5 business days (classroom AV, grading review)
  - `LOW`: Under 7–10 business days (general suggestions)
- **5-Stage Lifecycle Tracking:** `SUBMITTED` &rarr; `UNDER_REVIEW` &rarr; `IN_PROGRESS` &rarr; `RESOLVED` &rarr; `CLOSED` with student notifications and audit trail.

### Pillar 4: AI Campus Analytics & Decision Support
- **Natural Language "Ask Campus Data":** Administrators ask natural questions (*"Which department has the most unresolved complaints?"*, *"Show complaint trends for this month"*).
- **Strict Read-Only Guardrails:** AI queries are sanitized and executed strictly in read-only mode to prevent data corruption.
- **Visual Analytics:** Generates interactive Recharts charts (Bar, Pie, Line) with executive summaries and actionable bullet points.
- **Export Formats:** One-click CSV and JSON report exports.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons |
| **Visualizations** | Recharts Data Visualization Suite |
| **Backend & APIs** | Next.js API Routes (Serverless / Edge Compatible) |
| **Database & ORM** | Prisma 6 ORM with SQLite (`file:./dev.db` for zero-install demo, switchable to PostgreSQL) |
| **AI Provider Abstraction**| Google Gemini API (`@google/genai`) with **100% Deterministic Fallback Mode** |
| **Security & Auth** | JWT (`jsonwebtoken`), `bcryptjs` password hashing, Cookie session management |
| **Testing** | Automated Platform Test Suite (`tests/platform.test.ts`) |

---

## ⚡ Quickstart Guide

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/ayanhazra1901-pixel/AI-University-Copilot-Intelligent-Campus-Management-Platform.git
cd AI-University-Copilot-Intelligent-Campus-Management-Platform
npm install
```

### 2. Configure Environment (Optional)
A `.env.example` is provided. For zero-config local development, the default `.env` is pre-configured with SQLite:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="campusiq_super_secure_jwt_secret_token_2025"
GEMINI_API_KEY="" # Optional: Leave empty for offline deterministic demo mode
```

### 3. Initialize & Seed Demo Database
```bash
npx prisma db push
npm run seed
```

### 4. Run Automated Verification Tests
```bash
npm test
```
*(All 24 automated tests verify database integrity, RAG retrieval across 6 policy documents, grounded citations, academic gap analysis, early attendance warnings, triage priorities with safety rationales, read-only analytics, and intelligent query routing).*

### 5. Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📋 Documentation & Demo Guides

- **[Live Demo Script (DEMO.md)](./DEMO.md)**: A complete 3-minute script for judges with step-by-step click-through, offline fallback contingency, and judge Q&A defense.
- **[User Manual (USER_MANUAL.md)](./USER_MANUAL.md)**: Comprehensive guide for Student, Faculty, and Admin workflows.

---

## 📋 5–7 Minute Judge Demonstration Script

1. **Start on Landing Page:** Click **"Launch Live Interactive Prototype"** &rarr; **Student Persona (Aarav)**.
2. **Test RAG Copilot:** Ask *"What is the attendance requirement?"* Observe grounded policy citation referencing `University_Attendance_Policy_2024_25.pdf (Page 1)`.
3. **Test Academic Intelligence:** Ask *"What should I focus on academically?"* Observe explainable diagnostic of CS204 Subnetting (58%) and the 70% attendance alert.
4. **Log a Grievance:** Click **Submit Complaint** &rarr; Enter *"Wi-Fi is not working in Hostel Block B, 3rd Floor"*. Watch AI auto-tag Category `Hostel`, Priority `HIGH`, and Department `IT Services`.
5. **Switch to Admin Persona:** Use the top bar to switch to **Admin (Dr. Rajesh Kumar)**.
6. **Progress Grievance Status:** Open **Complaint Command**, find the new ticket, and transition status from `SUBMITTED` to `IN PROGRESS` with a technician note.
7. **Ask Campus Data:** Open **Campus Analytics**, ask *"Which department has the most unresolved complaints?"*, and review the generated chart and executive summary.
8. **Inspect Knowledge Base:** Open **Knowledge Base** to view indexed documents, semantic chunks, and upload new policies.

---

## 🔒 Security, Privacy & Reliability

- **Role-Based Access Control (RBAC):** Strict boundaries isolate student records, faculty ledgers, and administrative queues.
- **Safe Analytics Execution:** Natural language querying uses validated, read-only analytical aggregations with zero write privileges.
- **Immutable Audit Trail:** All administrative operations (status changes, document indexing, notice publication) are logged in the `AuditLog` table.
- **Offline Reliability:** If external AI APIs are unreachable, CampusIQ seamlessly continues operating via its intelligent deterministic engine with zero downtime.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
