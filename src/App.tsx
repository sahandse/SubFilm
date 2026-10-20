import { useMemo, useState } from 'react';
import { Search, Captions, Languages, Film, Tv, Download, SlidersHorizontal, Sparkles, Github, ChevronDown, ArrowUpLeft } from 'lucide-react';

type Subtitle = { id: number; title: string; year: number; kind: 'فیلم' | 'سریال'; language: string; quality: string; source: string; detail: string; };
const examples: Subtitle[] = [
  { id: 1, title: 'Dune: Part Two', year: 2024, kind: 'فیلم', language: 'فارسی', quality: 'WEB-DL 1080p', source: 'نمونه نمایشی', detail: 'زیرنویس فارسی · هماهنگ با نسخه وب' },
  { id: 2, title: 'The Penguin', year: 2024, kind: 'سریال', language: 'فارسی', quality: 'WEB 1080p', source: 'نمونه نمایشی', detail: 'قسمت ۱ · فصل ۱ · زیرنویس فارسی' },
  { id: 3, title: 'Interstellar', year: 2014, kind: 'فیلم', language: 'English', quality: 'BluRay 2160p', source: 'نمونه نمایشی', detail: 'English subtitles · BluRay' },
  { id: 4, title: 'Shōgun', year: 2024, kind: 'سریال', language: 'فارسی', quality: 'WEB-DL 1080p', source: 'نمونه نمایشی', detail: 'قسمت ۱ · فصل ۱ · زیرنویس فارسی' },
];
const posters = [
  'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
  'https://image.tmdb.org/t/p/w500/1rO4xoCo4Z5WubK0OwdVll3DPYo.jpg',
  'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
  'https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSPhV7q8x0GZkM0S.jpg',
];

export default function App() {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('همه زبان‌ها');
  const [kind, setKind] = useState('همه');
  const [english, setEnglish] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const results = useMemo(() => examples.filter((item) => {
    const matchesQuery = item.title.toLowerCase().includes(query.trim().toLowerCase());
    const matchesLanguage = language === 'همه زبان‌ها' || item.language === language;
    const matchesKind = kind === 'همه' || item.kind === kind;
    return matchesQuery && matchesLanguage && matchesKind;
  }), [query, language, kind]);
  return (
    <main className={english ? 'app english' : 'app'} dir={english ? 'ltr' : 'rtl'}>
      <header className="topbar">
        <a className="brand" href="#" aria-label="SubFilm home"><span className="brand-mark"><Captions size={25}/></span><span>Sub<span>Film</span><small>SUBTITLE DISCOVERY</small></span></a>
        <nav><a className="nav-active" href="#search">{english ? 'Explore' : 'جست‌وجو'}</a><a href="#results">{english ? 'Movies & Series' : 'فیلم و سریال'}</a><a href="https://github.com/sahandse/SubFilm" target="_blank" rel="noreferrer">GitHub <ArrowUpLeft size={14}/></a></nav>
        <button className="language-toggle" onClick={() => setEnglish(!english)}><Languages size={17}/>{english ? 'فارسی' : 'English'}</button>
      </header>

      <section className="hero" id="search">
        <div className="hero-glow"/>
        <div className="eyebrow"><Sparkles size={15}/>{english ? 'YOUR NEXT SUBTITLE, FOUND' : 'زیرنویس مناسب، فقط چند ثانیه فاصله دارد'}</div>
        <h1>{english ? <>Every story.<br/><em>Every language.</em></> : <>هر داستانی،<br/><em>به زبان خودت.</em></>}</h1>
        <p>{english ? 'Find subtitles for your favorite movies and series in one place.' : 'زیرنویس فیلم‌ها و سریال‌های محبوبت را یک‌جا پیدا کن.'}</p>
        <div className="search-box">
          <Search size={22}/>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={english ? 'Search movie or series title...' : 'نام فیلم یا سریال را جست‌وجو کن...'} aria-label="Search subtitles"/>
          {query && <button className="clear-btn" onClick={() => setQuery('')} aria-label="پاک کردن جست‌وجو">×</button>}
          <button className="search-button" onClick={() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })}>{english ? 'Search' : 'جست‌وجو'} <ArrowUpLeft size={17}/></button>
        </div>
        <div className="quick-search"><span>{english ? 'Popular:' : 'جست‌وجوهای پیشنهادی:'}</span>{['Dune: Part Two', 'Interstellar', 'Shōgun'].map((s) => <button key={s} onClick={() => setQuery(s)}>{s}</button>)}</div>
        <div className="hero-art" aria-hidden="true"><div className="poster poster-back"><img src={posters[2]} alt=""/></div><div className="poster poster-mid"><img src={posters[1]} alt=""/></div><div className="poster poster-front"><img src={posters[0]} alt=""/><div className="poster-shade"/></div><div className="floating-caption"><Captions size={20}/><span>SUBTITLE<br/><b>FOUND</b></span><span className="caption-check">✓</span></div></div>
      </section>

      <section className="content-section" id="results">
        <div className="section-heading"><div><span className="section-kicker">{english ? 'THE SUBFILM LIBRARY' : 'کتابخانه SubFilm'}</span><h2>{english ? 'Find your subtitle' : 'زیرنویست رو پیدا کن'}</h2><p>{english ? 'A first look at the discovery experience.' : 'جست‌وجو در یک تجربه ساده و یکپارچه.'}</p></div><button className="filter-button" onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal size={17}/>{english ? 'Filters' : 'فیلترها'}<ChevronDown size={15}/></button></div>
        {showFilters && <div className="filters"><label>{english ? 'Language' : 'زبان'}<select value={language} onChange={(e) => setLanguage(e.target.value)}><option>همه زبان‌ها</option><option>فارسی</option><option>English</option></select></label><label>{english ? 'Type' : 'نوع محتوا'}<select value={kind} onChange={(e) => setKind(e.target.value)}><option>همه</option><option>فیلم</option><option>سریال</option></select></label><button onClick={() => {setLanguage('همه زبان‌ها');setKind('همه');setQuery('');}}>{english ? 'Reset' : 'پاک‌کردن فیلترها'}</button></div>}
        <div className="results-meta"><span>{english ? 'Featured examples' : 'نمونه‌های نمایشی'}</span><span className="demo-note"><span/> {english ? 'Demo data — provider APIs not connected yet' : 'داده نمایشی · اتصال به APIها در مراحل بعدی'}</span></div>
        {results.length ? <div className="subtitle-grid">{results.map((item) => { const originalIndex = examples.findIndex((x) => x.id === item.id); return <article className="subtitle-card" key={item.id}><div className="card-poster"><img src={posters[originalIndex]} alt="" loading="lazy"/><span className="content-type">{item.kind === 'فیلم' ? <Film size={13}/> : <Tv size={13}/>} {item.kind}</span><span className="poster-year">{item.year}</span></div><div className="card-body"><div className="card-title-row"><h3>{item.title}</h3><span className="language-tag">{item.language}</span></div><p>{item.detail}</p><div className="quality-row"><span>{item.quality}</span><span className="source-label">{item.source}</span></div><button className="download-button" onClick={() => alert(english ? 'This is sample content. Subtitle provider integration will be added in the next phase.' : 'این مورد نمایشی است. اتصال منابع واقعی زیرنویس در مرحله بعد اضافه می‌شود.')}><Download size={16}/>{english ? 'Download subtitle' : 'دریافت زیرنویس'}<span>↙</span></button></div></article>; })}</div> : <div className="empty-state"><Search size={28}/><h3>{english ? 'No matching subtitles' : 'نتیجه‌ای پیدا نشد'}</h3><p>{english ? 'Try another title or clear the filters.' : 'نام دیگری را جست‌وجو کن یا فیلترها را پاک کن.'}</p><button onClick={() => {setQuery('');setLanguage('همه زبان‌ها');setKind('همه');}}>{english ? 'Clear search' : 'پاک کردن جست‌وجو'}</button></div>}
        <div className="provider-strip"><div className="provider-icon"><Languages size={22}/></div><div><b>{english ? 'More sources, one search' : 'منابع بیشتر، یک جست‌وجو'}</b><p>{english ? 'Provider integrations are planned for the next development phase.' : 'در مرحله بعد، منابع مجاز زیرنویس را به جست‌وجوی یکپارچه متصل می‌کنیم.'}</p></div><span className="coming-soon">COMING SOON</span></div>
      </section>
      <footer><a className="footer-brand" href="#"><Captions size={20}/> SubFilm</a><span>{english ? 'A community-first subtitle discovery project.' : 'پروژه‌ای برای پیدا کردن آسان زیرنویس.'}</span><a href="https://github.com/sahandse/SubFilm" target="_blank" rel="noreferrer"><Github size={17}/> GitHub</a></footer>
    </main>
  );
}