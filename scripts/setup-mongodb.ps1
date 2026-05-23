# MongoDB Installation Script for Windows

Write-Host ""
Write-Host "=================================================="
Write-Host "  MONGODB INSTALLATION SCRIPT FOR WINDOWS"
Write-Host "=================================================="
Write-Host ""

# Check if MongoDB is already installed
Write-Host "Checking if MongoDB is already installed..."
$mongoPath = "C:\Program Files\MongoDB\Server"
if (Test-Path $mongoPath) {
    Write-Host "[SUCCESS] MongoDB is already installed"
    exit 0
}

Write-Host "[INFO] MongoDB not found. Proceeding with download and installation..."
Write-Host ""

# Create MongoDB directory
$mongoDir = "C:\MongoDBData"
if (-not (Test-Path $mongoDir)) {
    Write-Host "Creating MongoDB data directory: $mongoDir"
    New-Item -ItemType Directory -Path $mongoDir -Force | Out-Null
    Write-Host "[OK] Directory created"
}

# Download MongoDB
$mongoVersion = "7.0.0"
$mongoUrl = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-$mongoVersion-signed.msi"
$mongoInstallerPath = "$env:TEMP\mongodb-installer.msi"

Write-Host ""
Write-Host "Downloading MongoDB $mongoVersion..."
Write-Host "URL: $mongoUrl"
Write-Host ""

try {
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $mongoUrl -OutFile $mongoInstallerPath -ErrorAction Stop
    Write-Host "[OK] Download complete: $mongoInstallerPath"
    Write-Host ""
} catch {
    Write-Host "[ERROR] Download failed: $_"
    Write-Host ""
    Write-Host "Please download manually from:"
    Write-Host "https://www.mongodb.com/try/download/community"
    Write-Host ""
    exit 1
}

# Install MongoDB
Write-Host "Installing MongoDB (this may take a few minutes)..."
Write-Host ""
try {
    $installArguments = @(
        "/i", "`"$mongoInstallerPath`"",
        "/quiet",
        "/norestart",
        "INSTALLFOLDER=`"C:\Program Files\MongoDB\Server\$mongoVersion`""
    )
    
    $process = Start-Process -FilePath "msiexec.exe" -ArgumentList $installArguments -Wait -PassThru
    
    if ($process.ExitCode -eq 0) {
        Write-Host "[OK] MongoDB installed successfully!"
        Write-Host ""
    } else {
        Write-Host "[ERROR] Installation failed with exit code: $($process.ExitCode)"
        exit 1
    }
} catch {
    Write-Host "[ERROR] Installation error: $_"
    exit 1
}

# Add MongoDB to PATH
Write-Host "Configuring MongoDB in system PATH..."
$mongoServerPath = "C:\Program Files\MongoDB\Server\$mongoVersion\bin"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")

if ($currentPath -notlike "*MongoDB*") {
    try {
        $newPath = $currentPath + ";" + $mongoServerPath
        [Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
        Write-Host "[OK] Added MongoDB to PATH"
        Write-Host ""
    } catch {
        Write-Host "[WARNING] Could not add to PATH automatically"
        Write-Host "Please add manually: $mongoServerPath"
        Write-Host ""
    }
}

# Refresh PATH in current session
$env:Path += ";$mongoServerPath"

# Create MongoDB configuration file
Write-Host "Creating MongoDB configuration..."
$mongoDataPath = "C:\MongoDBData"
$mongoLogPath = "C:\MongoDBData\mongod.log"
$configFile = "C:\mongod.cfg"

$configContent = @"
systemLog:
  destination: file
  path: $mongoLogPath
storage:
  dbPath: $mongoDataPath
net:
  bindIp: 127.0.0.1
  port: 27017
"@

$configContent | Out-File -FilePath $configFile -Encoding UTF8
Write-Host "[OK] Configuration file created: $configFile"
Write-Host ""

# Create MongoDB Service
Write-Host "Creating MongoDB as Windows Service..."
try {
    & mongod --config $configFile --install --serviceName "MongoDB"
    Write-Host "[OK] MongoDB service created"
    Write-Host ""
    
    Start-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    Write-Host "[OK] MongoDB service started"
    Write-Host ""
} catch {
    Write-Host "[WARNING] Could not create service automatically"
    Write-Host "Run as Administrator or start MongoDB manually"
    Write-Host ""
}

# Verify MongoDB
Write-Host "Verifying MongoDB installation..."
try {
    $mongoVersion = & mongod --version 2>&1 | Select-Object -First 1
    Write-Host "[OK] $mongoVersion"
    Write-Host ""
} catch {
    Write-Host "[ERROR] Could not verify installation"
    exit 1
}

Write-Host "=================================================="
Write-Host "  MONGODB INSTALLATION COMPLETE!"
Write-Host "=================================================="
Write-Host ""
Write-Host "DATABASE LOCATION: $mongoDataPath"
Write-Host "LISTENING ON: localhost:27017"
Write-Host ""
Write-Host "Next Steps:"
Write-Host "1. Return to the project directory"
Write-Host "2. Start Backend:  cd backend && npm run dev"
Write-Host "3. Start Frontend: cd frontend && npm start"
Write-Host ""
Write-Host "The application will be available at: http://localhost:3000"
Write-Host ""
