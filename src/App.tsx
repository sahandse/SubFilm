import { useState } from 'react';
import { Search, Captions, Languages, Film, Tv, Download, SlidersHorizontal, Sparkles, Github, ChevronDown, ArrowUpLeft, LoaderCircle, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

type Subtitle = {
  id: string;
  provider: 'subdl' | 'opensubtitles';
  title: string;
  language: string;
  release: string;
  format: string;
  downloads?: number;
  downloadFileId?: number;
  season?: number;
  episode?: number;
  downloadUrl?: string;
  providerUrl?: string;
};
type ProviderState = { provider: string; enabled: boolean; error?: string };
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export default function App() {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('all');
  const [kind, setKind] = useState('all');
  const [year, setYear] = useState('');
  const [season, setSeason] = useState('');
  const [episode, setEpisode] = useState('');
  const [english, setEnglish] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [providers, setProviders] = useState<ProviderState[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function searchSubtitles(searchTerm = query) {
    const cleaned = searchTerm.trim();
    if (cleaned.length < 2) {
      setError(english ? 'Enter at least 2 characters to search.' : 'برای جست‌وجو حداقل ۲ حرف وارد کن.');
      return;
    }
    setLoading(true);
    setError('');
    setHasSearched(true);
    try {
      const params = new URLSearchParams({ q: cleaned, languages: language === 'all' ? 'fa,en' : language, limit: '30' });
      if (kind !== 'all') params.set('type', kind);
      if (year.trim()) params.set('year', year.trim());
      if (season.trim()) params.set('season', season.trim());
      if (episode.trim()) params.set('episode', episode.trim());
      const response = await fetch(`${API_BASE}/api/subtitles?${params.toString()}`, { headers: { Accept: 'application/json' } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || (english ? 'Search failed. Try again.' : 'جست‌وجو ناموفق بود؛ دوباره تلاش کن.'));
      setSubtitles(Array.isArray(data.subtitles) ? data.subtitles : []);
      setProviders(Array.isArray(data.providers) ? data.providers : []);
      if (!data.subtitles?.length) {
        const active = (data.providers ?? []).some((provider: ProviderState) => provider.enabled);
        setError(active
          ? (english ? 'No subtitles found for this search.' : 'برای این جست‌وجو زیرنویسی پیدا نشد.')
          : (english ? 'No provider API keys are configured on the server yet.' : 'هنوز کلید API هیچ منبعی روی سرور تنظیم نشده است.'));
      }
    } catch (err) {
      setSubtitles([]);
      setProviders([]);
      setError(err instanceof Error ? err.message : (english ? 'Could not connect to the SubFilm API.' : 'اتصال به API سایت برقرار نشد.'));
    } finally {
      setLoading(false);
    }
  }

  async function downloadOpenSubtitles(item: Subtitle) {
    if (!item.downloadFileId) return;
    setDownloadingId(item.id);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/download/opensubtitles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ fileId: item.downloadFileId }),
      });
      const data = await response.json();
      if (!response.ok || typeof data.url !== 'string') throw new Error(data.error || (english ? 'Download link could not be created.' : 'ساخت لینک دانلود ناموفق بود.'));
      const link = document.createElement('a');
      link.href = data.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
    } catch (err) {
      setError(err instanceof Error ? err.message : (english ? 'Download failed.' : 'دانلود ناموفق بود.'));
    } finally {
      setDownloadingId(null);
    }
  }

  function resetFilters() {
    setLanguage('all'); setKind('all'); setYear(''); setSeason(''); setEpisode('');
  }

  return (
    <main className={english ? 'app english' : 'app'} dir={english ? 'ltr' : 'rtl'}>
      <header className="topbar">
        <a className="brand" href="#" aria-label="SubFilm home"><span className="brand-mark"><Captions size={25}/></span><span>Sub<span>Film</span><small>SUBTITLE DISCOVERY</small></span></a>
        <nav><a className="nav-active" href="#search">{english ? 'Explore' : 'جست‌وجو'}</a><a href="#results">{english ? 'Subtitles' : 'زیرنویس‌ها'}</a><a href="https://github.com/sahandse/SubFilm" target="_blank" rel="noreferrer">GitHub <ArrowUpLeft size={14}/></a></nav>
        <button className="language-toggle" onClick={() => setEnglish(!english)}><Languages size={17}/>{english ? 'فارسی' : 'English'}</button>
      </header>

      <section className="hero" id="search">
        <div className="hero-glow"/>
        <div className="eyebrow"><Sparkles size={15}/>{english ? 'YOUR NEXT SUBTITLE, FOUND' : 'زیرنویس مناسب، فقط چند ثانیه فاصله دارد'}</div>
        <h1>{english ? <>Every story.<br/><em>Every language.</em></> : <>هر داستانی،<br/><em>به زبان خودت.</em></>}</h1>
        <p>{english ? 'Search subtitle catalogs for your favorite movies and series.' : 'زیرنویس فیلم‌ها و سریال‌های محبوبت را در منابع متصل جست‌وجو کن.'}</p>
        <form className="search-box" onSubmit={(event) => { event.preventDefault(); void searchSubtitles(); }}>
          <Search size={22}/>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={english ? 'Search movie or series title...' : 'نام فیلم یا سریال را جست‌وجو کن...'} aria-label="Search subtitles" minLength={2} maxLength={120}/>
          {query && <button type="button" className="clear-btn" onClick={() => setQuery('')} aria-label="پاک کردن جست‌وجو">×</button>}
          <button className="search-button" type="submit" disabled={loading}>{loading ? <LoaderCircle className="spin" size={18}/> : <>{english ? 'Search' : 'جست‌وجو'} <ArrowUpLeft size={17}/></>}</button>
        </form>
        <div className="quick-search"><span>{english ? 'Try:' : 'امتحان کن:'}</span>{['Dune', 'Interstellar', 'Shōgun'].map((s) => <button key={s} onClick={() => {setQuery(s); void searchSubtitles(s);}}>{s}</button>)}</div>
        <div className="hero-art" aria-hidden="true"><div className="poster poster-back"><div className="poster-symbol"><Film size={38}/></div></div><div className="poster poster-mid"><div className="poster-symbol"><Tv size={38}/></div></div><div className="poster poster-front"><div className="poster-symbol"><Captions size={48}/></div><div className="poster-shade"/></div><div className="floating-caption"><Captions size={20}/><span>SUBTITLE<br/><b>DISCOVERY</b></span><span className="caption-check">✓</span></div></div>
      </section>

      <section className="content-section" id="results">
        <div className="section-heading"><div><span className="section-kicker">{english ? 'THE SUBFILM LIBRARY' : 'کتابخانه SubFilm'}</span><h2>{english ? 'Subtitle results' : 'نتایج زیرنویس'}</h2><p>{english ? 'Search results from connected providers.' : 'نتایج جست‌وجو از منابع متصل.'}</p></div><button className="filter-button" onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal size={17}/>{english ? 'Filters' : 'فیلترها'}<ChevronDown size={15}/></button></div>
        {showFilters && <div className="filters">
          <label>{english ? 'Language' : 'زبان'}<select value={language} onChange={(e) => setLanguage(e.target.value)}><option value="all">{english ? 'All languages' : 'همه زبان‌ها'}</option><option value="fa">فارسی</option><option value="en">English</option></select></label>
          <label>{english ? 'Content type' : 'نوع محتوا'}<select value={kind} onChange={(e) => setKind(e.target.value)}><option value="all">{english ? 'All' : 'همه'}</option><option value="movie">{english ? 'Movie' : 'فیلم'}</option><option value="tv">{english ? 'Series' : 'سریال'}</option></select></label>
          <label>{english ? 'Year' : 'سال انتشار'}<input inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0,4))} placeholder="2024"/></label>
          <label>{english ? 'Season' : 'فصل'}<input inputMode="numeric" value={season} onChange={(e) => setSeason(e.target.value.replace(/\D/g, '').slice(0,3))} placeholder="1"/></label>
          <label>{english ? 'Episode' : 'قسمت'}<input inputMode="numeric" value={episode} onChange={(e) => setEpisode(e.target.value.replace(/\D/g, '').slice(0,3))} placeholder="1"/></label>
          <button onClick={resetFilters}>{english ? 'Reset filters' : 'پاک‌کردن فیلترها'}</button>
        </div>}
        <div className="results-meta"><span>{hasSearched ? (english ? `${subtitles.length} results` : `${subtitles.length} نتیجه`) : (english ? 'Ready to search' : 'آماده جست‌وجو')}</span><span className="demo-note"><span/>{english ? 'Live API results; availability depends on provider keys' : 'نتایج زنده API؛ وابسته به تنظیم کلید منابع'}</span></div>
        {loading && <div className="status-panel"><LoaderCircle className="spin" size={24}/><span>{english ? 'Searching subtitle providers…' : 'در حال جست‌وجو در منابع زیرنویس…'}</span></div>}
        {!loading && error && <div className="status-panel status-error"><AlertCircle size={22}/><div><b>{english ? 'Search status' : 'وضعیت جست‌وجو'}</b><p>{error}</p><button onClick={() => void searchSubtitles()}><RefreshCw size={14}/>{english ? 'Try again' : 'تلاش دوباره'}</button></div></div>}
        {!loading && !error && hasSearched && subtitles.length === 0 && <div className="empty-state"><Search size={28}/><h3>{english ? 'No subtitles found' : 'زیرنویسی پیدا نشد'}</h3><p>{english ? 'Try a different title or adjust your filters.' : 'نام دیگری را امتحان کن یا فیلترها را تغییر بده.'}</p></div>}
        {!loading && !hasSearched && <div className="empty-state"><Search size={28}/><h3>{english ? 'Search to get started' : 'برای شروع جست‌وجو کن'}</h3><p>{english ? 'Results will appear here from connected subtitle providers.' : 'نتایج منابع زیرنویس متصل در این بخش نمایش داده می‌شوند.'}</p></div>}
        {!loading && subtitles.length > 0 && <div className="subtitle-grid">{subtitles.map((item) => {
          const persian = ['fa','fas','per','persian'].includes(item.language.toLowerCase());
          const title = item.title || item.release || 'Subtitle';
          const downloadHref = item.downloadUrl ? `${API_BASE}/api/download?url=${encodeURIComponent(item.downloadUrl)}` : item.providerUrl;
          const canRequestOpenSubtitlesDownload = item.provider === 'opensubtitles' && Boolean(item.downloadFileId);
          return <article className="subtitle-card" key={item.id}><div className="card-poster result-poster"><div className="result-poster-symbol">{item.provider === 'subdl' ? <Languages size={34}/> : <Captions size={40}/>}</div><span className="content-type">{item.provider === 'subdl' ? 'SubDL' : 'OpenSubtitles'}</span><span className="poster-year">{item.format.toUpperCase()}</span></div><div className="card-body"><div className="card-title-row"><h3 title={title}>{title}</h3><span className="language-tag">{persian ? 'فارسی' : item.language.toUpperCase()}</span></div><p>{item.release || (english ? 'Subtitle release' : 'نسخه زیرنویس')}</p><div className="quality-row"><span>{item.season !== undefined ? `S${String(item.season).padStart(2,'0')}` : ''}{item.episode !== undefined ? ` · E${String(item.episode).padStart(2,'0')}` : ''}{item.downloads ? ` · ${item.downloads.toLocaleString()} downloads` : ''}</span><span className="source-label">{item.provider}</span></div>{canRequestOpenSubtitlesDownload ? <button className="download-button" disabled={downloadingId === item.id} onClick={() => void downloadOpenSubtitles(item)}>{downloadingId === item.id ? <LoaderCircle className="spin" size={16}/> : <Download size={16}/>} {downloadingId === item.id ? (english ? 'Preparing…' : 'در حال آماده‌سازی…') : (english ? 'Download subtitle' : 'دریافت زیرنویس')}<ExternalLink size={14}/></button> : downloadHref ? <a className="download-button" href={downloadHref} target="_blank" rel="noreferrer"><Download size={16}/>{item.downloadUrl ? (english ? 'Download subtitle' : 'دریافت زیرنویس') : (english ? 'Open provider' : 'مشاهده در منبع')}<ExternalLink size={14}/></a> : <button className="download-button" disabled><Download size={16}/>{english ? 'Download unavailable' : 'دانلود در دسترس نیست'}</button>}</div></article>;
        })}</div>}
        {providers.length > 0 && <div className="provider-status"><b>{english ? 'Provider status' : 'وضعیت منابع'}</b>{providers.map((provider) => <div key={provider.provider}><span className={provider.enabled && !provider.error ? 'provider-dot active' : 'provider-dot'}/><span>{provider.provider}</span><span>{!provider.enabled ? (english ? 'API key missing' : 'کلید API تنظیم نشده') : provider.error ? provider.error : (english ? 'Connected' : 'پاسخ دریافت شد')}</span></div>)}</div>}
        <div className="provider-strip"><div className="provider-icon"><Languages size={22}/></div><div><b>{english ? 'More sources, one search' : 'منابع بیشتر، یک جست‌وجو'}</b><p>{english ? 'Provider results are merged when their API keys are configured.' : 'با تنظیم کلیدهای API، نتایج منابع مختلف در یک فهرست ترکیب می‌شوند.'}</p></div><span className="coming-soon">SUBFILM API</span></div>
      </section>
      <footer><a className="footer-brand" href="#"><Captions size={20}/> SubFilm</a><span>{english ? 'A community-first subtitle discovery project.' : 'پیدا کردن آسان زیرنویس فیلم و سریال.'}</span><a href="https://github.com/sahandse/SubFilm" target="_blank" rel="noreferrer"><Github size={17}/> GitHub</a></footer>
    </main>
  );
}