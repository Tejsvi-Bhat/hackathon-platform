# 🚀 Production Deployment Guide

## Current Setup
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Supabase
- **Blockchain**: Sepolia Testnet

## 🎯 Step-by-Step Deployment

### 1. Update Railway (Backend)

#### A. Environment Variables in Railway Dashboard
```bash
# Navigate to: Railway Dashboard > Your Project > Variables
# Add these variables:

DATABASE_URL=postgresql://postgres.itcrmiztwztrldvodmjt:postgres@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
JWT_SECRET=your-super-secret-jwt-key-change-in-production
DEFAULT_MODE=blockchain
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/1ba97db50e5a4b12b378b340284b81c1
NEXT_PUBLIC_CONTRACT_ADDRESS=0x176D598796508296b0d514CbC775AD65977fc9Cc
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/1ba97db50e5a4b12b378b340284b81c1
NODE_ENV=production
PORT=3001
```

#### B. Deploy to Railway
```bash
# Push your code to the Railway-connected Git repository
git add .
git commit -m "Add blockchain support for production"
git push origin main

# Railway will automatically redeploy
```

#### C. Verify Backend
```bash
# Check these URLs after deployment:
https://your-railway-app.railway.app/health
https://your-railway-app.railway.app/info
https://your-railway-app.railway.app/api/hackathons?mode=blockchain
```

### 2. Update Vercel (Frontend)

#### A. Environment Variables in Vercel Dashboard
```bash
# Navigate to: Vercel Dashboard > Your Project > Settings > Environment Variables
# Add these variables:

NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
NEXT_PUBLIC_CONTRACT_ADDRESS=0x176D598796508296b0d514CbC775AD65977fc9Cc
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/1ba97db50e5a4b12b378b340284b81c1
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_DEFAULT_MODE=blockchain
```

#### B. Deploy to Vercel
```bash
# Push your code to the Vercel-connected Git repository
git add .
git commit -m "Add blockchain frontend configuration"
git push origin main

# Vercel will automatically redeploy
```

#### C. Verify Frontend
```bash
# Check your Vercel domain:
https://your-app.vercel.app
```

### 3. Supabase (Database) - Already Configured ✅

Your Supabase database is already set up and connected. The connection string is working:
```
postgresql://postgres.itcrmiztwztrldvodmjt:postgres@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
```

## 🔧 Quick Commands for Local Testing Before Deploy

### Test Backend Locally (Production Mode)
```bash
cd C:\Users\namanbhat\hackathon-platform
$env:NODE_ENV='production'
$env:DATABASE_URL='postgresql://postgres.itcrmiztwztrldvodmjt:postgres@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres'
$env:JWT_SECRET='your-super-secret-jwt-key-change-in-production'
$env:DEFAULT_MODE='blockchain'
npm run server
```

### Test API Endpoints
```bash
# Health check
Invoke-WebRequest -Uri "http://localhost:3001/health"

# Info endpoint
Invoke-WebRequest -Uri "http://localhost:3001/info"

# Hackathons (blockchain mode)
Invoke-WebRequest -Uri "http://localhost:3001/api/hackathons?mode=blockchain"

# Individual hackathon
Invoke-WebRequest -Uri "http://localhost:3001/api/hackathons/1"

# Projects
Invoke-WebRequest -Uri "http://localhost:3001/api/projects"

# Individual project
Invoke-WebRequest -Uri "http://localhost:3001/api/projects/3-1"
```

## 🚀 Post-Deployment Verification

### 1. Backend Health Check
```bash
curl https://your-railway-app.railway.app/health
# Expected: {"status":"ok","timestamp":"2025-11-28T..."}

curl https://your-railway-app.railway.app/info
# Expected: {"name":"Hackathon Platform API","mode":"blockchain",...}
```

### 2. Frontend Functionality
- ✅ Hackathon list loads with correct prize pools (10,000 HC, 15,000 HC, 20,000 HC)
- ✅ Individual hackathon pages show prizes and schedules
- ✅ Project list shows 4 blockchain projects
- ✅ Individual project pages load correctly
- ✅ Wallet authentication works (MetaMask integration)

### 3. Blockchain Integration
- ✅ Smart contract data loads correctly
- ✅ Prize pools display from contract (not database)
- ✅ Projects load from blockchain
- ✅ Schedules generated from contract dates

## 🔒 Security Considerations

### 1. Environment Variables
- ✅ Never commit private keys to git
- ✅ Use strong JWT secrets in production
- ✅ Database connection uses SSL (Supabase default)

### 2. CORS Configuration
The backend is configured to allow requests from your Vercel domain. Update if needed:
```typescript
// In server/index.ts
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-app.vercel.app'],
  credentials: true
}));
```

## 📊 Expected Results

After successful deployment:

### Backend (Railway)
- ✅ API responds at `https://your-railway-app.railway.app`
- ✅ Connects to Supabase database
- ✅ Returns blockchain data from Sepolia contract
- ✅ Handles wallet authentication

### Frontend (Vercel)
- ✅ Loads at `https://your-app.vercel.app`
- ✅ Connects to Railway backend API
- ✅ Shows hackathons with correct prize pools
- ✅ MetaMask wallet integration works
- ✅ All project and hackathon pages functional

### Database (Supabase)
- ✅ Stores user authentication data
- ✅ Fallback data for non-blockchain modes
- ✅ Audit logs and metadata

## 🛠️ Troubleshooting

### Common Issues:

1. **CORS Errors**: Update allowed origins in backend
2. **Environment Variables**: Ensure all required vars are set
3. **Database Connection**: Verify Supabase connection string
4. **Contract Address**: Ensure correct Sepolia contract address
5. **RPC Issues**: Verify Infura URL and API key

### Debug Commands:
```bash
# Check backend logs in Railway dashboard
# Check Vercel deployment logs
# Test individual API endpoints
# Verify environment variables are loaded
```

## 🎉 Success Indicators

✅ **Hackathon List**: Shows 3 hackathons with prize pools (10K, 15K, 20K HC)  
✅ **Project Pages**: 4 projects load correctly (3-1, 2-1, 1-1, 1-2)  
✅ **Wallet Auth**: MetaMask connection and signing works  
✅ **API Health**: All endpoints respond correctly  
✅ **No [object Object]**: Prize amounts display as numbers  

Your blockchain-enabled hackathon platform will be fully functional in production! 🚀