# Run Tracker

Applicazione full-stack per la gestione e l'analisi degli allenamenti di corsa.

## Funzionalita'

### Corse
- CRUD completo (crea, modifica, elimina con soft delete)
- Filtri per data, tipo di corsa, ricerca full-text nelle note
- Paginazione
- Importazione tracce GPX con calcolo automatico distanza e durata
- Visualizzazione percorso su mappa (Leaflet)
- Note vocali (registrazione e riproduzione audio)
- Esportazione CSV
- Esportazione report PDF mensile

### Dashboard
- Statistiche aggregate (corse totali, km, durata, passo medio)
- Grafico km settimanali (ultime 12 settimane)
- Obiettivi multipli con barre di progresso (km/settimana, corse/settimana, passo target, km/mese)
- Streak di allenamento (settimane consecutive, miglior streak, badge motivazionali)
- Personal Best (5K, 10K, mezza maratona, maratona, miglior passo, corsa piu' lunga)
- Calendario corse stile GitHub contributions (heatmap)
- Aggiornamento automatico al cambio pagina

### Condivisione Social
- Generazione card PNG con statistiche della corsa o PB
- Condivisione tramite Web Share API (mobile) o download diretto

### Utente
- Registrazione e login
- Profilo con modifica nome e cambio password
- Dark mode a 3 modalita' (light / dark / automatico dal sistema)

### Integrazione Strava
- Collegamento account Strava via OAuth2
- Importazione corse da Strava

### Admin
- Dashboard amministrativa con statistiche globali
- Gestione utenti (lista, dettaglio, modifica ruolo)
- Rate limiting dedicato sulle rotte admin

### Sicurezza e Infrastruttura
- Autenticazione JWT con refresh automatico del token
- Rate limiting su auth e admin
- Helmet per header HTTP sicuri
- Validazione dati con Zod
- Logging strutturato con Pino
- PWA ready (manifest, service worker, icone SVG)
- Toast notifications
- Skeleton loading states
- Pagina 403 per accesso non autorizzato

## Stack Tecnologico

### Frontend
- **React 19** con Vite 7
- **Tailwind CSS v4**
- **Recharts** (grafici settimanali)
- **Leaflet** (mappe percorso GPX)
- **jsPDF** (generazione report PDF)
- Context API (Auth, Theme, Toast)
- React Router DOM v7

### Backend
- **Node.js** con Express 5
- **Prisma ORM 6** con PostgreSQL
- **Zod 4** (validazione)
- **JWT** (autenticazione) + Bcrypt (hash password)
- **Multer** (upload file GPX e audio)
- **fast-xml-parser** (parsing GPX)
- **Pino** (logging strutturato)
- **Helmet** + **express-rate-limit** (sicurezza)

### Database
- **PostgreSQL**

## Struttura del Progetto

```
run-tracker/
├── apps/
│   ├── backend/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── uploads/              # file audio (gitignored)
│   │   └── src/
│   │       ├── controllers/
│   │       │   ├── auth.controller.js
│   │       │   ├── runs.controller.js
│   │       │   ├── stats.controller.js
│   │       │   ├── goals.controller.js
│   │       │   ├── import.controller.js
│   │       │   ├── admin.controller.js
│   │       │   └── users.controller.js
│   │       ├── routes/
│   │       ├── middlewares/
│   │       ├── integrations/strava/
│   │       ├── lib/               # prisma client, logger
│   │       ├── utils/
│   │       └── server.js
│   │
│   └── frontend/
│       └── src/
│           ├── pages/
│           │   ├── Dashboard.jsx
│           │   ├── Runs.jsx
│           │   ├── RunEditor.jsx
│           │   ├── Profile.jsx
│           │   ├── Login.jsx / Register.jsx
│           │   ├── AdminDashboard.jsx
│           │   ├── AdminUsers.jsx
│           │   └── AdminUserDetail.jsx
│           ├── components/
│           │   ├── ui/            # Button, Input, Alert, StatCard, Skeleton,
│           │   │                  # WeeklyGoalWidget, StreakWidget, PersonalBests,
│           │   │                  # RunCalendar, RunMap, ShareCard, VoiceRecorder
│           │   ├── charts/        # WeeklyChart
│           │   └── layout/        # AppShell, AuthLayout
│           ├── context/           # AuthContext, ThemeContext, ToastContext
│           ├── hooks/             # useStats
│           ├── services/          # api, runs, goals, admin, users, strava, pdf
│           ├── routes/            # AppRouter, ProtectedRoute, AdminRoute
│           └── utils/             # format
│
└── docker-compose.yml
```

## Schema Database

### User
| Campo | Tipo | Note |
|-------|------|------|
| id | UUID | PK |
| name | String | |
| email | String | unique |
| passwordHash | String | |
| role | String | "user" / "admin" |
| createdAt | DateTime | |

### Run
| Campo | Tipo | Note |
|-------|------|------|
| id | UUID | PK |
| userId | UUID | FK -> User |
| date | DateTime | |
| distanceKm | Decimal | |
| durationSec | Int | |
| type | String | lento, tempo, variato, lungo, gara, forza |
| rpe | Int? | 1-10 (sforzo percepito) |
| notes | String? | ricerca full-text |
| audioUrl | String? | path nota vocale |
| gpxData | Json? | coordinate GPS campionate |
| createdAt | DateTime | |
| deletedAt | DateTime? | soft delete |

### WeeklyGoal
| Campo | Tipo | Note |
|-------|------|------|
| id | UUID | PK |
| userId | UUID | FK -> User, unique |
| targetKm | Decimal | km / settimana |
| targetRuns | Int? | corse / settimana |
| targetPaceSec | Int? | passo obiettivo (sec/km) |
| targetMonthlyKm | Decimal? | km / mese |

### StravaAccount
| Campo | Tipo | Note |
|-------|------|------|
| id | UUID | PK |
| userId | UUID | FK -> User, unique |
| athleteId | Int | unique |
| accessToken | String | |
| refreshToken | String | |
| expiresAt | Int | |

Relazioni: `User 1--N Run`, `User 1--1 WeeklyGoal`, `User 1--1 StravaAccount`

## Setup in Locale

### 1. Database

```bash
docker compose up -d
```

Avvia PostgreSQL su `localhost:5432`.

### 2. Backend

```bash
cd apps/backend
npm install
```

Creare `.env`:
```
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/runtracker?schema=public"
JWT_SECRET="super-secret-change-me"
FRONTEND_URL="http://localhost:5173"
```

Migrazioni e avvio:
```bash
npx prisma migrate dev
npm run dev
```

API disponibile su `http://localhost:4000`

### 3. Frontend

```bash
cd apps/frontend
npm install
```

Creare `.env`:
```
VITE_API_URL=http://localhost:4000
```

```bash
npm run dev
```

Disponibile su `http://localhost:5173`

## API Endpoints Principali

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| POST | /auth/register | Registrazione |
| POST | /auth/login | Login |
| POST | /auth/refresh | Refresh token |
| GET | /auth/me | Profilo utente |
| GET | /runs | Lista corse (filtri, paginazione, search) |
| POST | /runs | Crea corsa |
| GET | /runs/:id | Dettaglio corsa |
| PATCH | /runs/:id | Modifica corsa |
| DELETE | /runs/:id | Elimina corsa (soft delete) |
| POST | /runs/import/gpx | Importa file GPX |
| POST | /runs/:id/audio | Upload nota vocale |
| DELETE | /runs/:id/audio | Elimina nota vocale |
| GET | /runs/export/csv | Esporta CSV |
| GET | /stats/summary | Statistiche aggregate |
| GET | /stats/weekly | Km settimanali |
| GET | /stats/personal-bests | Personal best |
| GET | /stats/streak | Streak settimanale |
| GET | /stats/calendar | Dati calendario heatmap |
| GET | /goals/weekly | Obiettivi correnti + progresso |
| PUT | /goals/weekly | Imposta obiettivi |
| GET | /users/me | Profilo |
| PATCH | /users/me | Modifica profilo |
| PATCH | /users/me/password | Cambio password |
| GET | /admin/dashboard | Stats globali admin |
| GET | /admin/users | Lista utenti |
| GET | /admin/users/:id | Dettaglio utente |
| PATCH | /admin/users/:id | Modifica ruolo utente |

## Deploy

- **Frontend**: Vercel / Netlify
- **Backend**: Railway / Render
- **Database**: PostgreSQL managed (Neon / Railway)

Variabili ambiente produzione:

Backend: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`

Frontend: `VITE_API_URL=https://your-backend-url`

In produzione:
```bash
npx prisma migrate deploy
```

## Autore

Progetto sviluppato come esercizio universitario full-stack.
