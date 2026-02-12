# Run-Tracking
🏃 Run Tracker

Applicazione full-stack per la gestione e l’analisi degli allenamenti di corsa.

Il progetto permette di:

Registrare corse (CRUD completo)

Visualizzare statistiche aggregate

Filtrare e paginare attività

Gestire il profilo utente

Utilizzare modalità Dark / Light

Autenticazione JWT sicura

📦 Stack Tecnologico
🔹 Frontend

React (Vite)

Tailwind CSS

Recharts (grafici)

Context API (Auth + Theme)

Fetch API

🔹 Backend

Node.js

Express

Prisma ORM

PostgreSQL

Zod (validazione)

JWT (autenticazione)

Bcrypt (hash password)

🔹 Database

PostgreSQL (Docker in sviluppo)

📁 Struttura del progetto
run-tracker/
│
├── apps/
│   ├── backend/
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/
│   │       ├── controllers/
│   │       ├── routes/
│   │       ├── middlewares/
│   │       ├── services/
│   │       └── server.js
│   │
│   └── frontend/
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   ├── context/
│       │   └── services/
│       └── vite.config.js
│
└── docker-compose.yml

⚙️ Setup in locale
1️⃣ Avviare il Database

Dalla root del progetto:

docker compose up -d


Questo avvia un container PostgreSQL su:

localhost:5432

2️⃣ Backend Setup
cd apps/backend
npm install

Configurare .env
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/runtracker?schema=public"
JWT_SECRET="super-secret-change-me"

Migrazioni database
npx prisma migrate dev

Avviare backend
npm run dev


API disponibile su:

http://localhost:4000

3️⃣ Frontend Setup
cd apps/frontend
npm install


Creare .env:

VITE_API_URL=http://localhost:4000


Avviare frontend:

npm run dev


Disponibile su:

http://localhost:5173

🔐 Autenticazione

Il sistema utilizza:

JWT

Header Authorization: Bearer <token>

Middleware di protezione per le rotte

Flusso:

Registrazione → ritorna token

Login → ritorna token

Token salvato in localStorage

Ogni richiesta autenticata include Authorization header

📊 Funzionalità Implementate
👤 Utente

Registrazione

Login

Visualizzazione profilo

Modifica nome

Cambio password

🏃 Corse

Creazione corsa

Modifica corsa

Eliminazione corsa

Lista con:

Filtri per data (da/a)

Filtro per tipo

Paginazione

📈 Statistiche

Summary:

Totale corse

Km totali

Durata totale

Passo medio

Weekly:

Km per settimana (grafico)

🌙 UI

Modalità Dark/Light

Persistenza tema in localStorage

Layout responsive

🗄️ Database

Tabelle principali:

User

id

name

email

passwordHash

createdAt

Run

id

userId

date

distanceKm

durationSec

type

rpe

notes

Relazione:

User 1 --- N Run

🧪 Visualizzare il Database

Tramite Prisma Studio:

cd apps/backend
npx prisma studio


Oppure con client esterni (DBeaver / pgAdmin):

Host: localhost

Port: 5432

DB: runtracker

User: postgres

Password: postgres

🚀 Deploy (Architettura consigliata)

Frontend → Vercel / Netlify

Backend → Render / Railway

Database → Postgres managed (Neon / Render / Railway)

Variabili ambiente necessarie:

Backend:

DATABASE_URL
JWT_SECRET


Frontend:

VITE_API_URL=https://your-backend-url


In produzione usare:

npx prisma migrate deploy

🔮 Possibili Estensioni Future

Upload GPX file

Dashboard avanzata (mensile / annuale)

Record personali

Strava integration

Export CSV

Obiettivi chilometraggio

Notifiche

👨‍💻 Autore

Progetto sviluppato come esercizio universitario full-stack.

🎯 Obiettivo Didattico

Il progetto dimostra:

Strutturazione di un monorepo

Architettura REST completa

Autenticazione sicura JWT

Validazione dati lato server

Integrazione ORM (Prisma)

Gestione stato frontend

UI moderna con Tailwind

Integrazione Docker

Deploy ready