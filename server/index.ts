import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import rateLimit from 'express-rate-limit';
import { requestOpenSubtitlesDownload, searchOpenSubtitles } from './providers/opensubtitles.js';
import { searchSubDL } from './providers/subdl.js';
import type { ProviderSearchResult } from './types.js';
import { validateSubtitleSearch } from './validation.js';

const app = express();
const searchCache = new Map<string, { expiresAt: number; payload: unknown }>();
const SEARCH_CACHE_TTL_MS = 90_000;
const port = Number(process.env.PORT || 8787);
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map((value) => value.trim()).filter(Boolean);

app.disable('x-powered-by');
app.use(cors({ origin: (origin, callback) => {
  if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error('Origin is not allowed by CORS.'));
} }));
app.use(express.json({ limit: '32kb' }));
app.use('/api/', rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'درخواست‌های زیادی ارسال شده؛ یک دقیقه دیگر دوباره امتحان کنید.' } }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'SubFilm API',
    providers: {
      subdl: Boolean(process.env.SUBDL_API_KEY),
      opensubtitles: Boolean(process.env.OPENSUBTITLES_API_KEY),
    },
  });
});

app.get('/api/subtitles', async (req, res) => {
  const validation = validateSubtitleSearch(new URLSearchParams(
    Object.entries(req.query).flatMap(([key, value]) => {
      if (typeof value === 'string') return [[key, value]];
      if (Array.isArray(value)) return [[key, value.filter((item): item is string => typeof item === 'string').join(',')]];
      return [];
    }),
  ));
  if (!validation.ok) return res.status(400).json({ error: validation.error });
  const search = validation.value;

  const cacheKey = JSON.stringify({ ...search, subdl: Boolean(process.env.SUBDL_API_KEY), opensubtitles: Boolean(process.env.OPENSUBTITLES_API_KEY) });
  const cached = searchCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return res.json(cached.payload);
  if (cached) searchCache.delete(cacheKey);

  const tasks: Promise<ProviderSearchResult>[] = [
    (async () => {
      if (!process.env.SUBDL_API_KEY) return { provider: 'subdl', enabled: false, subtitles: [], error: 'کلید API تنظیم نشده است.' };
      try { return { provider: 'subdl', enabled: true, subtitles: await searchSubDL(search) }; }
      catch (error) { return { provider: 'subdl', enabled: true, subtitles: [], error: error instanceof Error ? error.message : 'خطای ناشناخته SubDL' }; }
    })(),
    (async () => {
      if (!process.env.OPENSUBTITLES_API_KEY) return { provider: 'opensubtitles', enabled: false, subtitles: [], error: 'کلید API تنظیم نشده است.' };
      try { return { provider: 'opensubtitles', enabled: true, subtitles: await searchOpenSubtitles(search) }; }
      catch (error) { return { provider: 'opensubtitles', enabled: true, subtitles: [], error: error instanceof Error ? error.message : 'خطای ناشناخته OpenSubtitles' }; }
    })(),
  ];

  const providers = await Promise.all(tasks);
  const subtitles = providers.flatMap((provider) => provider.subtitles);
  subtitles.sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0));
  const payload = {
    query: search.query,
    total: subtitles.length,
    subtitles: subtitles.slice(0, search.limit),
    providers: providers.map(({ provider, enabled, error }) => ({ provider, enabled, ...(error ? { error } : {}) })),
  };
  if (providers.every((provider) => !provider.error)) {
    if (searchCache.size >= 200) {
      const oldestKey = searchCache.keys().next().value;
      if (oldestKey) searchCache.delete(oldestKey);
    }
    searchCache.set(cacheKey, { expiresAt: Date.now() + SEARCH_CACHE_TTL_MS, payload });
  }
  return res.json(payload);
});

app.get('/api/download', (req, res) => {
  const raw = String(req.query.url ?? '');
  let url: URL;
  try { url = new URL(raw); } catch { return res.status(400).json({ error: 'آدرس دانلود معتبر نیست.' }); }
  if (url.protocol !== 'https:' || url.hostname !== 'dl.subdl.com' || !url.pathname.startsWith('/subtitle/')) {
    return res.status(400).json({ error: 'این میزبان دانلود مجاز نیست.' });
  }
  return res.redirect(302, url.toString());
});

app.post('/api/download/opensubtitles', async (req, res) => {
  const fileId = Number(req.body?.fileId);
  if (!Number.isSafeInteger(fileId) || fileId < 1) {
    return res.status(400).json({ error: 'شناسه فایل زیرنویس معتبر نیست.' });
  }
  try {
    const link = await requestOpenSubtitlesDownload(fileId);
    return res.json({ url: link });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطای دریافت لینک دانلود.';
    return res.status(502).json({ error: message });
  }
});

if (process.env.NODE_ENV === 'production') {
  const webRoot = path.resolve(process.cwd(), 'dist');
  app.use(express.static(webRoot, { index: false, maxAge: '1h' }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'مسیر API پیدا نشد.' });
    return res.sendFile(path.join(webRoot, 'index.html'), (error) => error ? next(error) : undefined);
  });
}

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof Error && error.message.includes('CORS')) return res.status(403).json({ error: 'مبدأ درخواست مجاز نیست.' });
  console.error('[SubFilm API]', error instanceof Error ? error.message : 'Unknown error');
  return res.status(500).json({ error: 'خطای داخلی سرور؛ دوباره تلاش کنید.' });
});

app.listen(port, () => {
  console.log(`SubFilm service listening on port ${port}`);
});