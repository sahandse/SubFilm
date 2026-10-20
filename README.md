# SubFilm

A bilingual Persian/English subtitle-discovery catalog built with TypeScript, React, and Vite. The GitHub Pages version works entirely as a static website and does not require a Node.js backend.

## GitHub Pages mode

- Static title catalog bundled in `src/catalog.ts`
- Client-side search supports English titles and Persian aliases
- Local filters for movie/series and release year
- Optional language, season, and episode values are added to the external provider search
- Each result opens an OpenSubtitles search page; the site does not claim a subtitle file is available until the provider confirms it
- No API keys are exposed in the browser and no backend requests are made by the static site

## Update the catalog

Edit `src/catalog.ts` and add an item using this shape:

```ts
{
  id: 'unique-slug',
  title: 'Example Movie',
  aliases: ['عنوان فارسی', 'example movie'],
  year: 2024,
  kind: 'movie'
}
```

Use `kind: 'tv'` for a series. Keep `id` unique. The site searches `title` and `aliases` locally. After committing to `main`, GitHub Actions builds and deploys the updated catalog to GitHub Pages.

**Important:** the bundled catalog is a list of searchable film/series titles, not a verified archive of subtitle files. Availability, language, and download links are checked on OpenSubtitles after the user opens the external search. The static site cannot perform live provider API searches or securely use provider API keys by itself.

## Run locally

```bash
npm install
npm run dev:web
```

The static frontend runs with Vite. The optional Express API code remains in `server/` for a future server-hosted version, but it is not used by the GitHub Pages site.

## Optional API version

The repository retains a Node.js/Express API implementation for a separately hosted version. That optional version requires Node.js 20+, provider API keys, and server-side environment configuration. Never place secret API keys in client-side `VITE_*` variables or commit `.env`.

## Build and test

```bash
npm run typecheck
npm run build
npm test
``

The GitHub Actions workflow deploys the `dist` directory to GitHub Pages on pushes to `main`.
