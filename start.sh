#!/bin/bash

echo "🚀 Avvio Server Sviluppo..."
echo ""

# Verifica se Bun è installato
if command -v bun &> /dev/null; then
    echo "Uso Bun per avviare..."
    bun run dev
# Altrimenti usa npm
elif command -v npm &> /dev/null; then
    echo "Uso npm per avviare..."
    npm run dev
else
    echo "❌ Né Bun né npm sono installati!"
    echo "Installa Bun o npm prima di avviare il server."
    exit 1
fi
