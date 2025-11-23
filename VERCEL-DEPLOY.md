#  Vercel Deployment Guide - Hackathon Platform

## Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not done)
```powershell
git init
git add .
git commit -m "Initial commit - Ready for deployment"
```

### 1.2 Create GitHub Repository
1. Go to https://github.com/new
2. Name: hackathon-platform
3. Keep it private or public (your choice)
4. **Do NOT** initialize with README (we already have one)
5. Click "Create repository"

### 1.3 Push to GitHub
```powershell
git remote add origin https://github.com/YOUR_USERNAME/hackathon-platform.git
git branch -M main
git push -u origin main
```

---

## Step 2: Setup Production Database

### Option A: Supabase (Recommended - Free tier)

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
   - Name: hackathon-platform
   - Database Password: (create a strong password)
   - Region: (choose closest to you)
   - Click "Create new project"

5. Wait for database to provision (~2 minutes)

6. Get Connection String:
   - Go to Settings  Database
   - Find "Connection string" section
   - Copy the URI format:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

7. Run Schema and Seed Data:
```powershell
# Set your connection string
$DB_URL = "postgresql://postgres:YOUR-PASSWORD@db.PROJECT-REF.supabase.co:5432/postgres"

# Run schema
psql "$DB_URL" -f lib/db/schema.sql

# Run seed data
psql "$DB_URL" -f lib/db/seed-complete.sql
```

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Sign Up / Login to Vercel
1. Go to https://vercel.com/signup
2. Sign up with GitHub (recommended)
3. Authorize Vercel to access your repositories

### 3.2 Import Project
1. Click "Add New..."  "Project"
2. Find your hackathon-platform repository
3. Click "Import"

### 3.3 Configure Build Settings
- **Framework Preset**: Next.js (should auto-detect)
- **Root Directory**: ./
- **Build Command**: 
ext build (default)
- **Output Directory**: .next (default)
- **Install Command**: 
pm install (default)

### 3.4 Add Environment Variable
Click "Environment Variables" and add:

```
Name: NEXT_PUBLIC_API_URL
Value: (leave blank for now, we'll update this after backend deployment)
```

### 3.5 Deploy
1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Copy your deployment URL: https://hackathon-platform-XXXXX.vercel.app

---

## Step 4: Deploy Backend to Railway

### 4.1 Sign Up / Login to Railway
1. Go to https://railway.app
2. Sign up with GitHub
3. Authorize Railway

### 4.2 Create New Project
1. Click "New Project"
2. Click "Deploy from GitHub repo"
3. Select hackathon-platform

### 4.3 Configure Service
1. Click on your deployed service
2. Go to "Settings" tab
3. Set the following:
   - **Start Command**: 
pm run server
   - **Root Directory**: ./

### 4.4 Add Environment Variables
Click "Variables" tab and add:

```env
DATABASE_URL=postgresql://postgres:YOUR-PASSWORD@db.PROJECT-REF.supabase.co:5432/postgres
DB_HOST=db.PROJECT-REF.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=YOUR-SUPABASE-PASSWORD
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-12345
```

### 4.5 Deploy
1. Railway will automatically deploy
2. Wait for deployment (~2 minutes)
3. Click "Settings"  "Generate Domain"
4. Copy your backend URL: https://hackathon-platform-production.up.railway.app

---

## Step 5: Link Frontend to Backend

### 5.1 Update Vercel Environment Variable
1. Go to your Vercel project dashboard
2. Click "Settings"  "Environment Variables"
3. Update NEXT_PUBLIC_API_URL:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://hackathon-platform-production.up.railway.app
   ```
4. Click "Save"

### 5.2 Redeploy Frontend
1. Go to "Deployments" tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait for redeployment (~1 minute)

---

## Step 6: Update Backend CORS

### 6.1 Add Vercel URL to Backend
1. Go to Railway dashboard
2. Click "Variables"
3. Add new variable:
   ```
   NEXTAUTH_URL=https://hackathon-platform-XXXXX.vercel.app
   ```
4. Railway will auto-redeploy

---

##  Verification Checklist

Test your deployed application:

- [ ] Frontend loads at Vercel URL
- [ ] Homepage displays with hackathons
- [ ] Click on a hackathon  Detail page loads
- [ ] Click "Login"  Modal appears
- [ ] Register new account  Success
- [ ] Login with test account: organizer@test.com / password123
- [ ] Profile dropdown shows user name: "Tejsvi Organizer"
- [ ] Logout confirmation dialog appears
- [ ] Registration confirmation works
- [ ] All 7 hackathons visible
- [ ] Filters work (ecosystem, tech stack, etc.)

---

##  Test Accounts

All passwords: password123

| Email | Full Name | Role |
|-------|-----------|------|
| organizer@test.com | Tejsvi Organizer | Organizer |
| judge1@test.com | Tejsvi Judge1 | Judge |
| judge2@test.com | Tejsvi Judge2 | Judge |
| participant1@test.com | Tejsvi Hacker1 | Participant |
| participant2@test.com | Tejsvi Hacker2 | Participant |
| participant3@test.com | Tejsvi Hacker3 | Participant |

---

##  Troubleshooting

### Frontend Build Fails
```powershell
# Check for TypeScript errors locally
npm run build
```

### Backend Not Connecting to Database
- Verify DATABASE_URL format is correct
- Check Supabase database is running
- Ensure password doesn't have special characters (URL encode if needed)

### API Not Working
- Check NEXT_PUBLIC_API_URL is correct (no trailing slash)
- Verify Railway backend is deployed and running
- Check Railway logs for errors

### Login Not Working
- Verify JWT_SECRET is set in Railway
- Check NEXTAUTH_SECRET is set
- Ensure database has users table with data

---

##  Success!

Your hackathon platform is now live at:
- **Frontend**: https://hackathon-platform-XXXXX.vercel.app
- **Backend**: https://hackathon-platform-production.up.railway.app

Share your platform and start hosting hackathons! 
