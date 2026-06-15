# Chomperz Frontend

Next.js UI — login, dashboard, territory map.

## Setup

```bash
cd frontend
cp .env.example .env.local
# Optional: set NEXT_PUBLIC_API_URL if API is on another domain

npm install
npm run dev
```

App runs at http://localhost:3000

**Note:** Start the backend separately (`cd ../backend && npm run dev`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Serve production build |
