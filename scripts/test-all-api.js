const http = require('http');

const API_KEY = 'sk_99948a1dace9c103d7f16863a2606a1e2212dd966957079e3a46478cd60ca162';
const BASE = 'http://localhost:3000';

// Minimal test params per endpoint to avoid 400 errors
const testParams = {
  '/api/tools/anime': 'q=naruto',
  '/api/tools/anime-detail': 'id=1',
  '/api/tools/anime-episode': 'id=1',
  '/api/tools/anime-genres': '',
  '/api/tools/manga': 'q=naruto',
  '/api/tools/manga-detail': 'id=1',
  '/api/tools/manga-chapters': 'id=1',
  '/api/tools/manga-genres': '',
  '/api/tools/character': 'q=naruto',
  '/api/tools/character-detail': 'id=1',
  '/api/tools/top-anime': '',
  '/api/tools/waifu-im': '',
  '/api/tools/ytdl': 'url=https://youtu.be/dQw4w9WgXcQ',
  '/api/tools/igdl': 'url=https://www.instagram.com/p/C123456/',
  '/api/tools/xdl': 'url=https://twitter.com/user/status/123',
  '/api/tools/fbdl': 'url=https://facebook.com/watch?v=123',
  '/api/tools/tiktok': 'url=https://www.tiktok.com/@user/video/123',
  '/api/tools/bilibili-dl': 'url=https://www.bilibili.com/video/BV123',
  '/api/tools/dailymotion-dl': 'url=https://www.dailymotion.com/video/x123',
  '/api/tools/pinterest-dl': 'url=https://pinterest.com/pin/123',
  '/api/tools/reddit-dl': 'url=https://reddit.com/r/programming/comments/123',
  '/api/tools/soundcloud-dl': 'url=https://soundcloud.com/user/track',
  '/api/tools/streamable-dl': 'url=https://streamable.com/abc123',
  '/api/tools/twitch-dl': 'url=https://clips.twitch.tv/abc123',
  '/api/tools/vimeo-dl': 'url=https://vimeo.com/123',
  '/api/tools/lyrics': 'q=shape+of+you',
  '/api/tools/spotify': 'url=https://open.spotify.com/track/123',
  '/api/tools/movie': 'q=inception',
  '/api/tools/movie-detail': 'id=tt1375666',
  '/api/tools/tv-show': 'q=breaking+bad',
  '/api/tools/book': 'q=atomic+habits',
  '/api/tools/album-art': 'q=Thriller',
  '/api/tools/artist-info': 'q=Eminem',
  '/api/tools/music-search': 'q=shape+of+you',
  '/api/tools/podcast': 'q=technology',
  '/api/tools/sound-fx': 'q=explosion',
  '/api/tools/weather': 'city=Jakarta',
  '/api/tools/weather-forecast': 'city=Jakarta',
  '/api/tools/ip-lookup': '',
  '/api/tools/geoip': '',
  '/api/tools/ip-whois': 'ip=8.8.8.8',
  '/api/tools/news': '',
  '/api/tools/definition': 'word=serendipity',
  '/api/tools/kbbi': 'word=baik',
  '/api/tools/currency': '',
  '/api/tools/forex': 'from=USD&to=IDR',
  '/api/tools/timezone': '',
  '/api/tools/tz-convert': 'to=America/New_York',
  '/api/tools/crypto': '',
  '/api/tools/country': 'q=indonesia',
  '/api/tools/un-country': 'country=indonesia',
  '/api/tools/rest-country': 'code=ID',
  '/api/tools/pollution': 'lat=-6.2&lon=106.8',
  '/api/tools/space': '',
  '/api/tools/space-news': '',
  '/api/tools/covid': '',
  '/api/tools/covid-country': '',
  '/api/tools/earthquake': '',
  '/api/tools/steam': 'q=counter+strike',
  '/api/tools/stock': 'symbol=AAPL',
  '/api/tools/flight': 'from=CGK&to=SIN&date=2025-01-15',
  '/api/tools/train': 'from=Jakarta&to=Bandung',
  '/api/tools/gdp': 'country=indonesia',
  '/api/tools/hdi-index': '',
  '/api/tools/population': 'country=indonesia',
  '/api/tools/sentiment': 'text=I+love+this',
  '/api/tools/github': 'user=torvalds',
  '/api/tools/gh-repo': 'q=nextjs',
  '/api/tools/github-trending': '',
  '/api/tools/npm': 'q=express',
  '/api/tools/npm-trending': '',
  '/api/tools/crates-io': 'q=serde',
  '/api/tools/docker-hub': 'q=nginx',
  '/api/tools/devto-search': 'q=javascript',
  '/api/tools/stackoverflow': 'q=nextjs',
  '/api/tools/product-hunt': '',
  '/api/tools/random-user': '',
  '/api/tools/random-facts': '',
  '/api/tools/random-fact': '',
  '/api/tools/random-fox': '',
  '/api/tools/random-bunny': '',
  '/api/tools/random-dog-pose': '',
  '/api/tools/random-pokemon': '',
  '/api/tools/random-number': 'max=100',
  '/api/tools/random-color': '',
  '/api/tools/random-colors': '',
  '/api/tools/random-jokes': '',
  '/api/tools/random-quotes': '',
  '/api/tools/random-uuid': '',
  '/api/tools/random-advice': '',
  '/api/tools/trivia': '',
  '/api/tools/jokes': '',
  '/api/tools/dadjoke': '',
  '/api/tools/quotes': '',
  '/api/tools/inspire': '',
  '/api/tools/cat': '',
  '/api/tools/dog': '',
  '/api/tools/meme': '',
  '/api/tools/recipe': 'q=nasi+goreng',
  '/api/tools/hacker-news': '',
  '/api/tools/word-count': 'text=Hello+World',
  '/api/tools/base64': 'text=Hello',
  '/api/tools/slugify': 'text=Hello+World',
  '/api/tools/reverse-text': 'text=Hello',
  '/api/tools/lorem-ipsum': '',
  '/api/tools/hash': 'text=Hello',
  '/api/tools/hash-file': 'text=Hello',
  '/api/tools/password-gen': '',
  '/api/tools/text-to-mp3': 'text=Halo',
  '/api/tools/tts': 'text=Hello',
  '/api/tools/acronym': 'text=National+Aeronautics',
  '/api/tools/anagram': 'text=listen&text2=silent',
  '/api/tools/age-calc': 'birthday=1990-05-15',
  '/api/tools/ascii-art': 'text=Hello',
  '/api/tools/base-converter': 'number=FF&from=16&to=10',
  '/api/tools/bmi-calc': 'weight=70&height=175',
  '/api/tools/caesar-cipher': 'text=Hello&shift=3',
  '/api/tools/coin-flip': '',
  '/api/tools/color': '',
  '/api/tools/color-convert': 'color=%23FF5733&toFormat=rgb',
  '/api/tools/color-palette': 'hex=FF5733',
  '/api/tools/compound-interest': 'principal=10000&rate=5&years=10',
  '/api/tools/coordinate-convert': 'lat=40.7128&lon=-74.006',
  '/api/tools/covid-country': '',
  '/api/tools/csv-json': 'csv=name%0AJohn',
  '/api/tools/dice-roll': '',
  '/api/tools/discount-calc': 'price=100000&discount=20',
  '/api/tools/distance-calc': 'lat1=0&lon1=100&lat2=-6&lon2=106',
  '/api/tools/dns-lookup': 'domain=google.com',
  '/api/tools/email-validate': 'email=test@gmail.com',
  '/api/tools/factorial': 'number=10',
  '/api/tools/fibonacci': '',
  '/api/tools/flag-emoji': 'code=ID',
  '/api/tools/font-search': 'q=roboto',
  '/api/tools/gcd': 'a=12&b=8',
  '/api/tools/gradient': 'to=ff0000',
  '/api/tools/html-text': 'html=%3Ch1%3EHello%3C/h1%3E',
  '/api/tools/image-crop': '',
  '/api/tools/image-info': '',
  '/api/tools/json-csv': 'json=[{"a":1}]',
  '/api/tools/json-format': 'json={"a":1}',
  '/api/tools/json-validate': 'json={"a":1}',
  '/api/tools/json-xml': 'json={"a":1}',
  '/api/tools/lcm': 'a=4&b=6',
  '/api/tools/loan-calc': 'principal=10000000&rate=10&months=12',
  '/api/tools/markdown-html': 'text=%23+Hello',
  '/api/tools/math-eval': 'expression=2%2B2*3',
  '/api/tools/morse-decode': 'code=...+---+...',
  '/api/tools/morse-encode': 'text=SOS',
  '/api/tools/palindrome': 'text=madam',
  '/api/tools/phone-parse': 'phone=6281234567890',
  '/api/tools/phone-validate': 'phone=6281234567890',
  '/api/tools/pig-latin': 'text=hello',
  '/api/tools/pip-package': 'q=flask',
  '/api/tools/port-check': 'host=google.com&port=443',
  '/api/tools/prime-check': 'number=17',
  '/api/tools/qr-decode': '',
  '/api/tools/qrcode': 'text=https://google.com',
  '/api/tools/reddit-search': 'q=javascript',
  '/api/tools/rock-paper-scissors': '',
  '/api/tools/roman-numeral': 'number=42',
  '/api/tools/rot13': 'text=Hello',
  '/api/tools/shorturl': 'url=https://google.com',
  '/api/tools/ssl-check': 'domain=google.com',
  '/api/tools/tax-calc': 'amount=1000000&taxRate=11',
  '/api/tools/text-diff': 'text1=hello&text2=world',
  '/api/tools/text-stats': 'text=Hello+World',
  '/api/tools/text-stats-extended': 'text=Hello+World',
  '/api/tools/tip-calc': 'total=100000&tipPercent=10',
  '/api/tools/translate': 'text=Halo&to=en',
  '/api/tools/unit-convert': 'value=100&from=km&to=mile',
  '/api/tools/url-parse': 'url=https://google.com/search?q=hello',
  '/api/tools/url-validate': 'url=https://google.com',
  '/api/tools/uuid-gen': '',
  '/api/tools/uuid-validate': 'uuid=550e8400-e29b-41d4-a716-446655440000',
  '/api/tools/wage-calc': 'hourly=50000',
  '/api/tools/whois-domain': 'domain=google.com',
  '/api/tools/word-frequency': 'text=hello+world+hello',
  '/api/tools/wordgen': '',
  '/api/tools/xml-json': 'xml=%3Ca%3E1%3C/a%3E',
  '/api/tools/youtube-search': 'q=nodejs',
  '/api/tools/yt-search': 'q=nodejs',
  '/api/tools/wallpaper': '',
  '/api/tools/blur-img': '',
  '/api/tools/pixelate': '',
  '/api/tools/sharpen-img': '',
  '/api/tools/blur-img': '',
  '/api/tools/image-crop': '',
};

function fetch(path) {
  return new Promise((resolve) => {
    const params = testParams[path] !== undefined ? testParams[path] : '';
    const url = `${BASE}${path}${params ? '?' + params : ''}`;
    const req = http.get(url, { headers: { 'x-api-key': API_KEY }, timeout: 15000 }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, ok: json.status === true, message: json.message || '', data: json });
        } catch {
          resolve({ status: res.statusCode, ok: false, message: `Parse error: ${body.substring(0, 100)}` });
        }
      });
    });
    req.on('error', (err) => resolve({ status: 0, ok: false, message: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, ok: false, message: 'Timeout (15s)' }); });
  });
}

async function main() {
  // Read all endpoints from registry
  const fs = require('fs');
  const content = fs.readFileSync('src/lib/api-registry.ts', 'utf8');
  const endpoints = [...content.matchAll(/endpoint:\s*'([^']+)'/g)].map(m => m[1]);
  
  // Also scan route directories for any not in registry
  const path = require('path');
  const toolsDir = path.join(__dirname, '..', 'src', 'app', 'api', 'tools');
  const routeDirs = fs.readdirSync(toolsDir).filter(d => fs.statSync(path.join(toolsDir, d)).isDirectory());
  for (const dir of routeDirs) {
    const ep = `/api/tools/${dir}`;
    if (!endpoints.includes(ep)) endpoints.push(ep);
  }

  console.log(`Testing ${endpoints.length} endpoints...\n`);
  
  const results = { ok: 0, error: 0, errors: [] };
  
  // Process one at a time with delay to avoid rate limiting
  for (let i = 0; i < endpoints.length; i++) {
    const ep = endpoints[i];
    const r = await fetch(ep);

    if (r.ok) {
      results.ok++;
      console.log(`OK   [${i+1}/${endpoints.length}] ${ep}`);
    } else {
      results.error++;
      const errMsg = r.status ? `HTTP ${r.status}` : r.message;
      console.log(`ERR  [${i+1}/${endpoints.length}] ${ep} => ${r.message || errMsg}`);
      results.errors.push({ endpoint: ep, error: r.message || errMsg });
    }

    // Delay 600ms between requests (under 200/60s limit)
    if (i < endpoints.length - 1) await new Promise(r => setTimeout(r, 600));
  }
  
  console.log(`\n========== SUMMARY ==========`);
  console.log(`Total: ${endpoints.length} | OK: ${results.ok} | Error: ${results.error}`);
  
  if (results.errors.length > 0) {
    console.log(`\n--- Errors ---`);
    for (const e of results.errors) {
      console.log(`  ${e.endpoint}: ${e.error}`);
    }
  }
}

main();
