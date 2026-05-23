@echo off
REM Indoor Smart Venue Navigation System - Quick Start Script

echo.
echo ================================================
echo   INDOOR SMART VENUE NAVIGATION SYSTEM
echo   Quick Start Setup
echo ================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Then run this script again.
    pause
    exit /b 1
)

REM Check if MongoDB is installed/running
echo Checking MongoDB connection...
(
    echo use admin
    echo db.adminCommand('ping')
) | mongosh localhost 27017 >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: MongoDB may not be running!
    echo Please start MongoDB before running the app.
)

echo.
echo Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo Installing Frontend Dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo ================================================
echo   Dependencies Installed Successfully!
echo ================================================
echo.
echo Next Steps:
echo.
echo 1. START BACKEND (in new terminal):
echo    cd backend
echo    npm run dev
echo.
echo 2. START FRONTEND (in another new terminal):
echo    cd frontend
echo    npm start
echo.
echo 3. OPEN BROWSER:
echo    http://localhost:3000
echo.
echo ================================================
pause
