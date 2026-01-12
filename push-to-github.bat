@echo off
echo.
echo ========================================
echo   Push Biometric System to GitHub
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Git is not installed!
    echo Please download from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [Step 1/6] Initializing Git repository...
git init

if %ERRORLEVEL% NEQ 0 (
    echo Git already initialized or error occurred
)

echo.
echo [Step 2/6] Adding all files to staging...
git add .

echo.
echo [Step 3/6] Creating commit...
git commit -m "Initial commit: Multimodal biometric authentication system with face and fingerprint recognition"

echo.
echo ========================================
echo   IMPORTANT: GitHub Setup Required
echo ========================================
echo.
echo Before continuing, you need to:
echo 1. Go to: https://github.com/new
echo 2. Create a new repository
echo 3. Name it: biometric-authentication-system
echo 4. DO NOT initialize with README
echo 5. Copy the repository URL
echo.
echo Repository URL format:
echo https://github.com/YOUR_USERNAME/biometric-authentication-system.git
echo.
set /p REPO_URL="Paste your GitHub repository URL here: "

if "%REPO_URL%"=="" (
    echo ERROR: No URL provided
    pause
    exit /b 1
)

echo.
echo [Step 4/6] Adding GitHub remote...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo.
echo [Step 5/6] Renaming branch to main...
git branch -M main

echo.
echo [Step 6/6] Pushing to GitHub...
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo   Authentication Required
    echo ========================================
    echo.
    echo If push failed, you may need to:
    echo 1. Configure Git credentials:
    echo    git config --global user.name "Your Name"
    echo    git config --global user.email "your@email.com"
    echo.
    echo 2. Authenticate with GitHub:
    echo    - Use Personal Access Token
    echo    - Or GitHub CLI: gh auth login
    echo.
    echo 3. Try push again:
    echo    git push -u origin main
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SUCCESS! Project Pushed to GitHub
echo ========================================
echo.
echo Your repository is now live at:
echo %REPO_URL%
echo.
echo Next steps:
echo - Visit your repository on GitHub
echo - Add topics: biometric, deep-learning, react, flask
echo - Add screenshots to README
echo - Share with the world!
echo.
pause
