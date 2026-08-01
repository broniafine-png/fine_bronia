@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0update_gallery.ps1"
echo.
echo Finished. Now commit and push the changed files in GitHub Desktop.
pause
