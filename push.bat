@echo off
cd /d "%~dp0"
git add -A
git commit -m "chore: chuyen sang PWA wrapper, tro vao Google Apps Script"
git push
pause