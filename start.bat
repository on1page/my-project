@echo off
chcp 65001 >nul
title Avvio Server

echo 🚀 Avvio Server Sviluppo...
echo.

:: Prova con Bun
where bun >nul 2>&1
if %errorlevel% equ 0 (
    echo Uso Bun per avviare...
    bun run dev
) else (
    :: Altrimenti usa npm
    echo Uso npm per avviare...
    npm run dev
)

pause
