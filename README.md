# 🚀 Decentralized Hackathon Platform

A full-stack Web3 hackathon platform with modern dark mode UI, blockchain integration, and comprehensive event management features.

![Platform Status](https://img.shields.io/badge/status-production--ready-success)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)

## ✨ Features

### For Organizers
- 🎯 Create and manage hackathons with detailed configurations
- 💰 Add multiple prize categories with evaluation criteria
- 📅 Schedule events and milestones
- 👨‍⚖️ Assign judges and manage evaluations
- 📊 View registrations and submitted projects
- ❓ Create FAQs for participants

### For Participants
- 🔍 Browse hackathons with advanced filters (ecosystem, tech stack, level, mode)
- 📱 Modern responsive UI with dark mode
- 🎨 Featured hackathon carousel
- ✅ Register with custom confirmation dialogs
- 📤 Submit projects with GitHub integration
- 🏆 View prizes, schedules, and FAQs

### For Judges
- 📝 Evaluate projects based on criteria
- 💬 Provide structured feedback
- ⭐ Score submissions

### Platform Features
- 🌙 Professional dark mode design (gray-950 theme)
- 🔐 JWT authentication with secure login/register modals
- 🔗 Blockchain integration with Ethereum smart contracts
- 🗄️ PostgreSQL database with 12 comprehensive tables
- 🎭 Custom confirmation dialogs (no browser alerts)
- 🔔 Toast notifications for user feedback
- 🎯 Sticky countdown timers
- 🏷️ Tagging and categorization system

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with custom dark theme
- **lucide-react** - Modern icon library

### Backend
- **Express.js** - RESTful API server
- **PostgreSQL** - Relational database with complex schemas
- **JWT** - Secure authentication
- **bcrypt** - Password hashing

### Blockchain
- **Solidity** - Smart contract development
- **Hardhat** - Development environment
- **Ethers.js** - Web3 library

### Development Tools
- **concurrently** - Multi-process management
- **dotenv** - Environment variable management
- **TypeScript ESLint** - Code quality

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### 1. Clone & Install
```powershell
git clone https://github.com/yourusername/hackathon-platform.git
cd hackathon-platform
npm install
```

### 2. Environment Setup
Create `.env` in the root directory:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hackathon_platform
DB_USER=postgres
DB_PASSWORD=your_password
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/hackathon_platform

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# API
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Database Setup
```powershell
# Option A: Automated setup (Recommended)
.\setup-database.ps1

# Option B: Manual setup
psql -U postgres -c "CREATE DATABASE hackathon_platform;"
psql -U postgres -d hackathon_platform -f lib/db/schema.sql
psql -U postgres -d hackathon_platform -f lib/db/seed-complete.sql
```

### 4. Start All Services
```powershell
# Start everything with one command
npm run start-all
```

This starts:
- 🔗 Hardhat blockchain on `http://localhost:8545`
- 🚀 Backend API on `http://localhost:3001`
- 🌐 Frontend on `http://localhost:3000`

Press `Ctrl+C` to stop all services.

## 🧪 Test Accounts

After seeding, use these accounts (password: `password123`):

| Email | Role | Purpose |
|-------|------|---------|
| `organizer@test.com` | Organizer | Create & manage hackathons |
| `judge1@test.com` | Judge | Evaluate projects |
| `judge2@test.com` | Judge | Evaluate projects |
| `participant1@test.com` | Participant | Register & submit |
| `participant2@test.com` | Participant | Register & submit |
| `participant3@test.com` | Participant | Register & submit |

## 📊 Seeded Data

The complete seed data includes:
- ✅ **7 Hackathons** - 3 active with data, 4 upcoming
- ✅ **28 Prizes** - Across all hackathons with evaluation criteria
- ✅ **28 Schedule Events** - Ceremonies, workshops, hacking periods
- ✅ **5 Judge Assignments** - Distributed across hackathons
- ✅ **5 Registrations** - Sample team registrations
- ✅ **5 Projects** - With tags, members, and images
- ✅ **21 FAQs** - 3 per hackathon

## 🌐 Deployment

### Quick Deploy to Production

See detailed guides:
- **Full Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Quick Reference**: [DEPLOY-QUICKSTART.md](./DEPLOY-QUICKSTART.md)

**TL;DR:**
1. Push to GitHub
2. Deploy frontend to **Vercel**
3. Setup **Vercel Postgres** / **Supabase** / **Neon**
4. Seed production database
5. Deploy backend to **Railway** / **Render**
6. Link frontend to backend API URL

## 📁 Project Structure

```
hackathon-platform/
├── app/                      # Next.js app directory
│   ├── hackathons/[id]/     # Dynamic hackathon detail pages
│   ├── login/               # Login redirect (to modal)
│   ├── register/            # Register redirect (to modal)
│   └── page.tsx             # Homepage with filters & carousel
├── components/              # React components
│   ├── ConfirmDialog.tsx    # Custom confirmation modals
│   ├── LoginModal.tsx       # Login/register overlay
│   ├── Sidebar.tsx          # Left navigation sidebar
│   └── TopNav.tsx           # Top navigation with search
├── contracts/               # Solidity smart contracts
│   └── HackathonPlatform.sol
├── lib/
│   └── db/                  # Database files
│       ├── schema.sql       # Complete database schema
│       ├── seed-complete.sql # All-in-one seed data
│       └── *.sql            # Individual seed files
├── server/
│   └── index.ts             # Express API server (20+ endpoints)
├── scripts/
│   └── deploy.js            # Hardhat deployment script
├── start-all.ps1            # PowerShell startup script
├── setup-database.ps1       # Database reset & seed script
├── DEPLOYMENT.md            # Comprehensive deployment guide
└── DEPLOY-QUICKSTART.md     # Quick deployment reference
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Hackathons
- `GET /api/hackathons` - List all hackathons (with filters)
- `GET /api/hackathons/:id` - Get hackathon details
- `POST /api/hackathons` - Create hackathon (organizer)
- `POST /api/hackathons/:id/register` - Register for hackathon

### Projects
- `GET /api/hackathons/:id/projects` - Get hackathon projects
- `POST /api/projects` - Submit project
- `POST /api/projects/:id/like` - Like a project

### Additional
- `GET /api/prizes/:hackathonId` - Get prizes
- `GET /api/schedules/:hackathonId` - Get schedule
- `GET /api/faqs/:hackathonId` - Get FAQs
- `GET /api/health` - Health check

## 🎨 UI Components

### Custom Components
- **ConfirmDialog** - Professional confirmation dialogs with 4 types (info, success, warning, danger)
- **LoginModal** - Overlay modal for login/register (no separate pages)
- **Sidebar** - Dark mode navigation with sections
- **TopNav** - Search, notifications, profile dropdown
- **HackathonCard** - Horizontal card with hover effects
- **CountdownTimer** - Sticky sidebar timer

### Design System
- **Color Scheme**: gray-950 (background), gray-900 (cards), gray-800 (borders)
- **Typography**: Inter font family
- **Animations**: Smooth transitions, fade-ins, hover effects
- **Responsive**: Mobile-first design with breakpoints

## 📝 Database Schema

12 interconnected tables:
- `users` - User accounts with roles
- `hackathons` - Event details with tech_stack arrays
- `prizes` - Prize categories with evaluation_criteria
- `schedules` - Event timeline with types
- `judges` - Judge assignments with expertise
- `registrations` - Team registrations
- `projects` - Submitted projects
- `project_members` - Team compositions
- `project_tags` - Project categorization
- `hackathon_faqs` - Frequently asked questions
- `likes` - Project likes tracking
- `scores` - Judge evaluations

## 🔐 Security Features

- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ CORS configuration
- ✅ Environment variable protection
- ✅ SQL injection prevention (parameterized queries)
- ✅ Input validation on forms
- ✅ Secure session management

## 🐛 Troubleshooting

### Database Connection Fails
```powershell
# Check PostgreSQL is running
Get-Service postgresql*

# Verify credentials in .env
# Ensure database exists
psql -U postgres -l
```

### Backend Won't Start
```powershell
# Check if port 3001 is in use
netstat -ano | findstr :3001

# Verify .env file exists in root
Test-Path .env
```

### Frontend Build Fails
```powershell
# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
npm install
```

### Hardhat Network Issues
```powershell
# Kill existing Hardhat processes
Get-Process node | Where-Object {$_.Path -like "*hardhat*"} | Stop-Process
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Hardhat Docs](https://hardhat.org/getting-started/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm run start-all`
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

Built with modern Web3 technologies and best practices for hackathon management.

---

**Need Help?** Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide or open an issue.
