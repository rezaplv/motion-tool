@echo off
setlocal
title ZAE MOTION Local Server
echo ========================================================
echo  ZAE MOTION - Starting Local Server
echo ========================================================
echo.

cd /d "%~dp0"

echo Membuka browser ke http://localhost:5173/ ...
start http://localhost:5173/

echo Menjalankan Vite dev server...
npm run dev

pause
