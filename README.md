# Mini-Trello — Front

Requires Node.js `>=22.22.0`.

```bash
npm ci
npm run dev
```

Run the move regression checks with `node --test tests/move-card.test.mjs`.

This is the optional Sprint 1 Query bonus, based on the static `end/j2-sprint1-props` checkpoint. The original `data/board.json` remains a reference; `/board` displays only API data and reports request failures.

Start the **teacher-provided functional API** from its own repository (Node.js 22+). For the default Postgres setup:

```bash
cp .env.example .env
npm ci
docker compose -f docker-compose.yml -f docker-compose.j2.yml up -d db pgweb
docker compose -f docker-compose.yml -f docker-compose.j2.yml ps  # wait for db: healthy
npm run db:migrate
npm run dev
```

Alternatively set `DB_DRIVER=sqlite` in the API environment, then run `npm run db:migrate` and `npm run dev` without Docker. Consult the API README for reset and pgweb instructions. It serves `http://localhost:3000` and allows `http://localhost:5173` by default. The older API starter with only GET is insufficient for this bonus.

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

Card creation, editing and moving share one TanStack mutation scope to serialize network requests. The cache keeps a pre-batch snapshot and replays surviving optimistic changes when a write fails, retaining successful and still-pending writes. Once all writes settle, a single background board invalidation reconciles their final server order, including after failure.

Select a card, then use the left/right buttons or arrow keys to move it with `PUT /cards/:cardId`. The card moves immediately with a 220 ms shared layout transition; reduced-motion preferences disable positional animation. The controls keep a stable height while saving and the existing board stays visible during background refreshes, including when a refresh fails. A failed move rolls back its optimistic change, shows a French alert, keeps the selection and lets you retry. Selecting or deselecting a card clears the previous move error. A lost response may hide a move that the server completed; the background refresh recovers its actual position. If the API remains unavailable, the actual position cannot be confirmed until a successful reload.

To simulate a **move failure without a server write**, run this in the browser console with `/board` loaded, then move a selected card. The next PUT is rejected before it reaches the API. Check that the card moves immediately, returns to its original column with an alert, and retry; the next request runs normally.

```js
const originalMoveFetch = window.fetch
window.fetch = (...args) => {
  if (args[1]?.method === 'PUT') {
    window.fetch = originalMoveFetch
    return new Promise((_, reject) => setTimeout(() => reject(new Error('Simulated move failure')), 600))
  }
  return originalMoveFetch(...args)
}
```
