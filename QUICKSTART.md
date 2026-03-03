# ⚡ Avvio Rapido - 3 Minuti

## 🚀 Metodo più Veloce (Automatico)

### Windows
1. Apri **PowerShell** nella cartella del progetto
2. Esegui: `.\setup.ps1`
3. Aspetta 2-3 minuti
4. Esegui: `bun run dev` oppure `npm run dev`
5. Vai su: `http://localhost:3000`

### Mac/Linux
1. Apri il **Terminale** nella cartella del progetto
2. Esegui: `bash setup.sh`
3. Aspetta 2-3 minuti
4. Esegui: `bun run dev` oppure `npm run dev`
5. Vai su: `http://localhost:3000`

---

## 📝 Manuale in 5 Comandi

Se lo script non funziona, esegui questi 5 comandi uno alla volta:

```bash
# 1. Installa dipendenze
bun install

# 2. Crea file .env
echo DATABASE_URL="file:./db/custom.db" > .env

# 3. Configura database
bun run db:push

# 4. Popola database
bun run db:seed

# 5. Avvia server
bun run dev
```

*Se non hai Bun, usa `npm` al posto di `bun`*

---

## ✅ Verifica Funzionamento

Apri il browser su: **http://localhost:3000**

Dovresti vedere:
- ✅ Homepage con immagine hero
- ✅ Sezione Chi Siamo
- ✅ Carosello Specialità

Clicca su **Menu** nell'header → vedi gli articoli!

---

## 🔐 Credenziali Admin

- Email: **admin@labellatavola.it**
- Password: **admin123**

Clicca su **Admin** nell'header per accedere!

---

## 🆘 Problemi?

Se non funziona, leggi `VS_CODE_GUIDE.md` per risolvere i problemi comuni.
