# Development Server Startup Script
# This script ensures Prisma Client is properly configured before starting the server

Write-Host "`nStarting Blood Bank Management System..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# Set the DATABASE_URL environment variable
$env:DATABASE_URL = "postgresql://postgres:Nitika%407238@localhost:5432/bloodlink_dev?schema=public"

# Generate Prisma Client
Write-Host "Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate | Out-Host

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Prisma Client generated successfully`n" -ForegroundColor Green
    
    # Start the development server
    Write-Host "Starting Next.js development server..." -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan
    
    npm run dev
} else {
    Write-Host "`n✗ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}
