import type { SubtitleResult, SubtitleSearchQuery } from '../types.js';

const API = 'https://api.subdl.com/api/v2';

function langCodes(languages: string[]): string {
  return languages.map((language) => {
    const value = language.trim().toLowerCase();
    if (value === 'fa' || value === 'persian' || value === 'فارسی') return 'fa';
    if (value === 'en' || value === 'english' || value === 'انگلیسی') return 'en';
    return value;
  }).filter(Boolean).join(',');
}

async function requestJson(url: URL, apiKey: string): Promise<any> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(response.status === 429 ? 'محدودیت درخواست SubDL؛ کمی بعد دوباره تلاش کنید.' : `SubDL پاسخ ${response.status} برگرداند.`);
  return response.json();
}

function normalizeDownloadUrl(raw: unknown): string | undefined {
  if (typeof raw !== 'string' || !raw) return undefined;
  try {
    const url = new URL(raw.startsWith('/subtitle/') ? `https://dl.subdl.com${raw}` : raw);
    if (url.protocol === 'https:' && url.hostname === 'dl.subdl.com' && url.pathname.startsWith('/subtitle/')) return url.toString();
  } catch {
    return undefined;
  }
  return undefined;
}

export async function searchSubDL(query: SubtitleSearchQuery): Promise<SubtitleResult[]> {
  const apiKey = process.env.SUBDL_API_KEY;
  if (!apiKey) throw new Error('کلید SUBDL_API_KEY تنظیم نشده است.');
  const params = new URLSearchParams({ q: query.query, limit: '5' });
  if (query.type) params.set('type', query.type);
  const matches = await requestJson(new URL(`${API}/movies/search?${params}`), apiKey);
  const titles = Array.isArray(matches.results) ? matches.results : [];
  const normalizedQuery = query.query.toLocaleLowerCase();
  const title = titles.find((item: any) => String(item.name ?? '').toLocaleLowerCase() === normalizedQuery) ?? titles[0];
  if (!title?.sd_id) return [];

  const subtitleParams = new URLSearchParams({
    sd_id: String(title.sd_id),
    languages: langCodes(query.languages.length ? query.languages : ['fa', 'en']),
    unpack: '1',
    subs_per_page: String(Math.min(Math.max(query.limit ?? 20, 1), 30)),
  });
  if (query.type) subtitleParams.set('type', query.type);
  if (query.season !== undefined) subtitleParams.set('season', String(query.season));
  if (query.episode !== undefined) subtitleParams.set('episode', String(query.episode));
  const data = await requestJson(new URL(`${API}/subtitles/search?${subtitleParams}`), apiKey);
  const entries = Array.isArray(data.subtitles) ? data.subtitles : [];
  const files = entries.flatMap((item: any) => {
    if (Array.isArray(item.unpack_files) && item.unpack_files.length) {
      return item.unpack_files.map((file: any) => ({
        ...item,
        ...file,
        parentName: item.name,
        parentRelease: item.release_name,
      }));
    }
    return [item];
  });

  return files.map((item: any, index: number) => {
    const rawUrl = item.url;
    const downloadUrl = normalizeDownloadUrl(rawUrl);
    const lang = String(item.lang ?? item.language ?? 'unknown').toLowerCase();
    const ext = String(item.format ?? item.name?.split('.').pop() ?? 'srt').toLowerCase();
    return {
      id: `subdl-${item.file_n_id ?? item.n_id ?? index}`,
      provider: 'subdl' as const,
      title: String(item.name ?? item.parentName ?? title.name ?? query.query),
      language: lang,
      release: String(item.release_name ?? item.parentRelease ?? item.name ?? title.name ?? ''),
      format: ['srt', 'vtt', 'ass', 'ssa', 'zip'].includes(ext) ? ext : 'unknown',
      season: Number.isFinite(Number(item.season)) ? Number(item.season) : undefined,
      episode: Number.isFinite(Number(item.episode)) ? Number(item.episode) : undefined,
      downloadUrl,
      providerUrl: typeof rawUrl === 'string' && rawUrl.startsWith('https://') ? rawUrl : undefined,
    };
  });
}