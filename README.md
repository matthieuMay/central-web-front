# Mini-Trello — Front

Requires Node.js `>=22.22.0`.

```bash
npm ci
npm run dev
```

This corrected Sprint 2 snapshot starts from the optional Sprint 1 Query bonus, based on the static `end/j2-sprint1-props` checkpoint. The original `data/board.json` remains a reference; `/board` displays only API data and reports request failures.

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

To exercise the board with the local fixture without running the API, use:

```powershell
$env:VITE_USE_MOCK_DATA = 'true'
npm run dev
```

Mock mode loads `data/board.json` and keeps card creation, editing, and movement in memory for the current browser session.

Visit `/board`. The Query bonus uses `useQuery` for GET and a labeled Add card form in each column (including empty Review). Try creating in Review, editing its title and reloading to check persistence. Its first commit shows intermediate non-optimistic forms: successful POST and PATCH invalidate the exact `['board', 'mini-trello']` query key. The corrected hooks immediately update the cache in both `onMutate` handlers, roll back failed writes and refetch on settle.

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

Board writes share one TanStack mutation scope to serialize network requests. The cache keeps a pre-batch snapshot and replays surviving optimistic changes when one write fails, retaining successful and still-pending writes. Once all writes settle, a single board invalidation reconciles their final server order, including after failure.

## Sprint 2 correction

Click a card to select it; click again to deselect. Move left/right uses the adjacent column in board order, appends there (even if Review is empty), then waits for the API and board refetch. While a card is selected, Left/Right arrow keys do the same thing outside of form controls and the edit Drawer. Failed moves leave the displayed card in place and show an error; successful ones preserve selection and focus and persist on reload.

The pencil opens an optional enriched Drawer for title and description; Cancel makes no request, Save validates the title, and failed saves keep the form available to retry. Cross-column Motion travel is also an optional teaching extension, disabled for reduced-motion users. The common Sprint 2 exercise only requires selection and persistent left/right movement.
