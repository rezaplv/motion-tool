@echo off
setlocal
echo ==============================================
echo  ZAE MOTION - Auto Git Sync & Push
echo ==============================================

set "GIT=C:\Users\lenovo\AppData\Local\Programs\PortableGit\cmd\git.exe"

if not exist "%GIT%" (
    where git >nul 2>nul
    if %errorlevel% equ 0 (
        set "GIT=git"
    ) else (
        echo [ERROR] Git tidak ditemukan!
        pause
        exit /b 1
    )
)

echo [1/3] Menambahkan file yang berubah...
"%GIT%" add .

echo [2/3] Membuat commit...
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set "stamp=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2% %datetime:~8,2%:%datetime:~10,2%"
"%GIT%" commit -m "Auto sync: %stamp%"

echo [3/3] Mengunggah ke GitHub (origin/main)...
"%GIT%" push origin main

if %errorlevel% equ 0 (
    echo.
    echo ==============================================
    echo  [BERHASIL] Repository berhasil disinkronkan!
    echo ==============================================
) else (
    echo.
    echo [WARNING] Ada kendala saat push, silakan periksa koneksi.
)

pause
