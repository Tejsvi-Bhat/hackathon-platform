#!/usr/bin/env pwsh
# Startup script for Hackathon Platform
# This script starts all required services: Hardhat blockchain, Backend API, and Frontend

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Hackathon Platform Startup Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Change to the project directory
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectPath

# Kill any existing node processes to avoid port conflicts
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Services will start in this order:" -ForegroundColor Cyan
Write-Host "  1. Hardhat Blockchain (http://127.0.0.1:8545)" -ForegroundColor White
Write-Host "  2. Smart Contract Deployment" -ForegroundColor White
Write-Host "  3. Backend API (http://localhost:3001)" -ForegroundColor White
Write-Host "  4. Frontend (http://localhost:3000)" -ForegroundColor White
Write-Host ""
Write-Host "Test Accounts:" -ForegroundColor Cyan
Write-Host "  - hacker1@test.com    / password123" -ForegroundColor White
Write-Host "  - judge1@test.com     / password123" -ForegroundColor White
Write-Host "  - organizer1@test.com / password123" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop all services..." -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Run concurrently to start all services
npm run start-all
