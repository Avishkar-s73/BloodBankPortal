# Run Workflow Migration SQL
# This script executes the migration SQL file against PostgreSQL

Write-Host ""
Write-Host "Blood Request Workflow Migration" -ForegroundColor Cyan
Write-Host ""

# Database connection parameters
$env:PGPASSWORD = "Nitika@7238"
$dbHost = "localhost"
$dbPort = "5432"
$dbName = "bloodlink_dev"
$dbUser = "postgres"
$sqlFile = "migration-workflow.sql"

Write-Host "Connection Details:" -ForegroundColor Yellow
Write-Host "   Host: $dbHost"
Write-Host "   Port: $dbPort"
Write-Host "   Database: $dbName"
Write-Host "   User: $dbUser"
Write-Host "   SQL File: $sqlFile"
Write-Host ""

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "psql command not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Run the SQL manually:" -ForegroundColor Yellow
    Write-Host "   1. Open pgAdmin"
    Write-Host "   2. Connect to database: $dbName"
    Write-Host "   3. Open Query Tool"
    Write-Host "   4. Copy and run contents from: $sqlFile"
    Write-Host ""
    
    # Display the SQL content
    Write-Host "SQL Content to Run:" -ForegroundColor Cyan
    Write-Host "=" * 70
    Get-Content $sqlFile | Write-Host -ForegroundColor White
    Write-Host "=" * 70
    
    exit 1
}

# Run the migration
Write-Host "Running migration..." -ForegroundColor Yellow
Write-Host ""

try {
    psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $sqlFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Migration completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "   1. Run: npx prisma generate"
        Write-Host "   2. Start the dev server: npm run dev"
        Write-Host "   3. Test the new endpoints"
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "Migration failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "Error running migration: $_" -ForegroundColor Red
} finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
