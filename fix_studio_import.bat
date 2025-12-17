@echo off
REM ServiceNow Studio Import Fix Script
REM This script moves ServiceNow files to repository root

echo ===================================================================
echo    ServiceNow Studio Import Fix
echo ===================================================================
echo.

echo This script will:
echo 1. Copy ServiceNow files to repository root
echo 2. Commit the changes
echo 3. Prepare for GitHub push
echo.

pause

echo.
echo Step 1: Copying files to root...
echo.

REM Copy source control properties
if exist "block-01-app-shell\src\sn_source_control.properties" (
    copy "block-01-app-shell\src\sn_source_control.properties" .
    echo ✓ Copied sn_source_control.properties
) else (
    echo ✗ ERROR: Source file not found!
    echo    Make sure you're in the pushup_sn_repo directory
    pause
    exit /b 1
)

REM Create sys_app directory if it doesn't exist
if not exist "sys_app\" mkdir sys_app

REM Copy application XML
if exist "block-01-app-shell\src\sys_app\x_fitchal_fitness.xml" (
    copy "block-01-app-shell\src\sys_app\x_fitchal_fitness.xml" sys_app\
    echo ✓ Copied x_fitchal_fitness.xml to sys_app\
) else (
    echo ✗ ERROR: Application XML not found!
    pause
    exit /b 1
)

echo.
echo Step 2: Adding files to Git...
echo.

git add sn_source_control.properties sys_app/

echo.
echo Step 3: Committing changes...
echo.

git commit -m "Fix: Move ServiceNow files to root for Studio import"

echo.
echo ===================================================================
echo    Fix Applied Successfully!
echo ===================================================================
echo.
echo Your repository structure is now:
echo   pushup_sn_repo\
echo   ├── sn_source_control.properties  ← At root (Studio can find it!)
echo   ├── sys_app\
echo   │   └── x_fitchal_fitness.xml     ← At root (Studio can find it!)
echo   └── ... (other files)
echo.
echo ===================================================================
echo    Next Step: Push to GitHub
echo ===================================================================
echo.
echo Run this command to push the fix to GitHub:
echo.
echo   git push origin main
echo.
echo Or if that fails:
echo.
echo   git push origin main --force
echo.
echo ===================================================================
echo    Then: Try Studio Import Again
echo ===================================================================
echo.
echo 1. Open ServiceNow Studio
echo 2. Go to: File → Import From Source Control
echo 3. Select your repository
echo 4. Should now see "Application: FitChallenge"
echo 5. Click Import
echo.

pause
