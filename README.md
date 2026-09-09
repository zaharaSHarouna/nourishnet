# FoodSave (prototype)

A community food-rescue platform prototype: React + Vite + Tailwind, with a
tiny serverless function that proxies AI features to Claude.

## Run it locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

AI features (match explanations, translation, the Assistant chat) will say
"AI isn't available right now" until you add an API key — see below. Every
AI-assisted feature has a manual fallback, by design.

## Deploy it for real — Vercel (recommended, ~5 minutes)

Vercel builds the Vite app **and** runs `/api/ai.js` as a serverless
function automatically — no extra setup needed.

1. Push this folder to a GitHub repo.
2. Go to https://vercel.com → **Add New Project** → import that repo.
3. Vercel auto-detects the Vite framework from `vercel.json`. Leave the
   build settings as-is.
4. Under **Environment Variables**, add:
   - `ANTHROPIC_API_KEY` = your key from https://console.anthropic.com
5. Click **Deploy**. You'll get a public `https://your-project.vercel.app` URL.

Don't have an API key yet, or don't want to add one right now? Deploy
without it — the site still works, AI features just show their built-in
"not available" fallback instead of failing.

## Deploy it — Netlify (alternative)

1. Push to GitHub, then **Add new site → Import an existing project** in Netlify.
2. Build command: `npm run build`   Publish directory: `dist`
3. Netlify Functions work a little differently from Vercel's `/api` folder —
   move `api/ai.js` into `netlify/functions/ai.js` and change the fetch
   path in `src/App.jsx` from `/api/ai` to `/.netlify/functions/ai`.
4. Add the `ANTHROPIC_API_KEY` environment variable in Site settings.

## Important things to know before this is truly public

This is a working **prototype**, not a production platform yet:

- **Data storage**: uses the browser's `localStorage`, so listings/requests
  are only visible on the device that created them — not shared between
  different visitors. For a real multi-user platform, swap the four
  functions at the top of `src/App.jsx` (`loadShared`, `saveShared`,
  `loadPersonal`, `savePersonal`) for calls to a real database — the
  original design spec calls for **Supabase (Postgres + Row Level
  Security + Auth + Storage)**, which every other component is already
  structured to work with.
- **Auth**: currently a simple demo role-picker with no password or
  verification. Replace with Supabase Auth before handling real users.
- **Your Anthropic API key** stays server-side in the `/api/ai` function —
  never in the browser — but you're still responsible for normal API
  usage costs and rate limits once this is public.
- **Images, maps, email notifications** are simplified or stubbed in this
  prototype (see the code comments in `src/App.jsx` for exactly where).

## Project structure

```
index.html            entry HTML
src/main.jsx           React bootstrap
src/App.jsx             the whole app (routing, i18n, all screens)
src/index.css           Tailwind entry point
api/ai.js               serverless function that calls Claude, key stays server-side
vercel.json             Vercel build config
```
