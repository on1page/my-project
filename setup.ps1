# ============================================
# 🚀 Script di Setup Automatico - Ristorante Project (Windows)
# ============================================

$ErrorActionPreference = "Stop"

Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🍝 Setup Automatico Progetto Ristorante  ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Funzione per stampare messaggi
function Print-Success {
    param([string]$message)
    Write-Host "✅ $message" -ForegroundColor Green
}

function Print-Error {
    param([string]$message)
    Write-Host "❌ $message" -ForegroundColor Red
}

function Print-Info {
    param([string]$message)
    Write-Host "ℹ️  $message" -ForegroundColor Yellow
}

# Verifica Node.js
Write-Host "📋 Verificando Node.js..."
try {
    $nodeVersion = node --version
    Print-Success "Node.js trovato: $nodeVersion"
} catch {
    Print-Error "Node.js non è installato!"
    Write-Host "   Installalo da: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verifica Bun o npm
if (Get-Command bun -ErrorAction SilentlyContinue) {
    $packageManager = "bun"
    Print-Success "Bun trovato - userò Bun"
} elseif (Get-Command npm -ErrorAction SilentlyContinue) {
    $packageManager = "npm"
    Print-Success "npm trovato - userò npm"
} else {
    Print-Error "Né Bun né npm sono installati!"
    Write-Host "   Installa Bun: https://bun.sh/" -ForegroundColor Yellow
    Write-Host "   Oppure npm (viene con Node.js)" -ForegroundColor Yellow
    exit 1
}

# 1. Installa le dipendenze
Write-Host ""
Write-Host "📦 Step 1/5: Installazione dipendenze..."
if ($packageManager -eq "bun") {
    bun install
} else {
    npm install
}
Print-Success "Dipendenze installate!"

# 2. Crea file .env se non esiste
Write-Host ""
Write-Host "⚙️  Step 2/5: Configurazione ambiente..."
if (-not (Test-Path .env)) {
    "DATABASE_URL=`"file:./db/custom.db`"" | Out-File -Encoding utf8 .env
    Print-Success "File .env creato!"
} else {
    Print-Info "File .env esistente, mantengo quello attuale"
}

# 3. Crea cartella database se non esiste
New-Item -ItemType Directory -Force -Path db | Out-Null
Print-Success "Cartella database pronta"

# 4. Configura il database
Write-Host ""
Write-Host "🗄️  Step 3/5: Configurazione database..."
if ($packageManager -eq "bun") {
    bun run db:push
    bun run db:generate
} else {
    npm run db:push
    npm run db:generate
}
Print-Success "Database configurato!"

# 5. Popola il database con dati di esempio
Write-Host ""
Write-Host "🌱 Step 4/5: Popolamento database..."
if ($packageManager -eq "bun") {
    bun run db:seed
} else {
    npm run db:seed
}
Print-Success "Database popolato con dati di esempio!"

# 6. Crea cartella public/images se non esiste
Write-Host ""
Write-Host "🖼️  Step 5/5: Verifica immagini..."
New-Item -ItemType Directory -Force -Path public/images | Out-Null
if (-not (Test-Path "public/images/hero.jpg")) {
    Print-Info "⚠️  Attenzione: Le immagini non sono presenti nella cartella public/images/"
    Print-Info "   Le immagini verranno caricate dal database se sono state configurate lì"
} else {
    Print-Success "Immagini trovate!"
}

# Riepilogo
Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          ✨ Setup Completato! ✨          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Print-Success "Il progetto è pronto per essere avviato!"
Write-Host ""
Write-Host "🚀 Per avviare il server di sviluppo:"
if ($packageManager -eq "bun") {
    Write-Host "   $ bun run dev" -ForegroundColor Green
} else {
    Write-Host "   $ npm run dev" -ForegroundColor Green
}
Write-Host ""
Write-Host "🌐 Il sito sarà disponibile su: " -NoNewline
Write-Host "http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "🔐 Credenziali Admin:"
Write-Host "   Email: " -NoNewline
Write-Host "admin@labellatavola.it" -ForegroundColor Green
Write-Host "   Password: " -NoNewline
Write-Host "admin123" -ForegroundColor Green
Write-Host ""
Print-Info "Per accedere al pannello admin, clicca sul pulsante 'Admin' nell'header del sito"
Write-Host ""
Write-Host "📚 Altri comandi utili:"
Write-Host "   • $ bun run dev          - Avvia server sviluppo"
Write-Host "   • $ bun run build        - Crea build produzione"
Write-Host "   • $ bun run lint         - Controlla codice"
Write-Host "   • $ bun run db:seed      - Ripopola database"
Write-Host ""
