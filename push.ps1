Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Smart Budget Tracker - GitHub Push Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Set-Location "e:\Antigravity\Budget tracker"

Write-Host "[1/3] Setting remote origin..." -ForegroundColor Yellow
git remote set-url origin https://github.com/thoratsahil27-dotcom/budget-tracker.git

Write-Host "[2/3] Setting default branch to main..." -ForegroundColor Yellow
git branch -M main

Write-Host "[3/3] Pushing to GitHub (Sign in if prompted)..." -ForegroundColor Green
git push -u origin main

Write-Host ""
Write-Host "Push completed! Press any key to exit." -ForegroundColor Cyan
Read-Host -Prompt "Press Enter to exit"
