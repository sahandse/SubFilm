# Deploy SubFilm on Render

SubFilm includes a Render Blueprint in `render.yaml`. It deploys both the React frontend and Express API as one Node.js web service.

1. Open https://render.com/deploy?repo=https://github.com/sahandse/SubFilm
2. Sign in to Render and select the `sahandse/SubFilm` repository.
3. Review the service settings from `render.yaml`.
4. Add the `SUBDL_API_KEY` and/or `OPENSUBTITLES_API_KEY` values when prompted. These are server-side secrets; do not commit them to GitHub.
5. Create the service and wait for the build and health check.
6. Open the service URL displayed by Render and visit `/api/health`. A healthy service returns JSON with `"status":"ok"`.
7. Render is configured to automatically deploy later commits to `main`.

The free Render plan may sleep after inactivity. Search and download features require valid provider API access and remain subject to provider quotas. GitHub Pages cannot host this full-stack app because it does not run the Express backend.
