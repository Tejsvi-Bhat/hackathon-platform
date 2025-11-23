# Setup Guide - Decentralized Hackathon Platform

This guide will help you set up and run the complete decentralized hackathon platform locally.

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- npm or yarn package manager

## Step-by-Step Setup

### 1. Install Node Dependencies

```powershell
cd c:\Users\namanbhat\hackathon-platform
npm install
```

This installs all required packages including Next.js, Express, Hardhat, ethers.js, and PostgreSQL client.

### 2. Create PostgreSQL Database

Open PowerShell or Command Prompt:

```powershell
# Connect to PostgreSQL (you may need to adjust the path)
psql -U postgres

# Inside psql, create the database:
CREATE DATABASE hackathon_platform;

# Exit psql
\q
```

### 3. Initialize Database Schema

Run the schema file to create all tables:

```powershell
psql -U postgres -d hackathon_platform -f lib/db/schema.sql
```

This creates tables for:
- users (with roles: organizer, judge, hacker)
- hackathons
- prizes
- schedules
- judges
- projects
- scores
- notifications
- registrations

### 4. Seed Test Data

Load sample data for testing:

```powershell
psql -U postgres -d hackathon_platform -f lib/db/seed.sql
```

This creates:
- 6 test users (1 organizer, 2 judges, 3 hackers)
- 3 hackathons (upcoming, ongoing, completed)
- Sample prizes, schedules, and projects
- Test scores and notifications

**Test Account Credentials:**
- All test accounts use password: `password123`
- Emails: organizer@test.com, judge1@test.com, judge2@test.com, hacker1@test.com, etc.

### 5. Configure Environment Variables

The `.env` file is already created. Verify the settings:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hackathon_platform
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3001
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
```

Update `DB_PASSWORD` if your PostgreSQL uses a different password.

## Running the Application

You need to run 4 separate processes. Open 4 separate PowerShell terminals:

### Terminal 1: Start Hardhat Blockchain

```powershell
cd c:\Users\namanbhat\hackathon-platform
npx hardhat node
```

This starts a local Ethereum blockchain on http://127.0.0.1:8545

**Leave this running** - you'll see blockchain logs here.

### Terminal 2: Deploy Smart Contracts

Wait for Terminal 1 to fully start, then:

```powershell
cd c:\Users\namanbhat\hackathon-platform
npx hardhat run scripts/deploy.js --network localhost
```

This deploys the HackathonPlatform smart contract and saves the ABI to `lib/contracts/`.

**This only needs to run once** after starting the blockchain. The output will show the deployed contract address.

### Terminal 3: Start Backend Server

```powershell
cd c:\Users\namanbhat\hackathon-platform
npx ts-node server/index.ts
```

This starts the Express API server on http://localhost:3001

**Leave this running** - you'll see API request logs here.

### Terminal 4: Start Next.js Frontend

```powershell
cd c:\Users\namanbhat\hackathon-platform
npm run dev
```

This starts the Next.js frontend on http://localhost:3000

**Leave this running** - you'll see frontend build logs here.

## Accessing the Application

### Main URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Blockchain RPC**: http://127.0.0.1:8545

### Test the Application

1. **Open Browser**: Navigate to http://localhost:3000

2. **Login**: Click "Login" button
   - Email: `hacker1@test.com`
   - Password: `password123`

3. **View Dashboard**: You'll be redirected to your role-based dashboard

4. **Explore Features**:
   - Browse hackathons on home page
   - View ongoing, upcoming, and completed hackathons
   - Register for hackathons (as hacker)
   - Submit projects (as hacker)
   - View leaderboards

5. **Test Different Roles**:
   - **Organizer** (organizer@test.com): Create hackathons, add prizes, assign judges, release scores
   - **Judge** (judge1@test.com): View and score projects
   - **Hacker** (hacker1@test.com): Register, submit projects, view scores

## Troubleshooting

### Database Connection Issues

If you see database errors:

```powershell
# Verify PostgreSQL is running
Get-Service postgresql*

# If not running, start it:
Start-Service postgresql-x64-14  # Adjust version number
```

### Port Already in Use

If ports 3000, 3001, or 8545 are in use:

```powershell
# Find process using port
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :8545

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Smart Contract Not Found Error

If frontend can't find contract:

1. Make sure Terminal 1 (Hardhat) is still running
2. Re-run Terminal 2 (deploy script)
3. Restart Terminal 3 (backend server)

### TypeScript Errors

If you see TypeScript compilation errors:

```powershell
# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Restart frontend
npm run dev
```

## Project Structure

```
hackathon-platform/
├── app/                    # Next.js pages
│   ├── page.tsx           # Home page (browse hackathons)
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   └── dashboard/         # Role-based dashboard
├── contracts/             # Smart contracts
│   └── HackathonPlatform.sol
├── server/                # Express backend
│   └── index.ts          # All API routes
├── lib/                   # Shared libraries
│   ├── db/               # Database
│   ├── auth.ts           # JWT utilities
│   ├── middleware.ts     # Auth middleware
│   ├── blockchain.ts     # Blockchain integration
│   └── AuthContext.tsx   # React auth context
├── scripts/              # Utility scripts
│   ├── deploy.js         # Contract deployment
│   └── generate-password.js
└── .env                  # Environment config
```

## Development Workflow

### Creating a New Hackathon

1. Login as organizer
2. Go to dashboard
3. Click "Create Hackathon"
4. Fill in details (interacts with smart contract)
5. Add prizes, schedule, judges

### Submitting a Project

1. Login as hacker
2. Register for a hackathon
3. Submit project with GitHub/demo URLs
4. View submission status

### Judging Projects

1. Login as judge
2. View assigned hackathons
3. Access project submissions
4. Score on technical, innovation, presentation, impact
5. Provide feedback

### Viewing Results

1. Organizer releases scores
2. Leaderboard becomes public
3. All users can view rankings
4. Scores are immutable on blockchain

## API Testing

You can test API endpoints directly:

```powershell
# Get all hackathons
Invoke-RestMethod -Uri http://localhost:3001/api/hackathons

# Login
$body = @{
    email = "hacker1@test.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3001/api/auth/login -Method POST -Body $body -ContentType "application/json"
```

## Next Steps

- Customize the UI in `app/` directory
- Add more API endpoints in `server/index.ts`
- Extend smart contracts in `contracts/`
- Add more features like file uploads, chat, etc.

## Support

For issues or questions, check:
- README.md for quick reference
- Database schema in `lib/db/schema.sql`
- API routes in `server/index.ts`
- Smart contract in `contracts/HackathonPlatform.sol`
