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

Board writes share one TanStack mutation scope and a synchronous local guard, acquired before optimistic cache changes, to prevent concurrent local writes and duplicate triggers. The cache keeps a pre-batch snapshot and replays surviving optimistic changes when one write fails, retaining successful and still-pending writes. Once all writes settle, a single board invalidation reconciles their final server order, including after failure.

## Sprint 2 correction

Click a card to select it; click again or press Escape to deselect. Cards can also be selected with Enter/Space when focused. Move left/right and Left/Right arrows append to the adjacent column in board order, including empty columns. Up/Down arrows reorder the selected card by one position without wrapping. Arrow shortcuts leave form controls and the edit Drawer alone.

Drag the grip at a card's top right to insert it before, between or after cards, in the same column or another one. The translucent, slightly tilted preview follows the pointer; the insertion line marks the destination. Empty columns accept drops. Dropping outside a cards region animates the card from the release point back to its original position, restoring opacity and removing the tilt without a request or confetti. Dropping at the unchanged position also sends no request. Touch dragging and multi-card dragging are outside this version's scope.

Moves appear immediately and use the same optimistic ledger as creation/editing. A failed save animates back and shows an error while retaining other writes. New moves wait for current board writes and reconciliation to finish. Selection/focus is preserved and saved order survives reload. Failed reconciliation offers Retry without discarding the displayed board.

Indexed moves send `PUT /cards/:cardId`, `Content-Type: application/json`, with e.g. `{"column":"doing","position":1}` and receive `BoardData`. Position is zero-based **after removing the card**. Horizontal actions omit position to append.

Motion animates reordering, cross-column travel and rollback; after a drag, landing starts at the release position. A localized confetti burst acknowledges forward visual arrival, including while saving is still pending. A later failure returns the card without another burst. Reduced-motion users get placement feedback without travel, tilt or flying particles.

Cards display their unfinished checklist tasks, assigned members as initials avatars and the number of comments, including zero. Check a task directly on its card without selecting or moving the card; completed tasks disappear from column cards and remain checked and struck through in the Drawer. Uncheck one in the Drawer to show it on its card again; the same write guard and recovery flow apply. Avatar titles and accessible labels give the full names, with `?` and the user ID for unknown references.

The pencil opens a Drawer for title and description plus members, comments and checklist tasks. Save validates and saves only the title/description, then closes the Drawer. Members and checklist changes save immediately. For comments, select your user first to unlock the text field, then Publish; there is no authentication or default author. Existing comments display their author and server timestamp. Close discards unsubmitted drafts only.

## Verification

Run `npm test` for collection conservation, controlled mutation/error/lock flows and placement boundaries/index arithmetic, `npm run build`, and `npm run lint`. Use Chrome MCP against the already running local frontend and API for focused keyboard/drag/drop, arrival and rollback checks; hot reload allows short checks during changes. A failure test can extend the console snippet above to include `PUT`, intercepting before the request reaches the server. Restore test cards to their original positions after successful checks.

## Card collections

`GET /users` supplies the catalog. `PATCH /cards/:cardId` returns 200 with a full card and replaces each supplied collection completely; omitted collections stay unchanged. The frontend reads the board immediately before building each collection PATCH and again after confirmation. It preserves unknown assigned users, existing comment timestamps and duplicate checklist descriptions. Tasks are targeted by index and the value captured at the click; an outdated occurrence is rejected.

All local writes, including creation, title edits and moves, wait for reconciliation. A rejected collection PATCH preserves the draft. If PATCH is confirmed but refresh fails, the submitted text is cleared and **Actualiser** refreshes the display without repeating the write. Network/5xx failures have an uncertain outcome: drafts stay available, writes stay blocked until an explicit successful refresh, and the UI asks you to inspect the list before retrying. The recovery control remains on the board if the Drawer is closed. User-catalog errors offer Retry while checklist and title editing remain available.

Concurrent writes from multiple browsers can still replace one another between GET and PATCH. Server versioning or atomic append operations would be needed to eliminate that limitation. No authentication, comment deletion, task deletion/reordering or new dependency is added.

See [.scratch/card-collections/validation.md](.scratch/card-collections/validation.md) for the actual automated and browser checks performed on an isolated temporary API database.
