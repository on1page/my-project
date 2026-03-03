#!/bin/bash

# ============================================
# 🚀 Script di Setup Automatico - Ristorante Project
# ============================================

set -e  # Ferma lo script se c'è un errore

echo "╔══════════════════════════════════════════╗"
echo "║  🍝 Setup Automatico Progetto Ristorante  ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funzione per stampare messaggi
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Verifica Node.js
echo "📋 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js non è installato!"
    echo "   Installalo da: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
print_success "Node.js trovato: $NODE_VERSION"

# Verifica Bun o npm
if command -v bun &> /dev/null; then
    PACKAGE_MANAGER="bun"
    print_success "Bun trovato - userò Bun"
elif command -v npm &> /dev/null; then
    PACKAGE_MANAGER="npm"
    print_success "npm trovato - userò npm"
else
    print_error "Né Bun né npm sono installati!"
    echo "   Installa Bun: curl -fsSL https://bun.sh/install | bash"
    echo "   Oppure npm (viene con Node.js)"
    exit 1
fi

# 1. Installa le dipendenze
echo ""
echo "📦 Step 1/5: Installazione dipendenze..."
if [ "$PACKAGE_MANAGER" = "bun" ]; then
    bun install
else
    npm install
fi
print_success "Dipendenze installate!"

# 2. Crea file .env se non esiste
echo ""
echo "⚙️  Step 2/5: Configurazione ambiente..."
if [ ! -f .env ]; then
    echo "DATABASE_URL=\"file:./db/custom.db\"" > .env
    print_success "File .env creato!"
else
    print_info "File .env esistente, mantengo quello attuale"
fi

# 3. Crea cartella database se non esiste
mkdir -p db
print_success "Cartella database pronta"

# 4. Configura il database
echo ""
echo "🗄️  Step 3/5: Configurazione database..."
if [ "$PACKAGE_MANAGER" = "bun" ]; then
    bun run db:push
    bun run db:generate
else
    npm run db:push
    npm run db:generate
fi
print_success "Database configurato!"

# 5. Popola il database con dati di esempio
echo ""
echo "🌱 Step 4/5: Popolamento database..."
if [ "$PACKAGE_MANAGER" = "bun" ]; then
    bun run db:seed
else
    npm run db:seed
fi
print_success "Database popolato con dati di esempio!"

# 6. Crea cartella public/images se non esiste
echo ""
echo "🖼️  Step 5/5: Verifica immagini..."
mkdir -p public/images
if [ ! -f "public/images/hero.jpg" ]; then
    print_warning "⚠️  Attenzione: Le immagini non sono presenti nella cartella public/images/"
    print_info "   Le immagini verranno caricate dal database se sono state configurate lì"
else
    print_success "Immagini trovate!"
fi

# Riepilogo
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║          ✨ Setup Completato! ✨          ║"
echo "╚══════════════════════════════════════════╝"
echo ""
print_success "Il progetto è pronto per essere avviato!"
echo ""
echo "🚀 Per avviare il server di sviluppo:"
if [ "$PACKAGE_MANAGER" = "bun" ]; then
    echo -e "   ${GREEN}$ bun run dev${NC}"
else
    echo -e "   ${GREEN}$ npm run dev${NC}"
fi
echo ""
echo "🌐 Il sito sarà disponibile su: ${GREEN}http://localhost:3000${NC}"
echo ""
echo "🔐 Credenziali Admin:"
echo "   Email: ${GREEN}admin@labellatavola.it${NC}"
echo "   Password: ${GREEN}admin123${NC}"
echo ""
print_info "Per accedere al pannello admin, clicca sul pulsante 'Admin' nell'header del sito"
echo ""
echo "📚 Altri comandi utili:"
echo "   • $ bun run dev          - Avvia server sviluppo"
echo "   • $ bun run build        - Crea build produzione"
echo "   • $ bun run lint         - Controlla codice"
echo "   • $ bun run db:seed      - Ripopola database"
echo ""
