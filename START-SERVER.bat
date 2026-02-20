@echo off
echo ========================================
echo   YojnaXpert - Government Scheme Finder
echo ========================================
echo.

echo [1/3] Checking Node.js...
node --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found!
    echo Please download from: https://nodejs.org
    pause
    exit
)
echo Node.js found!

echo.
echo [2/3] Installing dependencies...
IF EXIST node_modules (
    echo node_modules already exists, skipping install...
) ELSE (
    npm install
    IF %ERRORLEVEL% NEQ 0 (
        echo ERROR: npm install failed!
        pause
        exit
    )
    echo Dependencies installed!
)

echo.
echo [3/3] Starting server...
echo.
echo ========================================
echo  Backend running at: http://localhost:5000
echo  Keep this window OPEN!
echo  Now open index.html in your browser!
echo ========================================
echo.
node server.js
pause
