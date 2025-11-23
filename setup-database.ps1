# Database Setup Script for Hackathon Platform
# This script will reset and seed your local database

Write-Host "🚀 Hackathon Platform - Database Setup" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, 'Process')
        }
    }
    Write-Host "✅ Loaded environment variables from .env" -ForegroundColor Green
} else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit 1
}

# Get database credentials
$DB_HOST = $env:DB_HOST
$DB_PORT = $env:DB_PORT
$DB_NAME = $env:DB_NAME
$DB_USER = $env:DB_USER
$DB_PASSWORD = $env:DB_PASSWORD

if (-not ($DB_HOST -and $DB_PORT -and $DB_NAME -and $DB_USER -and $DB_PASSWORD)) {
    Write-Host "❌ Missing database environment variables!" -ForegroundColor Red
    Write-Host "Please ensure .env file contains: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD" -ForegroundColor Yellow
    exit 1
}

Write-Host "📊 Database Configuration:" -ForegroundColor Yellow
Write-Host "   Host: $DB_HOST" -ForegroundColor Gray
Write-Host "   Port: $DB_PORT" -ForegroundColor Gray
Write-Host "   Database: $DB_NAME" -ForegroundColor Gray
Write-Host "   User: $DB_USER" -ForegroundColor Gray
Write-Host ""

# Confirm reset
Write-Host "⚠️  WARNING: This will DROP and recreate the database!" -ForegroundColor Yellow
$confirm = Read-Host "Are you sure you want to continue? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "❌ Database setup cancelled." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🔄 Resetting database..." -ForegroundColor Cyan

# Set PGPASSWORD environment variable for psql
$env:PGPASSWORD = $DB_PASSWORD

# Drop and recreate database
Write-Host "   Dropping existing database..." -ForegroundColor Gray
$dropCmd = "DROP DATABASE IF EXISTS $DB_NAME;"
$dropCmd | psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres 2>&1 | Out-Null

Write-Host "   Creating fresh database..." -ForegroundColor Gray
$createCmd = "CREATE DATABASE $DB_NAME;"
$createCmd | psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create database!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Database reset complete!" -ForegroundColor Green
Write-Host ""

# Run schema
Write-Host "📋 Creating database schema..." -ForegroundColor Cyan
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f lib/db/schema.sql

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create schema!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Schema created successfully!" -ForegroundColor Green
Write-Host ""

# Run seed data
Write-Host "🌱 Seeding database with sample data..." -ForegroundColor Cyan
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f lib/db/seed-complete.sql

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to seed database!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Database seeded successfully!" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "🎉 Database Setup Complete!" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Seeded Data Summary:" -ForegroundColor Yellow
Write-Host "   • 6 test users (1 organizer, 2 judges, 3 participants)" -ForegroundColor Gray
Write-Host "   • 7 hackathons (3 active, 4 upcoming)" -ForegroundColor Gray
Write-Host "   • 28 prizes across all hackathons" -ForegroundColor Gray
Write-Host "   • 28 schedule events" -ForegroundColor Gray
Write-Host "   • 5 registrations" -ForegroundColor Gray
Write-Host "   • 5 sample projects" -ForegroundColor Gray
Write-Host "   • 21 FAQs" -ForegroundColor Gray
Write-Host ""
Write-Host "🔐 Test User Credentials:" -ForegroundColor Yellow
Write-Host "   Email: organizer@test.com | Password: password123" -ForegroundColor Gray
Write-Host "   Email: judge1@test.com | Password: password123" -ForegroundColor Gray
Write-Host "   Email: judge2@test.com | Password: password123" -ForegroundColor Gray
Write-Host "   Email: participant1@test.com | Password: password123" -ForegroundColor Gray
Write-Host "   Email: participant2@test.com | Password: password123" -ForegroundColor Gray
Write-Host "   Email: participant3@test.com | Password: password123" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 You can now start your application with: npm run start-all" -ForegroundColor Cyan
Write-Host ""

# Clear password from environment
Remove-Item Env:PGPASSWORD
