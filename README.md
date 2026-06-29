# Feed App Client

React frontend for the Feed App — a social feed with posts, comments, real-time updates, direct messages, and full authentication.

Pairs with [feed-app-server](https://github.com/codearemo/feed-app-server) (API + WebSockets). See the server’s `docs/client-agent.md` for the full API contract.

## Features

- **Auth** — Register, login, email verification, password reset, 2FA (TOTP), Google/Apple social sign-in
- **Feed** — Paginated post list with live updates over WebSocket
- **Posts** — Create (modal), view, edit, delete (confirm modal), image uploads, tags
- **Engagement** — Like posts and comments with optimistic UI; live count updates
- **Comments** — Thread on post detail with real-time create/update/delete
- **Profiles** — Own profile settings and public user profiles
- **Chat** — 1-on-1 DMs with inbox, unread badges, typing indicators, delivery/read receipts
- **Presence** — Online indicators on avatars via socket heartbeat
- **Settings** — Account settings and security (2FA setup/disable)
- **UI** — Dark mode, responsive layout, 600px feed column, modal/drawer overlay system

## Tech stack

- React 19 + TypeScript
- Vite 8
- React Router 7
- Tailwind CSS 4
- Axios (REST)
- Socket.IO client (real-time)
- `@react-oauth/google` (Google sign-in)

## Prerequisites

- Node.js 20+
- [feed-app-server](https://github.com/codearemo/feed-app-server) running locally (default `http://localhost:3000`)

## Getting started

```bash
# Install dependencies
npm install

# Copy env template and fill in values
cp .env.example .env

# Start dev server (default http://localhost:3010)
npm run dev
```

In development, Vite proxies `/api`, `/health`, and `/socket.io` to the backend so the client can use relative URLs and avoid CORS issues.

### Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | API path prefix. Use `/api/v1` in dev (proxied). |
| `VITE_API_PROXY_TARGET` | Backend URL for the Vite dev proxy (default `http://localhost:3000`). |
| `VITE_DEV_PORT` | Dev server port (default `3010`). |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (must match server `GOOGLE_CLIENT_ID`). |
| `VITE_APPLE_CLIENT_ID` | Apple Sign In client ID (must match server `APPLE_CLIENT_ID`). |

For production, set `VITE_API_BASE_URL` and optionally `VITE_API_ORIGIN` to your deployed API. See `.env.example` for details.

> **Never commit `.env`** — it is gitignored. Use `.env.example` as the template.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## Routes

| Path | Description |
|------|-------------|
| `/posts` | Feed (home) |
| `/posts/:postId` | Post detail + comments |
| `/posts/:postId/edit` | Edit post (author only) |
| `/messages` | Chat inbox |
| `/messages/:conversationId` | Conversation thread |
| `/users/:userId` | Public profile |
| `/profile` | Own profile |
| `/settings` | Settings |
| `/settings/security` | 2FA security settings |
| `/login`, `/register`, … | Auth flows |

## Project structure

```
src/
├── components/     # UI, layout, posts, chat, auth, overlay
├── context/        # Auth, socket, presence, chat inbox, theme, toast
├── hooks/          # Feed, comments, likes, socket rooms, overlays
├── lib/
│   ├── api/        # REST client, endpoints, types
│   ├── auth/       # Social providers, 2FA helpers
│   ├── socket/     # Socket event types, room binding
│   ├── posts/      # Likes, engagement merge helpers
│   └── chat/       # Read/delivery receipt helpers
└── pages/          # Route-level pages
```

## Real-time

The app connects to Socket.IO with the JWT from login. Key rooms and events:

- **Feed** — `feed:join` for live post create/update/delete on the home feed
- **Post** — `post:join` on detail pages for comments and likes
- **Chat** — `conversation:join` for messages, typing, delivery/read receipts
- **Presence** — `presence:heartbeat` + online/offline events for avatar dots

Connection status is shown in the header (pulse dot when connected).

## Production build

```bash
npm run build
```

Output goes to `dist/`. Serve as static files and point `VITE_API_BASE_URL` at your deployed API. Ensure the server allows your origin for CORS and WebSocket connections.

## License

Private — tutorial project.
