const ALLOWED_ORIGINS = new Set([
  "https://sahandse.github.io",
  "http://localhost:5173",
]);

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://sahandse.github.io",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders(origin) });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      if (origin && !ALLOWED_ORIGINS.has(origin)) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (origin && !ALLOWED_ORIGINS.has(origin)) return json({ error: "Origin not allowed" }, 403, origin);
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405, origin);
    if (url.pathname === "/health") return json({ ok: true, service: "SubFilm SubDL proxy" }, 200, origin);
    if (url.pathname !== "/api/subtitles") return json({ error: "Not found" }, 404, origin);
    if (!env.SUBDL_API_KEY) return json({ error: "SubDL API key is not configured on the Worker." }, 503, origin);

    const q = (url.searchParams.get("q") || "").trim().slice(0, 160);
    if (q.length < 2) return json({ error: "Enter at least 2 characters." }, 400, origin);

    const requestedType = url.searchParams.get("type") || "all";
    const types = requestedType === "tv" ? ["tv"] : requestedType === "movie" ? ["movie"] : ["movie", "tv"];
    const languages = (url.searchParams.get("languages") || "FA,EN")
      .split(",").map((x) => x.trim().toUpperCase()).filter((x) => /^[A-Z]{2,3}$/.test(x)).slice(0, 8).join(",");
    const season = Number.parseInt(url.searchParams.get("season") || "", 10);
    const episode = Number.parseInt(url.searchParams.get("episode") || "", 10);
    const year = Number.parseInt(url.searchParams.get("year") || "", 10);

    try {
      const responses = await Promise.all(types.map(async (type) => {
        const params = new URLSearchParams({
          film_name: q,
          type,
          languages: languages || "FA,EN",
          subs_per_page: "30",
          client: "custom_integration",
          api_key: env.SUBDL_API_KEY,
          unpack: "1",
        });
        if (Number.isInteger(year) && year >= 1888 && year <= 2100) params.set("year", String(year));
        if (type === "tv" && Number.isInteger(season) && season >= 1 && season <= 99) params.set("season_number", String(season));
        if (type === "tv" && Number.isInteger(episode) && episode >= 1 && episode <= 999) params.set("episode_number", String(episode));
        const upstream = await fetch("https://api.subdl.com/api/v1/subtitles?" + params.toString(), {
          headers: { "Accept": "application/json" },
          signal: AbortSignal.timeout(12000),
        });
        const text = await upstream.text();
        let payload;
        try { payload = JSON.parse(text); } catch { payload = null; }
        if (!upstream.ok || !payload || payload.status === false) {
          throw new Error("SubDL request failed");
        }
        return payload;
      }));
      return json({
        ok: true,
        results: responses.flatMap((payload) => Array.isArray(payload.results) ? payload.results : []),
        subtitles: responses.flatMap((payload) => Array.isArray(payload.subtitles) ? payload.subtitles : []),
      }, 200, origin);
    } catch {
      return json({ error: "Could not reach SubDL. Please try again shortly." }, 502, origin);
    }
  },
};
