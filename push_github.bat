@echo off
cd /d "%~dp0"

set LOGFILE=%~dp0push_github_log.txt

echo. >> "%LOGFILE%"
echo ======================================== >> "%LOGFILE%"
echo   %DATE% %TIME% >> "%LOGFILE%"
echo ======================================== >> "%LOGFILE%"

echo.
echo ========================================
echo   PUSH PWA LEN GITHUB
echo ========================================
echo.

echo Files hien tai:
git status --short
echo.

REM Kiem tra co thay doi khong
for /f %%i in ('git status --short') do goto HAS_CHANGES
echo Khong co thay doi moi. GitHub da up to date.
echo Khong co thay doi. >> "%LOGFILE%"
echo.
pause
exit /b 0

:HAS_CHANGES
set /p MSG=Nhap mo ta thay doi (bam Enter dung mac dinh "update"): 
if "%MSG%"=="" set MSG=Update PWA wrapper

echo.
echo Dang push: %MSG%
echo.

git add -A
git commit -m "%MSG%"
git push origin main

if %ERRORLEVEL% == 0 (
    echo.
    echo [OK] Push GitHub thanh cong! >> "%LOGFILE%"
    echo Commit: %MSG% >> "%LOGFILE%"
    echo [OK] Push GitHub thanh cong!
    echo Commit: %MSG%
    echo.
    start https://github.com/lightheart55/baocaotanthuandong
) else (
    echo.
    echo [LOI] Push GitHub that bai! >> "%LOGFILE%"
    echo [LOI] Co loi! Xem push_github_log.txt
)

echo.
pause
