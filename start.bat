@echo off
setlocal
title Motion Studio Local Server
echo ========================================================
echo  Motion Studio - Starting Local Server
echo ========================================================
echo.

cd /d "%~dp0"

echo Membuka browser ke http://localhost:5173/ ...
start http://localhost:5173/

echo Menjalankan Vite dev server...
npm run dev

pause
