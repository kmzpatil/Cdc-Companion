# Cdc Companion

## 📖 Project Overview
**Cdc Companion** is a full‑stack web application that helps CDC (Career Development Center) reviewers and administrators allocate candidates to reviewers based on roll‑number prefixes and profile matching. It consists of a **Next.js** frontend and an **Express/TypeScript** backend with a PostgreSQL database (Prisma ORM).

---

## 🏗️ Architecture

```mermaid
flowchart TB
    subgraph FrontendLayer[Frontend - Next.js]
        FE[React UI] -->|fetches| API[Backend API]
    end
    subgraph BackendLayer[Backend - Express + Prisma]
        API --> DB[(PostgreSQL)]
        API --> Auth[JWT Auth]
        API --> Rate[Rate Limiter]
    end
    DB -->|prisma schema| Schema[Prisma Schema]
    classDef frontend fill:#E3F2FD,stroke:#90CAF9,stroke-width:2px;
    classDef backend fill:#FFF3E0,stroke:#FFB74D,stroke-width:2px;
    class FE,API frontend;
    class DB,Auth,Rate,Schema backend;
```

---

## ⚙️ Tech Stack
- **Frontend**: Next.js (React), TypeScript, TailwindCSS (optional), Axios
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
- **Auth**: JWT with `isAdmin` claim
- **Rate Limiting**: Custom middleware (`rateLimiter.ts`)
- **Deployment**: Docker (optional), Vercel for frontend, Render/Heroku for backend

---

## 📚 API Endpoints (Backend)
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Issue JWT token |
| `GET` | `/api/admin/candidates` | List candidates (admin only) |
| `DELETE` | `/api/admin/candidates/:id` | Delete candidate |
| `GET` | `/api/reviewer/allocate` | Allocate reviewers based on roll‑number logic |
| … | … | See `src/controllers` for full list |


---
