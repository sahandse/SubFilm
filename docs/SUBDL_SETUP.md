# SubFilm + SubDL (GitHub Pages + Cloudflare Worker)

The website stays on GitHub Pages. A small Cloudflare Worker proxies SubDL requests so the API key never enters browser JavaScript or the Git repository.

## One-time setup

1. In Cloudflare Dashboard, open **Workers & Pages** and create a Worker named **subfilm-api**.
2. Deploy the contents of `worker/index.js` as the Worker entry point (or use Wrangler from this repository; see below).
3. In the Worker settings, add a **Secret** named `SUBDL_API_KEY` and paste your SubDL key there. Do not commit the key or put it in a `VITE_*` variable.
4. Deploy the Worker. Its URL will look like `https://subfilm-api.<your-account-subdomain>.workers.dev`.
5. In GitHub, open **Settings → Secrets and variables → Actions → Variables** and create repository variable `SUBFILM_API_BASE_URL` with the Worker URL (no trailing slash).
6. Re-run **Actions → Deploy SubFilm to GitHub Pages**.

## Deploy with Wrangler (optional)

Install Wrangler and authenticate to Cloudflare, then from the repository root:

```sh
npx wrangler deploy
npx wrangler secret put SUBDL_API_KEY
```

When prompted by the second command, paste the key into the terminal prompt. Do not put it in a command argument or commit it.

## Endpoints

- `GET /health` — basic Worker health check.
- `GET /api/subtitles?q=Inception&type=movie&languages=FA,EN`
- TV search accepts optional `season` and `episode`; `year` is optional.

CORS is limited to `https://sahandse.github.io` and localhost for development. The Worker returns only JSON and does not store search requests. The SubDL key is used server-side in the `x-api-key` header.

## Important

GitHub Pages cannot run server-side code or keep API keys secret. The Worker must be deployed and the repository variable must be set before live SubDL search can work. Until then, the site remains usable with its local title catalog.
