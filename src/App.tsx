import { useMemo, useState } from 'react';
import { Search, Captions, Languages, Film, Tv, SlidersHorizontal, Sparkles, Github, ChevronDown, ArrowUpLeft, ExternalLink, Database, Info } from 'lucide-react';
import { catalog } from './catalog';

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\\/$/, '');
type SubtitleItem = { name?: string; release_name?: string; language?: string; format?: string; url?: string; season?: number; episode?: number; unpack_files?: Array<{ name?: string; language?: string; format?: string; url?: string; season?: number; episode?: number }> };

export default function App() {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('fa');
  const [kind, setKind] = useState('all');
  const [year, setYear] = useState('');
  const [season, setSeason] = useState('');
  const [episode, setEpisode] = useState('');
  const [english, setEnglish] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [liveSubtitles, setLiveSubtitles] = useState<SubtitleItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState('');

  const titles = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return catalog.filter((item) => {
      const matchesQuery = !needle || [item.title, ...item.aliases].some((value) => value.toLocaleLowerCase().includes(needle));
      const matchesKind = kind === 'all' || item.kind === kind;
      const matchesYear = !year || String(item.year) === year;
      return matchesQuery && matchesKind && matchesYear;
    });
  }, [query, kind, year]);

  function searchSubtitles(searchTerm = query) {
    setQuery(searchTerm);
    setHasSearched(true);
  }

  function resetFilters() {
    setLanguage('fa'); setKind('all'); setYear(''); setSeason(''); setEpisode('');
  }

  function providerSearchUrl(title: string) {
    const parts = [title, language === 'fa' ? 'Persian' : language === 'en' ? 'English' : '', season ? `S${season.padStart(2, '0')}` : '', episode ? `E${episode.padStart(2, '0')}` : ''].filter(Boolean);
    return `https://www.opensubtitles.com/en/search2?query=${encodeURIComponent(parts.join(' '))}`;
  }

  return (
    <main className={english ? 'app english' : 'app'} dir={english ? 'ltr' : 'rtl'}>
      <header className="topbar">
        <a className="brand" href="#" aria-label="SubFilm home"><span className="brand-mark"><Captions size={25}/></span><span>Sub<span>Film</span><small>STATIC SUBTITLE CATALOG</small></span></a>
        <nav><a className="nav-active" href="#search">{english ? 'Explore' : 'جست‌وجو'}</a><a href="#results">{english ? 'Title catalog' : 'فهرست عنوان‌ها'}</a><a href="https://github.com/sahandse/SubFilm" target="_blank" rel="noreferrer">GitHub <ArrowUpLeft size={14}/></a></nav>
        <button className="language-toggle" onClick={() => setEnglish(!english)}><Languages size={17}/>{english ? 'فارسی' : 'English'}</button>
      </header>

      <section className="hero" id="search">
        <div className="hero-glow"/>
        <div className="eyebrow"><Sparkles size={15}/>{english ? 'A STATIC CATALOG, NO BACKEND REQUIRED' : 'فهرست آفلاینِ عنوان‌ها؛ بدون نیاز به بک‌اند'}</div>
        <h1>{english ? <>Find your title.<br/><em>Choose your source.</em></> : <>عنوانت را پیدا کن،<br/><em>منبع را انتخاب کن.</em></>}</h1>
        <p>{english ? 'Search the built-in title catalog, then open a subtitle provider.' : 'در فهرست داخلی فیلم و سریال جست‌وجو کن و برای بررسی زیرنویس به منبع برو.'}</p>
        <form className="search-box" onSubmit={(event) => { event.preventDefault(); searchSubtitles(); }}>
          <Search size={22}/>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={english ? 'Search movie or series title...' : 'نام فیلم یا سریال را جست‌وجو کن...'} aria-label="Search titles" maxLength={120}/>
          {query && <button type="button" className="clear-btn" onClick={() => {setQuery(''); setHasSearched(false);}} aria-label="Clear search">×</button>}
          <button className="search-button" type="submit">{english ? 'Search' : 'جست‌وجو'} <ArrowUpLeft size={17}/></button>
        </form>
        <div className="quick-search"><span>{english ? 'Try:' : 'امتحان کن:'}</span>{['Dune', 'Interstellar', 'Shōgun', 'بریکینگ بد'].map((s) => <button key={s} onClick={() => searchSubtitles(s)}>{s}</button>)}</div>
        <div className="hero-art" aria-hidden="true"><div className="poster poster-back"><div className="poster-symbol"><Film size={38}/></div></div><div className="poster poster-mid"><div className="poster-symbol"><Tv size={38}/></div></div><div className="poster poster-front"><div className="poster-symbol"><Captions size={48}/></div><div className="poster-shade"/></div><div className="floating-caption"><Captions size={20}/><span>SUBTITLE<br/><b>DISCOVERY</b></span><span className="caption-check">✓</span></div></div>
      </section>

      <section className="content-section" id="results">
        <div className="section-heading"><div><span className="section-kicker">{english ? 'BUILT-IN TITLE CATALOG' : 'فهرست ثابت SubFilm'}</span><h2>{english ? 'Find a title' : 'جست‌وجوی عنوان'}</h2><p>{english ? 'The catalog is bundled with the website and works without an API.' : 'این فهرست همراه سایت منتشر می‌شود و بدون API کار می‌کند.'}</p></div><button className="filter-button" onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal size={17}/>{english ? 'Filters' : 'فیلترها'}<ChevronDown size={15}/></button></div>
        {showFilters && <div className="filters">
          <label>{english ? 'Subtitle language' : 'زبان موردنظر'}<select value={language} onChange={(e) => setLanguage(e.target.value)}><option value="fa">فارسی</option><option value="en">English</option><option value="all">{english ? 'Any language' : 'هر زبانی'}</option></select></label>
          <label>{english ? 'Content type' : 'نوع محتوا'}<select value={kind} onChange={(e) => setKind(e.target.value)}><option value="all">{english ? 'All' : 'همه'}</option><option value="movie">{english ? 'Movie' : 'فیلم'}</option><option value="tv">{english ? 'Series' : 'سریال'}</option></select></label>
          <label>{english ? 'Year' : 'سال انتشار'}<input inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0,4))} placeholder="2024"/></label>
          <label>{english ? 'Season (optional)' : 'فصل (اختیاری)'}<input inputMode="numeric" value={season} onChange={(e) => setSeason(e.target.value.replace(/\D/g, '').slice(0,3))} placeholder="1"/></label>
          <label>{english ? 'Episode (optional)' : 'قسمت (اختیاری)'}<input inputMode="numeric" value={episode} onChange={(e) => setEpisode(e.target.value.replace(/\D/g, '').slice(0,3))} placeholder="1"/></label>
          <button onClick={resetFilters}>{english ? 'Reset filters' : 'پاک‌کردن فیلترها'}</button>
        </div>}
        {hasSearched && <div className="status-panel" role="status"><Info size={20}/><span>{loading ? (english ? 'Searching SubDL…' : 'در حال جست‌وجو در SubDL…') : apiMessage}</span></div>}
        {liveSubtitles && liveSubtitles.length > 0 && <div className="subtitle-grid live-subtitle-grid">{liveSubtitles.map((sub, index) => { const files = Array.isArray(sub.unpack_files) ? sub.unpack_files : []; const target = sub.url ? (sub.url.startsWith('http') ? sub.url : 'https://dl.subdl.com' + sub.url) : (files[0]?.url ? (files[0].url!.startsWith('http') ? files[0].url : 'https://dl.subdl.com' + files[0].url) : 'https://subdl.com'); return <article className="subtitle-card" key={(sub.url || sub.name || 'subtitle') + index}><div className="card-poster result-poster"><div className="result-poster-symbol"><Captions size={34}/></div><span className="content-type">{sub.language || (english ? 'Subtitle' : 'زیرنویس')}</span><span className="poster-year">{sub.format || 'ZIP/SRT'}</span></div><div className="card-body"><div className="card-title-row"><h3 title={sub.release_name || sub.name || 'SubDL subtitle'}>{sub.release_name || sub.name || (english ? 'Subtitle file' : 'فایل زیرنویس')}</h3><span className="language-tag">SubDL</span></div><p>{[sub.season ? `S${sub.season}` : '', sub.episode ? `E${sub.episode}` : '', files.length ? `${files.length} ${english ? 'files' : 'فایل'}` : ''].filter(Boolean).join(' · ') || (english ? 'Live result' : 'نتیجه زنده')}</p><div className="quality-row"><span>{english ? 'Provider result' : 'نتیجه منبع'}</span><span className="source-label">SubDL</span></div><a className="download-button" href={target} target="_blank" rel="noopener noreferrer"><ExternalLink size={16}/>{english ? 'Open subtitle' : 'بازکردن زیرنویس'}<ArrowUpLeft size={14}/></a></div></article>; })}</div>}\n\n        <div className="results-meta"><span>{hasSearched ? (english ? `${titles.length} catalog matches` : `${titles.length} عنوان در فهرست داخلی`) : (english ? `${catalog.length} titles available` : `${catalog.length} عنوان آماده جست‌وجو`)}</span><span className="demo-note"><span/>{english ? 'Static catalog · provider results are not cached here' : 'فهرست ثابت · نتایج منبع خارجی ذخیره نمی‌شوند'}</span></div>

        <div className="status-panel" role="note"><Info size={20}/><span>{english ? 'This is a searchable title catalog, not a database of verified subtitle files. Subtitle availability is checked on the external provider after you open it.' : 'این فهرست عنوان فیلم و سریال است، نه آرشیو فایل‌های زیرنویسِ تأییدشده. موجود بودن زیرنویس پس از ورود به منبع خارجی بررسی می‌شود.'}</span></div>

        {titles.length === 0 && <div className="empty-state"><Search size={28}/><h3>{english ? 'No matching title' : 'عنوانی پیدا نشد'}</h3><p>{english ? 'Try another title or reset your filters.' : 'نام دیگری را جست‌وجو کن یا فیلترها را پاک کن.'}</p><button onClick={() => {setQuery(''); resetFilters(); setHasSearched(false);}}>{english ? 'Show all titles' : 'نمایش همه عنوان‌ها'}</button></div>}
        {titles.length > 0 && <div className="subtitle-grid">{titles.map((item) => {
          const url = providerSearchUrl(item.title);
          return <article className="subtitle-card" key={item.id}><div className="card-poster result-poster"><div className="result-poster-symbol">{item.kind === 'movie' ? <Film size={34}/> : <Tv size={34}/>}</div><span className="content-type">{item.kind === 'movie' ? (english ? 'Movie' : 'فیلم') : (english ? 'Series' : 'سریال')}</span><span className="poster-year">{item.year}</span></div><div className="card-body"><div className="card-title-row"><h3 title={item.title}>{item.title}</h3><span className="language-tag">{english ? 'Search' : 'جست‌وجو'}</span></div><p>{english ? 'Check subtitle availability on OpenSubtitles.' : 'بررسی موجود بودن زیرنویس در OpenSubtitles'}</p><div className="quality-row"><span>{english ? 'Catalog entry' : 'عنوان فهرست'}</span><span className="source-label">OpenSubtitles</span></div><a className="download-button" href={url} target="_blank" rel="noopener noreferrer"><Search size={16}/>{english ? 'Search subtitles' : 'جست‌وجو در منبع'}<ExternalLink size={14}/></a></div></article>;
        })}</div>}

        <div className="provider-strip"><div className="provider-icon"><Database size={22}/></div><div><b>{english ? 'Static by design' : 'طراحی‌شده برای GitHub Pages'}</b><p>{english ? 'No backend, API keys, or live provider requests are needed to browse this catalog. Use the external search link to check current availability.' : 'برای مرور فهرست به بک‌اند، کلید API یا درخواست زنده نیاز نیست؛ برای بررسی موجودی فعلی زیرنویس از لینک منبع استفاده کن.'}</p></div><span className="coming-soon">STATIC DATA</span></div>
      </section>
      <footer><a className="footer-brand" href="#"><Captions size={20}/> SubFilm</a><span>{english ? 'A static subtitle discovery catalog.' : 'فهرست ثابت برای پیدا کردن زیرنویس فیلم و سریال.'}</span><a href="https://github.com/sahandse/SubFilm" target="_blank" rel="noreferrer"><Github size={17}/> GitHub</a></footer>
    </main>
  );
}
