import type { SubtitleResult, SubtitleSearchQuery } from '../types.js';

const API = 'https://api.opensubtitles.com/api/v1';

function headers(apiKey: string) {
  return {
    'Api-Key': apiKey,
    'User-Agent': process.env.OPENSUBTITLES_USER_AGENT || 'SubFilm v0.3.0',
    Accept: 'application/json',
  };
}

export async function searchOpenSubtitles(query: SubtitleSearchQuery): Promise<SubtitleResult[]> {
  const apiKey = process.env.OPENSUBTITLES_API_KEY;
  if (!apiKey) throw new Error('کلید OPENSUBTITLES_API_KEY تنظیم نشده است.');
  const params = new URLSearchParams({ query: query.query, languages: query.languages.join(',') || 'fa,en', order_by: 'download_count', order_direction: 'desc' });
  if (query.type) params.set('type', query.type === 'tv' ? 'episode' : 'movie');
  if (query.year) params.set('year', String(query.year));
  if (query.season !== undefined) params.set('season_number', String(query.season));
  if (query.episode !== undefined) params.set('episode_number', String(query.episode));
  const response = await fetch(`${API}/subtitles?${params}`, {
    headers: headers(apiKey),
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
    const fileId = Number(file?.file_id);
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
      downloadFileId: Number.isSafeInteger(fileId) && fileId > 0 ? fileId : undefined,
      providerUrl: typeof attributes.url === 'string' ? attributes.url : 'https://www.opensubtitles.com/',
    };
  });
}

export async function requestOpenSubtitlesDownload(fileId: number): Promise<string> {
  const apiKey = process.env.OPENSUBTITLES_API_KEY;
  if (!apiKey) throw new Error('کلید OPENSUBTITLES_API_KEY تنظیم نشده است.');
  const response = await fetch(`${API}/download`, {
    method: 'POST',
    headers: { ...headers(apiKey), 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_id: fileId }),
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) {
    if (response.status === 429) throw new Error('سهمیه دانلود OpenSubtitles پر شده است.');
    if (response.status === 401 || response.status === 403) throw new Error('کلید API اجازه دانلود ندارد یا معتبر نیست.');
    throw new Error(`OpenSubtitles پاسخ دانلود ${response.status} برگرداند.`);
  }
  const data: any = await response.json();
  if (typeof data.link !== 'string') throw new Error('سرویس لینک دانلود معتبری برنگرداند.');
  let url: URL;
  try { url = new URL(data.link); } catch { throw new Error('لینک دانلود برگشتی معتبر نیست.'); }
  if (url.protocol !== 'https:' || !(url.hostname === 'opensubtitles.com' || url.hostname.endsWith('.opensubtitles.com'))) {
    throw new Error('میزبان لینک دانلود برگشتی مورد تأیید نیست.');
  }
  return url.toString();
}