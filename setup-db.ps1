# Database Setup Script
# This script will create and initialize the PostgreSQL database

# IMPORTANT: Update the password below with your PostgreSQL password
$env:PGPASSWORD = "Naman@1999"

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Database Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Create database
Write-Host "1. Creating database..." -ForegroundColor Yellow
$createResult = psql -U postgres -c "CREATE DATABASE hackathon_platform;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   [OK] Database created successfully" -ForegroundColor Green
} else {
    if ($createResult -like "*already exists*") {
        Write-Host "   [WARNING] Database already exists (skipping)" -ForegroundColor Yellow
    } else {
        Write-Host "   [ERROR] Failed to create database" -ForegroundColor Red
        Write-Host "   Error: $createResult" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# Initialize schema
Write-Host "2. Initializing schema..." -ForegroundColor Yellow
psql -U postgres -d hackathon_platform -f lib/db/schema.sql
if ($LASTEXITCODE -eq 0) {
    Write-Host "   [OK] Schema created successfully" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] Failed to create schema" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Seed data
Write-Host "3. Seeding test data..." -ForegroundColor Yellow
psql -U postgres -d hackathon_platform -f lib/db/seed.sql
if ($LASTEXITCODE -eq 0) {
    Write-Host "   [OK] Test data seeded successfully" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] Failed to seed data" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Verify setup
Write-Host "4. Verifying setup..." -ForegroundColor Yellow
Write-Host ""

# Check tables
Write-Host "   Checking tables..." -ForegroundColor Cyan
$tableCount = psql -U postgres -d hackathon_platform -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
Write-Host "   [OK] Tables created: $($tableCount.Trim())" -ForegroundColor Green

# Check users
$userCount = psql -U postgres -d hackathon_platform -t -c "SELECT COUNT(*) FROM users;"
Write-Host "   [OK] Test users: $($userCount.Trim())" -ForegroundColor Green

# Check hackathons
$hackathonCount = psql -U postgres -d hackathon_platform -t -c "SELECT COUNT(*) FROM hackathons;"
Write-Host "   [OK] Test hackathons: $($hackathonCount.Trim())" -ForegroundColor Green

# Check projects
$projectCount = psql -U postgres -d hackathon_platform -t -c "SELECT COUNT(*) FROM projects;"
Write-Host "   [OK] Test projects: $($projectCount.Trim())" -ForegroundColor Green

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Database Setup Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start blockchain: npx hardhat node" -ForegroundColor White
Write-Host "2. Deploy contracts: npx hardhat run scripts/deploy.js --network localhost" -ForegroundColor White
Write-Host "3. Start backend: npx ts-node server/index.ts" -ForegroundColor White
Write-Host "4. Start frontend: npm run dev" -ForegroundColor White
Write-Host ""

# Clear password from environment
$env:PGPASSWORD = ""
