# Mini-Trello — Front

Requires Node.js `>=22.22.0`.

```bash
npm ci
npm run dev
```

This is the optional Sprint 1 Query bonus, based on the static `end/j2-sprint1-props` checkpoint. The original `data/board.json` remains a reference; `/board` displays only API data and reports request failures.

Start the **teacher-provided functional API** locally following its README: start Postgres via `docker compose up -d`, install dependencies, run its migration/seed command, then run its development server. Alternatively select its documented file-backed SQLite mode. The API must implement `GET /boards/mini-trello`, `POST /columns/:columnId/cards` and `PATCH /cards/:cardId`, permit the Vite origin via CORS and listen at `http://localhost:3000` (or set the URL below). The older API starter with only GET is insufficient for this bonus.

```bash
# Local frontend configuration (do not commit .env.local):
VITE_API_URL=http://localhost:3000 npm run dev
```

Visit `/board`. The final snapshot uses `useQuery` for GET, and a labeled Add card form in each column (including empty Review) and Save/Cancel on each card. Try creating in Review, editing its title and reloading to check persistence. The first bonus commit shows the intermediate non-optimistic forms: successful POST and PATCH each invalidate the exact `['board', 'mini-trello']` query key, so the form waits for the refetch. This final snapshot immediately updates the cache in both `onMutate` handlers, rolls back failed writes and refetches on settle.

To test a **failure without a server write**, with a running API and `/board` loaded, run the following in the browser console before submitting either form. It blocks the next POST or PATCH *before* the request reaches the server; the optimistic change appears briefly then rolls back with a visible error. Repeat the snippet for the other form. Reload to confirm the server data was not modified.

```js
const originalFetch = window.fetch
window.fetch = (...args) => {
  const method = args[1]?.method
  if (method === 'POST' || method === 'PATCH') {
    window.fetch = originalFetch
    return new Promise((_, reject) => setTimeout(() => reject(new Error('Simulated write failure')), 600))
  }
  return originalFetch(...args)
}
```

Board writes share one TanStack mutation scope to serialize network requests. The cache keeps a pre-batch snapshot and replays surviving optimistic changes when one write fails, retaining successful and still-pending writes. Once all writes settle, a single board invalidation reconciles their final server order, including after failure. `PUT /cards/:cardId` is reserved for Sprint 2 and is not called here.
