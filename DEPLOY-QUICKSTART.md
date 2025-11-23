# 🚀 Quick Deployment Reference

Condensed version of DEPLOYMENT.md for quick deployment.

## Prerequisites
- [x] PostgreSQL database (Vercel Postgres / Supabase / Neon)
- [x] GitHub account  
- [x] Vercel account
- [x] Railway or Render account (for backend)

## 6 Steps to Deploy

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/hackathon-platform.git
git push -u origin main
```

### 2. Deploy Frontend (Vercel)
1. Visit https://vercel.com/new
2. Import GitHub repo
3. Framework: **Next.js**
4. Add env var: `NEXT_PUBLIC_API_URL` (set to backend URL later)
5. Deploy

### 3. Setup Database
Choose one:
- **Vercel Postgres**: `vercel postgres create`
- **Supabase**: https://supabase.com → New Project
- **Neon**: https://neon.tech → Create Project

Copy connection string.

### 4. Seed Database
```bash
# Schema
psql "your-database-url" -f lib/db/schema.sql

# Complete seed data (Recommended)
psql "your-database-url" -f lib/db/seed-complete.sql
```

### 5. Deploy Backend (Railway)
1. https://railway.app → New Project
2. Deploy from GitHub
3. Start command: `npm run server`
4. Add environment variables (see below)
5. Copy deployed URL

### 6. Link Frontend & Backend
1. Vercel Dashboard → Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_URL` to Railway URL
3. Redeploy frontend

---

## Environment Variables

**Frontend (Vercel):**
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

**Backend (Railway):**
```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=your-database
DB_USER=your-username
DB_PASSWORD=your-password
NEXTAUTH_URL=https://your-frontend.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret
```

---

## Test Accounts
Password for all: `password123`

| Email | Role |
|-------|------|
| organizer@test.com | Organizer |
| judge1@test.com | Judge |
| participant1@test.com | Participant |

---

## What Gets Seeded
✅ 6 users • 7 hackathons • 28 prizes • 28 events • 5 projects • 21 FAQs

---

## Local Development
```powershell
# Reset local database
.\setup-database.ps1

# Start all services
npm run start-all
```

---

## Troubleshooting

**Build fails:** Check TypeScript errors, dependencies  
**DB fails:** Verify DATABASE_URL format, firewall rules  
**API fails:** Check CORS, NEXT_PUBLIC_API_URL, backend logs  
**Login fails:** Verify JWT_SECRET, NEXTAUTH settings

Full guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
