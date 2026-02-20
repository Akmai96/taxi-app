@echo off
chcp 65001 >nul
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "UI Redesign: Scrollable chart, pills breakdown, and tips"
"C:\Program Files\Git\cmd\git.exe" push origin main
echo.
echo === DONE ===
