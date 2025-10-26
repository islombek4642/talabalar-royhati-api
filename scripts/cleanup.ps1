# Cleanup Script for Talabalar Royhati API
# Run this script to remove temporary and test files

Write-Host "Starting Project Cleanup..." -ForegroundColor Cyan

# Change to project root
Set-Location $PSScriptRoot\..

# Delete temporary test files
Write-Host "`nRemoving temporary test files..." -ForegroundColor Yellow
$testFiles = @(
    "check-admin-role.js",
    "check-db.js",
    "check-duplicate-emails.js",
    "test-email-lookup.js",
    "test_import.csv"
)

foreach ($file in $testFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  [OK] Deleted: $file" -ForegroundColor Green
    }
}

# Delete temporary SQL files
Write-Host "`nRemoving temporary SQL files..." -ForegroundColor Yellow
$sqlFiles = @(
    "add-admin-role.sql",
    "clear-students.sql",
    "fix-student-data.sql"
)

foreach ($file in $sqlFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  [OK] Deleted: $file" -ForegroundColor Green
    }
}

# Delete temporary Prisma scripts
Write-Host "`nRemoving temporary Prisma scripts..." -ForegroundColor Yellow
$prismaFiles = @(
    "prisma/check-users.ts",
    "prisma/update-to-super-admin.ts"
)

foreach ($file in $prismaFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  [OK] Deleted: $file" -ForegroundColor Green
    }
}

# Delete security files (should not be in repo)
Write-Host "`nRemoving security files..." -ForegroundColor Yellow
if (Test-Path "keypair.pem") {
    Remove-Item "keypair.pem" -Force
    Write-Host "  [OK] Deleted: keypair.pem" -ForegroundColor Green
}

# Delete IDE settings
Write-Host "`nRemoving IDE settings..." -ForegroundColor Yellow
if (Test-Path ".vscode") {
    Remove-Item ".vscode" -Recurse -Force
    Write-Host "  [OK] Deleted: .vscode/" -ForegroundColor Green
}

# Delete coverage reports
Write-Host "`nRemoving coverage reports..." -ForegroundColor Yellow
if (Test-Path "coverage") {
    Remove-Item "coverage" -Recurse -Force
    Write-Host "  [OK] Deleted: coverage/" -ForegroundColor Green
}

# Remove from Git cache
Write-Host "`nRemoving tracked files from Git cache..." -ForegroundColor Yellow
git rm --cached keypair.pem 2>$null
git rm --cached -r .vscode/ 2>$null
git rm --cached -r coverage/ 2>$null

Write-Host "`nCleanup completed!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Review changes: git status"
Write-Host "  2. Commit changes: git add . && git commit -m ""chore: cleanup temporary files"""
Write-Host "  3. Push to repository: git push"
