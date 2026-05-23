#!/usr/bin/env pwsh

Write-Host "`n" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  INDOOR SMART VENUE NAVIGATION SYSTEM" -ForegroundColor Cyan
Write-Host "  Quick Start Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "`n"

# Check if Node.js is installed
$nodeCheck = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Then run this script again.`n"
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✓ Node.js version: $nodeCheck" -ForegroundColor Green

# Check if MongoDB is running
Write-Host "`nChecking MongoDB connection..."
try {
    $mongosh = mongosh --version 2>&1
    Write-Host "✓ MongoDB tools found" -ForegroundColor Green
} catch {
    Write-Host "⚠ MongoDB tools not found (optional for local dev)" -ForegroundColor Yellow
}

# Install Backend Dependencies
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "Installing Backend Dependencies..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install backend dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Set-Location ..

# Install Frontend Dependencies
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "Installing Frontend Dependencies..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install frontend dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Set-Location ..

# Success message
Write-Host "`n================================================" -ForegroundColor Green
Write-Host "  Dependencies Installed Successfully!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

Write-Host "`nNext Steps:`n" -ForegroundColor Cyan

Write-Host "1. START BACKEND (in new PowerShell terminal):" -ForegroundColor Yellow
Write-Host "   cd backend`n   npm run dev`n"

Write-Host "2. START FRONTEND (in another new PowerShell terminal):" -ForegroundColor Yellow
Write-Host "   cd frontend`n   npm start`n"

Write-Host "3. OPEN BROWSER:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000`n"

Write-Host "4. MONGODB (if using local database):" -ForegroundColor Yellow
Write-Host "   Make sure MongoDB is running on localhost:27017`n"

Write-Host "================================================" -ForegroundColor Green
Write-Host "For more info, see GETTING_STARTED.md" -ForegroundColor Cyan
Write-Host "================================================`n"

Read-Host "Press Enter to exit"
