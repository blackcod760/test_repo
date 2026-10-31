# Flow — Next.js bot flow editor

Next.js reimplementation of Bot_ui (a Vue 3 node-based WhatsApp bot flow editor) — scaffold + one vertical slice.

## Stack

- **Next.js 15** (App Router, TypeScript) — app shell, routing, API route handlers
- **React Flow** (`@xyflow/react`) — node canvas (replaces Vue Flow)
- **Zustand** — state management (replaces Pinia)
- **Feature folders** — `src/features/<feature>/` owns its components, store and API access

## Getting started

```bash
cp .env.example .env.local   # fill in bbot credentials
npm ci
npm run dev
```

## Backend proxy

The bbot backend is reachable **only** through Next.js route handlers under `src/app/api/`.
Credentials (`BBOT_AUTH_USER`, `BBOT_AUTH_PASSWORD`) live in server-side env and are never
sent to the browser — the UI talks to `/api/flows` via the SDK adapter in
`src/features/flows/api/flowsApi.ts`, and the route handlers attach basic auth upstream.

## Layout

```
src/
  app/                  # app shell, routing, API route handlers (server only)
    api/flows/          # proxy to bbot.4ja.ai
  features/
    flows/              # canvas feature: store, api, components
      api/              # SDK adapter layer — the only place UI calls the backend
      components/
      store/            # Zustand store
    textNode/           # the vertical-slice node type
  shared/               # cross-feature types and helpers
docs/PHASED_PLAN.md     # mapping of remaining Bot_ui features to future specs
```

## Tests

```bash
npm test
```

Covers the vertical-slice node end-to-end at the store level: add, edit, connect, save/load.

## Phased plan

See [docs/PHASED_PLAN.md](docs/PHASED_PLAN.md) for what is deliberately out of scope here
(~20 node editors, surveys, media, variables, tours) and how those map to future specs.
