# SubFilm + SubDL (GitHub Pages + Cloudflare Worker)

The website stays on GitHub Pages. A small Cloudflare Worker proxies SubDL requests so the API key never enters browser JavaScript or the Git repository.

## One-time setup

1. In Cloudflare, create an API token allowed to edit Workers and obtain your Cloudflare Account ID.
2. In GitHub, open **Settings → Secrets and variables → Actions → Secrets** and add these three repository secrets:
   - `CLOUDFLARE_API_TOKEN` — the Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID` — your Cloudflare Account ID
   - `SUBDL_API_KEY` — your SubDL API key
3. Open **Actions → Deploy SubFilm Worker to Cloudflare → Run workflow**. The workflow deploys `worker/index.js` and stores the SubDL key as a Worker secret; it never writes the key to the repository.
4. In the deployment logs, find the Worker URL. It will look like `https://subfilm-api.<your-account-subdomain>.workers.dev`.
5. In GitHub, open **Settings → Secrets and variables → Actions → Variables** and create repository variable `SUBFILM_API_BASE_URL` with that Worker URL (no trailing slash).
6. Re-run **Actions → Deploy SubFilm to GitHub Pages** to build the site with the Worker URL.

## Deploy with Wrangler (optional)

Alternatively, you can deploy from a local terminal with Wrangler after authenticating to Cloudflare:

```sh
npx wrangler deploy
npx wrangler secret put SUBDL_API_KEY
```

Enter the key only in Wrangler's secret prompt. Do not put it in a command argument or commit it.

## Endpoints

- `GET /health` — basic Worker health check.
- `GET /api/subtitles?q=Inception&type=movie&languages=FA,EN`
- TV search accepts optional `season` and `episode`; `year` is optional.

CORS is limited to `https://sahandse.github.io` and localhost for development. The Worker returns only JSON and does not store search requests. The legacy SubDL v1 endpoint receives the key as a server-side `api_key` query parameter; it is never sent to the browser.

## Important

GitHub Pages cannot run server-side code or keep API keys secret. The Worker must be deployed and the repository variable must be set before live SubDL search can work. Until then, the site remains usable with its local title catalog.
