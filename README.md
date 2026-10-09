# Mini-Trello — Front

Requires Node.js `>=22.22.0`.

```bash
npm ci
npm run dev
```

The `/board` route loads the board from the Mini-Trello API and persists card
edits and moves back to it. Point the front at the API with `VITE_API_URL`
(defaults to `http://localhost:3000`):

```bash
cp .env.example .env
```

Start the API (`centrale-web-api`) first; its CORS origin defaults to the Vite
dev server at `http://localhost:5173`. The board id is `mini-trello`.
