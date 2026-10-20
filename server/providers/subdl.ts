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
  return entries.map((item: any, index: number) => {
    const rawUrl = typeof item.url === 'string' ? item.url : '';
    const downloadUrl = rawUrl.startsWith('https://') ? rawUrl : rawUrl.startsWith('/subtitle/') ? `https://dl.subdl.com${rawUrl}` : undefined;
    const lang = String(item.lang ?? item.language ?? 'unknown').toLowerCase();
    const ext = String(item.format ?? item.name?.split('.').pop() ?? 'srt').toLowerCase();
    return {
      id: `subdl-${item.file_n_id ?? item.n_id ?? index}`,
      provider: 'subdl' as const,
      title: String(item.name ?? title.name ?? query.query),
      language: lang,
      release: String(item.release_name ?? item.name ?? title.name ?? ''),
      format: ['srt', 'vtt', 'ass', 'ssa', 'zip'].includes(ext) ? ext : 'unknown',
      season: Number.isFinite(Number(item.season)) ? Number(item.season) : undefined,
      episode: Number.isFinite(Number(item.episode)) ? Number(item.episode) : undefined,
      downloadUrl,
      providerUrl: typeof item.url === 'string' && item.url.startsWith('https://') ? item.url : undefined,
    };
  });
}