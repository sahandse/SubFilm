export type SubtitleSearchQuery = {
  query: string;
  languages: string[];
  type?: 'movie' | 'tv';
  year?: number;
  season?: number;
  episode?: number;
  limit?: number;
};

export type SubtitleResult = {
  id: string;
  provider: 'subdl' | 'opensubtitles';
  title: string;
  language: string;
  release: string;
  format: string;
  downloads?: number;
  rating?: number;
  season?: number;
  episode?: number;
  downloadFileId?: number;
  downloadUrl?: string;
  providerUrl?: string;
};

export type ProviderSearchResult = {
  provider: 'subdl' | 'opensubtitles';
  enabled: boolean;
  subtitles: SubtitleResult[];
  error?: string;
};