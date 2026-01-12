@echo off
REM Biometric System - Namecheap Deployment Script (Windows)
REM Run this script to prepare files for upload

echo.
echo ========================================
echo   Biometric System Build for Namecheap
echo ========================================
echo.

cd frontend

echo [1/3] Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo Error: npm install failed
    pause
    exit /b 1
)

echo.
echo [2/3] Building production bundle...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Error: Build failed
    pause
    exit /b 1
)

echo.
echo [3/3] Creating deployment package...
cd build
echo Build folder ready at: %CD%

cd ..\..

echo.
echo ========================================
echo   BUILD COMPLETE!
echo ========================================
echo.
echo Files ready in: frontend\build\
echo.
echo NEXT STEPS FOR NAMECHEAP UPLOAD:
echo --------------------------------
echo 1. Login to cPanel (yourdomain.com/cpanel)
echo 2. Open File Manager
echo 3. Navigate to public_html folder
echo 4. Delete default index.html and placeholder files
echo 5. Upload ALL files from frontend\build\
echo 6. Upload .htaccess from frontend folder
echo 7. Go to SSL/TLS Status and enable AutoSSL
echo 8. Visit https://yourdomain.com
echo.
echo Full guide: NAMECHEAP_DEPLOYMENT.md
echo.
pause
