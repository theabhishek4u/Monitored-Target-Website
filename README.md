# Gov Content Tracker (Government Website Content Intelligence Dashboard)

A high-performance web-based content intelligence, scraping, categorization, and analytics dashboard designed to monitor government job and result portals in real-time.

---

## 🚀 Features

- **Real-Time Analytics Dashboard**: Real-time stats for **Today**, **Yesterday**, **Last 7 Days**, and **Last 30 Days**.
- **Exact Date Verification**: Multi-stage date extraction pipeline (`JSON-LD` -> `Meta / OpenGraph` -> `<time>` -> text regex) strictly bound to application timezone (`Asia/Kolkata`).
- **Category Publishing Matrix**: Automated categorization across Latest Jobs, Admit Cards, Results, Answer Keys, Syllabus, and Admissions.
- **Date Publishing Timeline**: Daily publishing cadence with visual volume share bars.
- **Discovered Posts Intelligence Feed**:
  - Live table with **`NEW`** badges
  - Keyword and title search with debouncing
  - Direct **"Open Source"** external post links
  - Pagination (20 / 50 / 100 per page)
  - One-click **CSV** and **JSON** exports
- **Zero-Duplicate Scraper Engine**: SHA-256 URL hashing and canonical URL normalization.
- **Observability & Configuration**: Scan history audit logs (`/logs`) and target source/category management (`/settings`).

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **Backend / API**: Next.js Server Routes, Cheerio, Axios.
- **Database**: Prisma ORM with PostgreSQL / Supabase schema (and zero-config SQLite local development option).

---

## 📦 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Initialize Database & Seed
```bash
npx prisma db push
node prisma/seed.js
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.
