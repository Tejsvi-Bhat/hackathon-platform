Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Hackathon Platform Setup Check" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking Node.js..." -ForegroundColor Yellow
node --version
Write-Host ""

Write-Host "Checking npm..." -ForegroundColor Yellow
npm --version
Write-Host ""

Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "Dependencies NOT installed. Run: npm install" -ForegroundColor Red
}
Write-Host ""

Write-Host "Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host ".env file exists" -ForegroundColor Green
} else {
    Write-Host ".env file NOT found" -ForegroundColor Red
}
Write-Host ""

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "1. Create database: CREATE DATABASE hackathon_platform;" -ForegroundColor White
Write-Host "2. Run schema: psql -U postgres -d hackathon_platform -f lib/db/schema.sql" -ForegroundColor White
Write-Host "3. Seed data: psql -U postgres -d hackathon_platform -f lib/db/seed.sql" -ForegroundColor White
Write-Host "4. Start blockchain: npx hardhat node" -ForegroundColor White
Write-Host "5. Deploy contracts: npx hardhat run scripts/deploy.js --network localhost" -ForegroundColor White
Write-Host "6. Start backend: npx ts-node server/index.ts" -ForegroundColor White
Write-Host "7. Start frontend: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "See SETUP.md for detailed instructions" -ForegroundColor Yellow
