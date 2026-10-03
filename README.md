# Student OS (Student Calendar & Productivity Hub)

A minimalist, privacy-first academic schedule, task manager, and student finance system designed around realistic Indian university constraints. Built with React, TypeScript, and Tailwind CSS.

## Features

- **Timetable & Calendar:**
  - Multi-view calendar (Month grid, Weekly timeline, Day schedule).
  - Weekly recurring classes with room/hall numbers, course codes, and custom colors.
  - Conflict resolution, holiday cancellations, and extra class overrides.
- **Academic Tasks & Deadlines:**
  - Task prioritization (Urgent, High, Medium, Low) and categorization (Assignment, Exam Prep, Project, Reading, Personal).
  - Quick snoozing (+30m, +2h, Tomorrow).
- **Student Finance Manager:**
  - Dual-wallet tracking (UPI vs. Cash balances).
  - Daily & monthly spend targets with dynamic future budget recalculation.
  - Quick expense logger with category breakdown.
- **AI Timetable & Exam Importer:**
  - Standardized JSON import with canonical system prompts for external AI models (Gemini, Claude, ChatGPT).
  - Validates time collisions, invalid days, and format errors with diff preview before importing.
- **Gmail Schedule Sync (Optional):**
  - Read-only Google Sign-In (`gmail.readonly`) to detect class cancellations, reschedulings, and exams from student emails.
  - Explicit user confirmation workflow: edit suggestions before applying to schedule.
- **Privacy & Offline First:**
  - Zero required telemetry; all core features function 100% offline via `localStorage`.

---

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm or bun

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/student-calendar.git
   cd student-calendar
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment / Firebase (Optional for Gmail Sync):
   - Copy `firebase-applet-config.example.json` to `firebase-applet-config.json` and fill in your Firebase project credentials.
   - Copy `.env.example` to `.env.local` if using any client variables.

4. Start development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## Security & Secrets Policy

No sensitive API keys, OAuth client secrets, or private service credentials are hardcoded into this repository. Sensitive local configuration files (`firebase-applet-config.json`, `.env*.local`) are ignored by `.gitignore`.
