import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { searchOpenSubtitles } from './providers/opensubtitles.js';
import { searchSubDL } from './providers/subdl.js';
import type { ProviderSearchResult, SubtitleSearchQuery } from './types.js';

const app = express();
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
  const query = String(req.query.q ?? '').trim();
  if (query.length < 2) return res.status(400).json({ error: 'نام فیلم یا سریال باید حداقل ۲ حرف داشته باشد.' });
  if (query.length > 120) return res.status(400).json({ error: 'عبارت جست‌وجو بیش از حد طولانی است.' });

  const languagesRaw = String(req.query.languages ?? 'fa,en');
  const languages = languagesRaw.split(',').map((value) => value.trim().toLowerCase()).filter((value) => /^[a-z]{2,3}$/.test(value)).slice(0, 5);
  const typeRaw = String(req.query.type ?? '');
  if (typeRaw && !['movie', 'tv'].includes(typeRaw)) return res.status(400).json({ error: 'نوع محتوا باید movie یا tv باشد.' });
  const year = req.query.year ? Number(req.query.year) : undefined;
  const season = req.query.season ? Number(req.query.season) : undefined;
  const episode = req.query.episode ? Number(req.query.episode) : undefined;
  for (const [name, value, min, max] of [['year', year, 1888, 2100], ['season', season, 0, 100], ['episode', episode, 0, 500]] as const) {
    if (value !== undefined && (!Number.isInteger(value) || value < min || value > max)) return res.status(400).json({ error: `مقدار ${name} معتبر نیست.` });
  }

  const search: SubtitleSearchQuery = {
    query,
    languages: languages.length ? languages : ['fa', 'en'],
    type: typeRaw ? typeRaw as 'movie' | 'tv' : undefined,
    year,
    season,
    episode,
    limit: Math.min(Math.max(Number(req.query.limit) || 20, 1), 30),
  };

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
  res.json({
    query: search.query,
    total: subtitles.length,
    subtitles: subtitles.slice(0, search.limit),
    providers: providers.map(({ provider, enabled, error }) => ({ provider, enabled, ...(error ? { error } : {}) })),
  });
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

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof Error && error.message.includes('CORS')) return res.status(403).json({ error: 'مبدأ درخواست مجاز نیست.' });
  console.error('[SubFilm API]', error instanceof Error ? error.message : 'Unknown error');
  return res.status(500).json({ error: 'خطای داخلی سرور؛ دوباره تلاش کنید.' });
});

app.listen(port, () => {
  console.log(`SubFilm API listening on http://localhost:${port}`);
});