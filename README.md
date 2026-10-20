# SubFilm

A bilingual Persian/English subtitle discovery app built with TypeScript, React, Vite, and an Express API.

## Features

- Persian RTL and English LTR interface
- Live subtitle search through provider adapters
- Search filters for language, movie/series type, year, season, and episode
- Unified results from SubDL and OpenSubtitles
- Provider status and actionable API error messages
- Rate-limited API, CORS allowlist, input validation, and download-host allowlist
- CI type-check and production build

## Requirements

- Node.js 20 or newer
- API key for each subtitle provider you want to enable

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

The Vite frontend runs on `http://localhost:5173`; the API runs on `http://localhost:8787`. The Vite development server proxies `/api` requests to the API server.

## Provider configuration

Edit your local `.env` file and add the keys you obtain from the providers:

- `SUBDL_API_KEY` — SubDL API key
- `OPENSUBTITLES_API_KEY` — OpenSubtitles API key
- `OPENSUBTITLES_USER_AGENT` — application name/version required by the provider

Never commit `.env` or put API keys in client-side variables such as `VITE_*`. Configure secrets in the hosting provider's server-side environment settings.

SubDL API documentation: https://subdl.com/fa/api-doc  
OpenSubtitles API documentation: https://www.opensubtitles.com/en/consumers

API access, quotas, language availability, and download behavior are controlled by each provider. SubFilm does not promise that every search will return results. Download links are only exposed when a provider returns a supported URL.

## Production build

```bash
npm run typecheck
npm run build
npm start
```

The Express API and frontend need to be deployed on a Node-capable host, or the frontend and API need to be deployed separately with `VITE_API_BASE_URL` set to the public API origin. A static-only GitHub Pages deployment cannot run the Express API.

## API endpoints

- `GET /api/health` — API status and provider-key presence (never exposes key values)
- `GET /api/subtitles?q=Inception&languages=fa,en&type=movie&year=2010` — merged subtitle search
- `GET /api/download?url=...` — redirects only to supported SubDL download URLs

## Status

Initial API and live-search implementation. Run CI and configure provider keys before treating the service as production-ready.