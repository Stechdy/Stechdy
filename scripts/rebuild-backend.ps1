# PowerShell script to rebuild and deploy backend

Write-Host "🔨 Rebuilding and deploying backend..." -ForegroundColor Cyan

# Configuration
$DOCKER_USERNAME = if ($env:DOCKER_USERNAME) { $env:DOCKER_USERNAME } else { "tranvukien125" }
$BACKEND_DIR = ".\Stechdy_BE\backend"
$IMAGE_NAME = "stechdy-backend"
$FULL_IMAGE = "$DOCKER_USERNAME/$IMAGE_NAME:latest"

# Navigate to project root
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_DIR
Set-Location $PROJECT_ROOT

Write-Host "📦 Building Docker image..." -ForegroundColor Yellow
Set-Location $BACKEND_DIR
docker build -t $FULL_IMAGE .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "📤 Pushing image to Docker Hub..." -ForegroundColor Yellow
docker push $FULL_IMAGE

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Image built and pushed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Now you can deploy on the server with:" -ForegroundColor Yellow
Write-Host "ssh root@stechdy.ai.vn `"cd /opt/stechdy && docker compose pull backend && docker compose up -d backend`"" -ForegroundColor Green
Write-Host ""
Write-Host "Or run the full deployment:" -ForegroundColor Yellow
Write-Host "ssh root@stechdy.ai.vn `"cd /opt/stechdy && bash deploy.sh`"" -ForegroundColor Green
