# Database Verification Script
# Run this to check if your database is set up correctly

# IMPORTANT: Update the password below with your PostgreSQL password
$env:PGPASSWORD = "Naman@1999"

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Database Verification" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if database exists
Write-Host "Checking database..." -ForegroundColor Yellow
$dbExists = psql -U postgres -lqt | Select-String -Pattern "hackathon_platform"
if ($dbExists) {
    Write-Host "[OK] Database 'hackathon_platform' exists" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Database 'hackathon_platform' not found" -ForegroundColor Red
    Write-Host "  Run: .\setup-db.ps1" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Check tables
Write-Host "Checking tables..." -ForegroundColor Yellow
$tables = psql -U postgres -d hackathon_platform -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"

$expectedTables = @(
    "users",
    "hackathons", 
    "prizes",
    "schedules",
    "hackathon_judges",
    "projects",
    "project_members",
    "scores",
    "notifications",
    "registrations"
)

$tableList = $tables -split "`n" | Where-Object { $_.Trim() -ne "" } | ForEach-Object { $_.Trim() }

foreach ($table in $expectedTables) {
    if ($tableList -contains $table) {
        Write-Host "  [OK] $table" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $table" -ForegroundColor Red
    }
}
Write-Host ""

# Check data counts
Write-Host "Checking data..." -ForegroundColor Yellow

$userCount = psql -U postgres -d hackathon_platform -t -c "SELECT COUNT(*) FROM users;"
Write-Host "  Users: $($userCount.Trim())" -ForegroundColor $(if ([int]$userCount.Trim() -gt 0) { "Green" } else { "Red" })

$hackathonCount = psql -U postgres -d hackathon_platform -t -c "SELECT COUNT(*) FROM hackathons;"
Write-Host "  Hackathons: $($hackathonCount.Trim())" -ForegroundColor $(if ([int]$hackathonCount.Trim() -gt 0) { "Green" } else { "Red" })

$projectCount = psql -U postgres -d hackathon_platform -t -c "SELECT COUNT(*) FROM projects;"
Write-Host "  Projects: $($projectCount.Trim())" -ForegroundColor $(if ([int]$projectCount.Trim() -gt 0) { "Green" } else { "Red" })

$prizeCount = psql -U postgres -d hackathon_platform -t -c "SELECT COUNT(*) FROM prizes;"
Write-Host "  Prizes: $($prizeCount.Trim())" -ForegroundColor $(if ([int]$prizeCount.Trim() -gt 0) { "Green" } else { "Red" })

Write-Host ""

# List test accounts
Write-Host "Test Accounts:" -ForegroundColor Yellow
$users = psql -U postgres -d hackathon_platform -t -c "SELECT email, role FROM users ORDER BY role, email;"
Write-Host "$users" -ForegroundColor White

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Verification Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "All test accounts use password: password123" -ForegroundColor Yellow
Write-Host ""

# Clear password from environment
$env:PGPASSWORD = ""
