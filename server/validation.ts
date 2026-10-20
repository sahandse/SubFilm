import type { SubtitleSearchQuery } from './types.js';

export type ValidationResult =
  | { ok: true; value: SubtitleSearchQuery }
  | { ok: false; error: string };

export function validateSubtitleSearch(params: URLSearchParams): ValidationResult {
  const query = (params.get('q') ?? '').trim();
  if (query.length < 2) return { ok: false, error: 'نام فیلم یا سریال باید حداقل ۲ حرف داشته باشد.' };
  if (query.length > 120) return { ok: false, error: 'عبارت جست‌وجو بیش از حد طولانی است.' };
  const languages = (params.get('languages') ?? 'fa,en').split(',').map((value) => value.trim().toLowerCase()).filter((value) => /^[a-z]{2,3}$/.test(value)).slice(0, 5);
  const type = params.get('type') ?? '';
  if (type && type !== 'movie' && type !== 'tv') return { ok: false, error: 'نوع محتوا باید movie یا tv باشد.' };
  const readInteger = (name: string, min: number, max: number): number | undefined | null => {
    const raw = params.get(name);
    if (raw === null || raw === '') return undefined;
    if (!/^\d+$/.test(raw)) return null;
    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value < min || value > max) return null;
    return value;
  };
  const year = readInteger('year', 1888, 2100);
  const season = readInteger('season', 0, 100);
  const episode = readInteger('episode', 0, 500);
  if (year === null) return { ok: false, error: 'مقدار year معتبر نیست.' };
  if (season === null) return { ok: false, error: 'مقدار season معتبر نیست.' };
  if (episode === null) return { ok: false, error: 'مقدار episode معتبر نیست.' };
  const requestedLimit = readInteger('limit', 1, 30);
  if (requestedLimit === null) return { ok: false, error: 'مقدار limit باید عددی بین ۱ تا ۳۰ باشد.' };
  return { ok: true, value: { query, languages: languages.length ? languages : ['fa', 'en'], type: type ? type as 'movie' | 'tv' : undefined, year: year ?? undefined, season: season ?? undefined, episode: episode ?? undefined, limit: requestedLimit ?? 20 } };
}