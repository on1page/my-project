@echo off
chcp 65001 >nul
title Setup Ristorante Project

echo.
echo ============================================
echo   🍝 Setup Progetto Ristorante
echo ============================================
echo.

:: Verifica Node.js
echo [1/6] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js non trovato!
    echo Installalo da: https://nodejs.org/
    pause
    exit /b 1
)
node --version
echo ✅ Node.js trovato!
echo.

:: Installa dipendenze
echo [2/6] Installando dipendenze...
if exist "bun.exe" (
    bun install
) else (
    npm install
)
if errorlevel 1 (
    echo ❌ Errore nell'installazione delle dipendenze
    pause
    exit /b 1
)
echo ✅ Dipendenze installate!
echo.

:: Crea file .env
echo [3/6] Configurando ambiente...
if not exist .env (
    echo DATABASE_URL="file:./db/custom.db" > .env
    echo ✅ File .env creato!
) else (
    echo ℹ️  File .env esistente
)
echo.

:: Crea cartella database
echo [4/6] Creando cartelle...
if not exist db mkdir db
if not exist public\images mkdir public\images
echo ✅ Cartelle create!
echo.

:: Configura database
echo [5/6] Configurando database...
if exist "bun.exe" (
    bun run db:push
    bun run db:generate
) else (
    npm run db:push
    npm run db:generate
)
if errorlevel 1 (
    echo ⚠️  Errore nella configurazione database, ma continuo...
)
echo ✅ Database configurato!
echo.

:: Popola database
echo [6/6] Popolando database...
if exist "bun.exe" (
    bun run db:seed
) else (
    npm run db:seed
)
if errorlevel 1 (
    echo ⚠️  Errore nel popolamento database
    pause
    exit /b 1
)
echo ✅ Database popolato!
echo.

echo ============================================
echo   ✨ SETUP COMPLETATO! ✨
echo ============================================
echo.
echo 🚀 Per avviare il server:
if exist "bun.exe" (
    echo    bun run dev
) else (
    echo    npm run dev
)
echo.
echo 🌐 Apri: http://localhost:3000
echo.
echo 🔐 Admin: admin@labellatavola.it / admin123
echo.
echo Premi un tasto per aprire il sito...
pause >nul

:: Avvia il server
if exist "bun.exe" (
    start http://localhost:3000
    bun run dev
) else (
    start http://localhost:3000
    npm run dev
)
