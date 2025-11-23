# 🚀 Quick Start Guide

## One-Time Setup

### 1. Create Database
```powershell
psql -U postgres
CREATE DATABASE hackathon_platform;
\q
```

### 2. Initialize Schema & Seed Data
```powershell
psql -U postgres -d hackathon_platform -f lib/db/schema.sql
psql -U postgres -d hackathon_platform -f lib/db/seed.sql
```

## Running the App (Every Time)

### Open 4 Terminals and Run:

**Terminal 1:**
```powershell
cd c:\Users\namanbhat\hackathon-platform
npx hardhat node
```
*(Leave running - blockchain)*

**Terminal 2:**
```powershell
cd c:\Users\namanbhat\hackathon-platform
npx hardhat run scripts/deploy.js --network localhost
```
*(Run once after Terminal 1 starts)*

**Terminal 3:**
```powershell
cd c:\Users\namanbhat\hackathon-platform
npx ts-node server/index.ts
```
*(Leave running - backend API)*

**Terminal 4:**
```powershell
cd c:\Users\namanbhat\hackathon-platform
npm run dev
```
*(Leave running - frontend)*

## Access

- **App**: http://localhost:3000
- **API**: http://localhost:3001

## Test Login

- **Email**: hacker1@test.com (or organizer@test.com, judge1@test.com)
- **Password**: password123

## Troubleshooting

**Port in use?**
```powershell
# Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Database error?**
- Ensure PostgreSQL is running
- Verify credentials in .env file

**Contract not found?**
- Restart Terminal 1 (hardhat)
- Re-run Terminal 2 (deploy)
- Restart Terminal 3 (backend)

## File Structure

```
📁 app/          - Frontend pages (Next.js)
📁 server/       - Backend API (Express)
📁 contracts/    - Smart contracts (Solidity)
📁 lib/db/       - Database schema & seeds
📄 .env          - Configuration
```

## Key Files

- **SETUP.md** - Detailed setup instructions
- **FEATURES.md** - Complete feature list
- **PROJECT_SUMMARY.md** - Full project overview
- **README.md** - Quick reference

---

**That's it! Your decentralized hackathon platform is ready! 🎉**
