import type { SubtitleResult, SubtitleSearchQuery } from '../types.js';

const API = 'https://api.opensubtitles.com/api/v1';

export async function searchOpenSubtitles(query: SubtitleSearchQuery): Promise<SubtitleResult[]> {
  const apiKey = process.env.OPENSUBTITLES_API_KEY;
  if (!apiKey) throw new Error('کلید OPENSUBTITLES_API_KEY تنظیم نشده است.');
  const params = new URLSearchParams({ query: query.query, languages: query.languages.join(',') || 'fa,en', order_by: 'download_count', order_direction: 'desc' });
  if (query.type) params.set('type', query.type);
  if (query.year) params.set('year', String(query.year));
  if (query.season !== undefined) params.set('season_number', String(query.season));
  if (query.episode !== undefined) params.set('episode_number', String(query.episode));
  const response = await fetch(`${API}/subtitles?${params}`, {
    headers: { 'Api-Key': apiKey, 'User-Agent': process.env.OPENSUBTITLES_USER_AGENT || 'SubFilm v0.1.0', Accept: 'application/json' },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) {
    if (response.status === 429) throw new Error('سهمیه درخواست OpenSubtitles پر شده است.');
    if (response.status === 401 || response.status === 403) throw new Error('کلید API سرویس OpenSubtitles معتبر نیست یا اجازه دسترسی ندارد.');
    throw new Error(`OpenSubtitles پاسخ ${response.status} برگرداند.`);
  }
  const data: any = await response.json();
  const entries = Array.isArray(data.data) ? data.data : [];
  return entries.slice(0, query.limit ?? 20).map((item: any, index: number) => {
    const attributes = item.attributes ?? {};
    const file = Array.isArray(attributes.files) ? attributes.files[0] : undefined;
    const feature = attributes.feature_details ?? {};
    return {
      id: `opensubtitles-${item.id ?? index}`,
      provider: 'opensubtitles' as const,
      title: String(feature.title ?? attributes.moviehash_match ?? query.query),
      language: String(attributes.language ?? 'unknown').toLowerCase(),
      release: String(attributes.release ?? attributes.uploaded ?? ''),
      format: String(file?.file_name?.split('.').pop() ?? 'srt').toLowerCase(),
      downloads: Number(attributes.download_count ?? 0),
      rating: Number(attributes.ratings ?? 0),
      season: Number.isFinite(Number(feature.season_number)) ? Number(feature.season_number) : undefined,
      episode: Number.isFinite(Number(feature.episode_number)) ? Number(feature.episode_number) : undefined,
      providerUrl: typeof attributes.url === 'string' ? attributes.url : 'https://www.opensubtitles.com/',
    };
  });
}