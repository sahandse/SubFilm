export type CatalogTitle = {
  id: string;
  title: string;
  aliases: string[];
  year: number;
  kind: 'movie' | 'tv';
};

export const catalog: CatalogTitle[] = [
  { id: 'interstellar', title: 'Interstellar', aliases: ['میان‌ستاره‌ای', 'interstellar'], year: 2014, kind: 'movie' },
  { id: 'inception', title: 'Inception', aliases: ['تلقین', 'inception'], year: 2010, kind: 'movie' },
  { id: 'dune-part-two', title: 'Dune: Part Two', aliases: ['تلماسه ۲', 'dune part two', 'dune 2'], year: 2024, kind: 'movie' },
  { id: 'the-dark-knight', title: 'The Dark Knight', aliases: ['شوالیه تاریکی', 'dark knight'], year: 2008, kind: 'movie' },
  { id: 'oppenheimer', title: 'Oppenheimer', aliases: ['اوپنهایمر', 'oppenheimer'], year: 2023, kind: 'movie' },
  { id: 'arrival', title: 'Arrival', aliases: ['ورود', 'arrival'], year: 2016, kind: 'movie' },
  { id: 'parasite', title: 'Parasite', aliases: ['انگل', 'parasite'], year: 2019, kind: 'movie' },
  { id: 'the-matrix', title: 'The Matrix', aliases: ['ماتریکس', 'matrix'], year: 1999, kind: 'movie' },
  { id: 'interview-with-vampire', title: 'Interview with the Vampire', aliases: ['مصاحبه با خون‌آشام', 'interview with the vampire'], year: 1994, kind: 'movie' },
  { id: 'the-shawshank-redemption', title: 'The Shawshank Redemption', aliases: ['رستگاری در شاوشنک', 'shawshank redemption'], year: 1994, kind: 'movie' },
  { id: 'everything-everywhere', title: 'Everything Everywhere All at Once', aliases: ['همه‌چیز همه‌جا به یکباره', 'everything everywhere all at once'], year: 2022, kind: 'movie' },
  { id: 'spider-verse', title: 'Spider-Man: Across the Spider-Verse', aliases: ['اسپایدرمن در میان دنیای عنکبوتی', 'across the spider verse'], year: 2023, kind: 'movie' },
  { id: 'the-godfather', title: 'The Godfather', aliases: ['پدرخوانده', 'godfather'], year: 1972, kind: 'movie' },
  { id: 'pulp-fiction', title: 'Pulp Fiction', aliases: ['داستان عامه‌پسند', 'pulp fiction'], year: 1994, kind: 'movie' },
  { id: 'whiplash', title: 'Whiplash', aliases: ['ویپلش', 'whiplash'], year: 2014, kind: 'movie' },
  { id: 'the-batman', title: 'The Batman', aliases: ['بتمن', 'the batman'], year: 2022, kind: 'movie' },
  { id: 'shogun', title: 'Shōgun', aliases: ['شوگون', 'shogun'], year: 2024, kind: 'tv' },
  { id: 'breaking-bad', title: 'Breaking Bad', aliases: ['بریکینگ بد', 'breaking bad'], year: 2008, kind: 'tv' },
  { id: 'better-call-saul', title: 'Better Call Saul', aliases: ['بهتره با سال تماس بگیری', 'better call saul'], year: 2015, kind: 'tv' },
  { id: 'dark', title: 'Dark', aliases: ['دارک', 'dark netflix'], year: 2017, kind: 'tv' },
  { id: 'the-last-of-us', title: 'The Last of Us', aliases: ['آخرین بازمانده از ما', 'the last of us'], year: 2023, kind: 'tv' },
  { id: 'severance', title: 'Severance', aliases: ['جداسازی', 'severance'], year: 2022, kind: 'tv' },
  { id: 'the-bear', title: 'The Bear', aliases: ['خرس', 'the bear'], year: 2022, kind: 'tv' },
  { id: 'succession', title: 'Succession', aliases: ['وراثت', 'succession'], year: 2018, kind: 'tv' },
  { id: 'the-office', title: 'The Office', aliases: ['اداره', 'the office'], year: 2005, kind: 'tv' },
  { id: 'friends', title: 'Friends', aliases: ['فرندز', 'دوستان', 'friends'], year: 1994, kind: 'tv' },
  { id: 'the-witcher', title: 'The Witcher', aliases: ['ویچر', 'the witcher'], year: 2019, kind: 'tv' },
  { id: 'arcane', title: 'Arcane', aliases: ['آرکین', 'arcane'], year: 2021, kind: 'tv' },
  { id: 'planet-earth', title: 'Planet Earth', aliases: ['سیاره زمین', 'planet earth'], year: 2006, kind: 'tv' },
  { id: 'blue-eye-samurai', title: 'Blue Eye Samurai', aliases: ['سامورایی چشم آبی', 'blue eye samurai'], year: 2023, kind: 'tv' }
];
