# EchoLove 🌸

**Your Digital Garden for Nurturing Relationships**

A privacy-first, local-first Progressive Web App (PWA) that helps you maintain meaningful connections with your loved ones through AI-powered message drafting.

## Features

- **The Garden**: Visual dashboard showing your "Inner Circle" as floating cards
- **The Echo Engine**: AI-powered message generation with customizable "Vibes"
- **Local-First**: All data stored in your browser (IndexedDB) - zero server storage
- **PWA**: Installable to your home screen for native app experience

## Tech Stack

- **Frontend**: Next.js 16 + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: Dexie.js (IndexedDB)
- **AI**: OpenAI API (optional)
- **State**: Zustand

## Getting Started

```bash
cd pwa
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### For AI Features (FREE!)

We use **Groq** - a free AI API with no credit card required.

1. Go to [console.groq.com](https://console.groq.com) and sign up (free)
2. Create an API key
3. Create `.env.local` in the `pwa` folder:

```
GROQ_API_KEY=your_groq_key_here
```

1. Restart the dev server

## Installing as PWA

1. Open the app in Chrome/Safari on your phone
2. Tap "Add to Home Screen"
3. Launch from your home screen for the full experience

## Privacy

Your relationship data never leaves your device. EchoLove stores everything locally in IndexedDB 🛡️
