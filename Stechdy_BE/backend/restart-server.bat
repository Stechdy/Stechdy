@echo off
echo.
echo ================================================================
echo   RESTARTING STECHDY BACKEND SERVER
echo ================================================================
echo.
echo 🛑 Step 1: Stopping current server...
echo.

REM Kill all node processes running server.js
for /f "tokens=2" %%i in ('tasklist ^| findstr /i "node.exe"') do (
    wmic process where "ProcessId=%%i and CommandLine like '%%server.js%%'" delete >nul 2>&1
)

echo ✅ Server stopped
echo.
echo 🚀 Step 2: Starting server with updated code...
echo.

cd /d "%~dp0"
start "Stechdy Backend" cmd /k "npm start"

timeout /t 3 /nobreak >nul

echo.
echo ================================================================
echo ✅ Server restarted successfully!
echo ================================================================
echo.
echo 📊 Watch the server terminal for these logs:
echo    - "Session reminder scheduler initialized"
echo    - "🔍 [time] Checking X session(s) for reminders..."
echo    - "✅ Session in reminder window (14-16 min)"
echo    - "📧 Sending reminder email..."
echo.
echo 📬 Email should arrive within 1-2 minutes at:
echo    tai05112004@gmail.com
echo.
echo ================================================================
pause
