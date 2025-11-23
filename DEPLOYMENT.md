# Deployment Guide for Vercel

## Prerequisites
- Vercel account (sign up at vercel.com)
- PostgreSQL database (Vercel Postgres, Supabase, or Neon)
- Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Database

### Option A: Use Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Click "Storage" → "Create Database" → "Postgres"
3. Note down the connection string

### Option B: Use Supabase
1. Go to supabase.com and create a project
2. Get the connection string from Settings → Database

### Option C: Use Neon.tech
1. Go to neon.tech and create a project
2. Get the connection string

## Step 2: Set Up Your Repository

```bash
# Initialize git if not already done
cd c:\Users\namanbhat\hackathon-platform
git init
git add .
git commit -m "Initial commit"

# Create a new repository on GitHub and push
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### Via Vercel Dashboard:
1. Go to vercel.com/new
2. Import your GitHub repository
3. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

### Environment Variables:
Add these in Vercel dashboard under Settings → Environment Variables:

```
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Backend API (for local development, use your deployed backend URL for production)
NEXT_PUBLIC_API_URL=http://localhost:3001

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Database credentials (if using separate values)
DB_USER=postgres
DB_HOST=localhost
DB_NAME=hackathon_platform
DB_PASSWORD=your-password
DB_PORT=5432
```

## Step 4: Seed Your Production Database

After deploying, you need to seed your production database. Connect to your production database:

```bash
# Set environment variable for production database
$env:PGPASSWORD='your-production-password'

# Run migrations
psql -h your-production-host -U your-username -d your-database -f lib/db/schema.sql

# Seed data - Option A: Complete seed file (Recommended)
psql -h your-production-host -U your-username -d your-database -f lib/db/seed-complete.sql

# This will create:
# - 6 test users (organizer, judges, participants)
# - 7 hackathons (3 with data, 4 upcoming)
# - 28 prizes across all hackathons
# - 28 schedule events
# - Judge assignments
# - 5 registrations
# - 5 sample projects
# - 21 FAQs

# Option B: Individual seed files (if you prefer granular control)
psql -h your-production-host -U your-username -d your-database -f lib/db/seed-data.sql
psql -h your-production-host -U your-username -d your-database -f lib/db/seed-users.sql
psql -h your-production-host -U your-username -d your-database -f lib/db/seed-hackathons.sql
psql -h your-production-host -U your-username -d your-database -f lib/db/seed-prizes.sql
psql -h your-production-host -U your-username -d your-database -f lib/db/seed-more-hackathons.sql
psql -h your-production-host -U your-username -d your-database -f lib/db/add-prizes-schedules.sql
```

**Test User Credentials:**
All test accounts use password: `password123` (hash this securely in production!)
- `organizer@test.com` - Organizer role
- `judge1@test.com` - Judge role
- `judge2@test.com` - Judge role
- `participant1@test.com` - Participant role
- `participant2@test.com` - Participant role
- `participant3@test.com` - Participant role

## Step 5: Deploy Backend Separately

Since the backend is a separate Express server, you have two options:

### Option A: Deploy Backend to Vercel (Serverless)
1. Create a new project on Vercel for the backend
2. Add `api/index.js` to export the Express app as a serverless function
3. Add environment variables

### Option B: Deploy Backend to Railway/Render (Recommended for long-running server)
1. Go to railway.app or render.com
2. Create a new project
3. Connect your repository
4. Set build command: `npm install`
5. Set start command: `npm run server`
6. Add environment variables
7. Note the deployed URL and update NEXT_PUBLIC_API_URL in Vercel

## Step 6: Update API URLs

After backend deployment, update the frontend to use production API URL:

1. In Vercel dashboard, go to Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_URL` to your deployed backend URL
3. Redeploy the frontend

## Troubleshooting

### Database Connection Issues:
- Ensure DATABASE_URL is correctly formatted
- Check if database accepts connections from Vercel's IP range
- For Vercel Postgres, use connection pooling

### Build Failures:
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Check for TypeScript errors

### API Not Working:
- Verify NEXT_PUBLIC_API_URL is set correctly
- Check CORS settings in backend
- Ensure backend is running and accessible

## Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and accessible
- [ ] Database connected and seeded
- [ ] Environment variables set correctly
- [ ] Login/Register working
- [ ] Hackathon pages loading
- [ ] Registration working
- [ ] Custom domains configured (optional)

## Monitoring

- Check Vercel Analytics for traffic
- Monitor database usage
- Check error logs in Vercel dashboard
- Set up alerts for downtime

## Local Development with Production Data

To use production database locally:

```bash
# Update .env with production DATABASE_URL
# Or use separate .env.production file
```

Remember to never commit `.env` files to git!
