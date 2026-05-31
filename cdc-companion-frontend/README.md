# CDC Companion Frontend

A premium, interactive web portal built with **Next.js, React, TailwindCSS, and TypeScript** designed for candidates, reviewers, and administrators to seamlessly manage the CV Review Drive.

---

## 🌟 Portals & Pages

### 1. Candidate CV Submission Portal (`/`)
* Students can register their CVs by providing their name, institute email, roll number, and Google Drive links.
* Features integrated client-side validation for:
  * Institute email formats (`@kgpian.iitkgp.ac.in`).
  * Roll Number prefixes (validated against target year formats).
  * Valid Google Drive URL patterns.

### 2. Isolated Reviewer Registration (`/signup`)
* A hidden standalone registration portal constructed to match the historical Google Form registrations.
* Reviewers can sign up, select multiple target profiles they are willing to review, specify their quota, and input queries.
* **Seniority Mapping:** Automatically maps the reviewer's roll number to their login password to automatically satisfy backend seniority match filters (`pwdPrefix <= rollPrefix`).

### 3. Reviewer Portal (`/reviewer`)
* Login via `/login` with full name and roll number.
* Interactive, custom-styled dashboard displaying candidate queues, allocated reviewees, and candidate status tracking.
* Sleek review editor allowing reviewers to evaluate and comment on:
  * Structure & Format
  * Relevance to Domain
  * Depth of Explanation
  * Language & Grammar
  * Improvements in Projects
  * Additional Suggestions

### 4. Admin Dashboard (`/admin`)
* Access secured via `/login/admin`.
* Features complete pipeline visibility across three bento-style grids:
  * **Reviewees:** List candidates, track progress, and perform clean removals.
  * **Reviewers:** View active reviewers, their profiles, quotas, and current assignments.
  * **Reviews:** View completed evaluations and domain comments.
* **Auto-Allocation Controller:** Trigger the matching logic from the header in one click.
* **Relational Row Removals:** Full administrator power to delete candidates, reviewers, or specific reviews inline with automatic state updates.

---

## 🛠️ Setup & Installation

### 1. Prerequisites
* **Node.js** (v18+)
* **npm** (v9+)

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
# URL of your running backend service
BACKEND_URL="http://localhost:5000"
```

### 3. Install & Start
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

---

## 🔒 Security Integration
* **Resilient `authFetch` Context:** Custom authentication wrapper automatically bridges context state with local storage tokens.
* **Security Middleware Guards:** All requests are globally guarded in backend routers via JWT claims, keeping the dashboard strictly administrator-only.
