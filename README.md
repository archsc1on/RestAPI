# MessageAPI v1.0.0

Unified Messaging API - One API for WhatsApp, Telegram & Discord. Simple, secure, and infinitely scalable.

## Features

- **Unified API** - Single endpoint for WhatsApp, Telegram, and Discord
- **Secure** - API Key authentication with rate limiting & IP whitelist
- **Fast** - Low latency, high throughput message delivery
- **Analytics** - Real-time usage tracking and detailed logs

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/send` | Send message via WhatsApp, Telegram, or Discord |
| GET | `/api/tools/ip-lookup` | Lookup geolocation info for an IP address |
| GET | `/api/tools/yt-search` | Search YouTube videos by keyword |
| GET | `/api/tools/tts` | Convert text to speech audio |
| GET | `/api/tools/qrcode` | Generate QR code from any text or URL |
| GET | `/api/tools/shorturl` | Shorten any URL |
| GET | `/api/tools/weather` | Get current weather for any city |
| GET | `/api/tools/github` | Get GitHub user profile information |
| GET | `/api/tools/translate` | Translate text to any language |
| GET | `/api/tools/anime` | Search anime from MyAnimeList |
| GET | `/api/tools/lyrics` | Search song lyrics |
| GET | `/api/tools/spotify` | Get Spotify track/album info |
| GET | `/api/tools/ig` | Get Instagram post information |
| GET | `/api/tools/tiktok` | Get TikTok video information |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Xendit API key (for WhatsApp integration)

### Installation

```bash
git clone https://github.com/Dzxak-Cloud/RestAPI.git
cd RestAPI
npm install
```

### Environment Variables

Create `.env.local` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/messageapi"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
XENDIT_SECRET_KEY="your-xendit-key"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm run start
```

### Docker

```bash
docker-compose up -d
```

## Pricing

| Plan | Price | Credits/Day | API Keys | Rate Limit |
|------|-------|-------------|----------|------------|
| Free | Rp0 | 100 | 1 | 30 req/min |
| Premium | Rp25K/month | 10K | 5 | 120 req/min |
| VIP | Rp50K/month | 100K | 20 | 500 req/min |

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma
- **Auth**: NextAuth.js
- **UI**: Tailwind CSS + Framer Motion
- **Validation**: Zod
- **Logging**: Winston

## License

MIT License - see [LICENSE](LICENSE) file
