@echo off
REM FitChallenge - GitHub Deployment Script for Windows

echo ===================================================================
echo    FitChallenge - GitHub Push Script
echo ===================================================================
echo.

REM Configuration
set REPO_URL=https://github.com/djeganat/pushup_sn.git
set BRANCH=main

echo Repository Status:
git status
echo.

echo Recent Commits:
git log --oneline -n 3
echo.

echo ===================================================================
echo    OPTION 1: Push to Existing Repository
echo ===================================================================
echo.
echo If the repository already exists on GitHub, run:
echo.
echo   git remote add origin %REPO_URL%
echo   git push -u origin %BRANCH%
echo.

echo ===================================================================
echo    OPTION 2: Create New Repository First
echo ===================================================================
echo.
echo 1. Go to: https://github.com/djeganat
echo 2. Click 'New Repository'
echo 3. Name it: pushup_sn
echo 4. DO NOT initialize with README (we already have one)
echo 5. Click 'Create repository'
echo.
echo Then run:
echo.
echo   git remote add origin %REPO_URL%
echo   git push -u origin %BRANCH%
echo.

echo ===================================================================
echo    Authentication
echo ===================================================================
echo.
echo GitHub requires Personal Access Token (PAT) for HTTPS:
echo.
echo 1. Go to: https://github.com/settings/tokens
echo 2. Generate new token (classic)
echo 3. Select scopes: repo (all)
echo 4. Use token as password when pushing
echo.

echo ===================================================================
echo    What's Included
echo ===================================================================
echo.
echo Block 01: Application Shell (READY)
echo Documentation: README, Deployment Guide, License
echo Progress: 1/20 blocks (5%% complete)
echo.

echo Ready to push! Press any key to continue...
pause
