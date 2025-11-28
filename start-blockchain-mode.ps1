# Start both backend server and frontend with proper environment variables
Write-Host "🚀 Starting Hackathon Platform (Blockchain Mode)..." -ForegroundColor Cyan
Write-Host ""

# Set database URL
$env:DATABASE_URL='postgresql://postgres.itcrmiztwztrldvodmjt:postgres@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres'
Write-Host "✓ DATABASE_URL configured" -ForegroundColor Green

# Start backend server in background
$backendJob = Start-Job -ScriptBlock {
    param($dbUrl)
    $env:DATABASE_URL = $dbUrl
    Set-Location "C:\Users\namanbhat\hackathon-platform"
    npm run server
} -ArgumentList $env:DATABASE_URL

Write-Host "✓ Backend server starting (Port 3001)..." -ForegroundColor Green

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend in current terminal
Write-Host "✓ Starting frontend (Port 3000)..." -ForegroundColor Green
Write-Host ""
Write-Host "📍 Frontend: http://localhost:3000" -ForegroundColor Magenta
Write-Host "📍 Backend: http://localhost:3001" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host ""

Set-Location "C:\Users\namanbhat\hackathon-platform"
npm run dev

# Cleanup on exit
Stop-Job -Job $backendJob
Remove-Job -Job $backendJob
