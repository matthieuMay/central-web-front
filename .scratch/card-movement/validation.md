# Card movement validation — 2026-10-09

Used Chrome MCP against the existing dev frontend at `http://localhost:5173/board` and local API at `http://localhost:3000`. Reused hot reload; did not start duplicate frontend/API services or reset the database. The user also exercised the live app while implementation was in progress; their later board changes were retained.

## Completed checks

| Check | Result |
| --- | --- |
| `npm run build` | Passed TypeScript and Vite build. Vite still reports a bundle over 500 kB; this warning was also present before the drag UI. |
| `npm test` | Three tests passed: same-column index arithmetic in both directions; cross-column/append/empty placement with immutable data preservation; invalid and unchanged no-ops. |
| `npm run lint` | Passed without warnings. |
| Actual keyboard and mouse placement | Up/Down reorder and native mouse drag within/between columns sent the expected optional after-removal position. Horizontal movement omitted position and appended. Focus remained on the moved card. |
| Delayed PUT | Held the request before it reached the server. The DOM showed the destination and one confetti burst while GET still returned the old source column. Releasing the request persisted the move. |
| Failed PUT | Rejected a held request before any write. The card returned to the source, retained focus and showed a visible error. The forward burst was not repeated during rollback. |
| Release-origin landing | Recorded the ghost origin at drop and the first/final Motion transforms. The first transform translated from the recorded release origin with −3° tilt; final transform was identity at the destination. |
| Reverse travel | Recorded rollback frames after rejecting a request: nonzero translation back toward the source, then identity. No extra confetti burst. |
| Empty destination | Temporarily moved the sole Doing card out, then dragged it back into the empty region. PUT used `{ "column": "doing", "position": 0 }`; GET confirmed placement and focus was retained. |
| Boundary, unchanged and outside drops | Impossible left/bottom moves, a same-position drag and an outside drop produced no additional move request or burst. Drag preview and insertion marker were removed. |
| Reduced motion | Forced the application's `prefers-reduced-motion` media-query preference through Chrome's navigation script. Reorder remained usable, no transform or particles were emitted, focus was preserved and controls became available again. |
| Reload persistence and cleanup | API GET and fresh page loads showed persisted positions. Temporary request interceptions and the reduced-motion test tab were removed. Test moves were restored as checks completed; no test card was saved and the user’s subsequent changes were retained. |

## Limits

- No touch or multi-card dragging, as scoped.
- The overlapping create/move rollback browser attempt was interrupted by a page reload, so it is not counted as verified. The existing replay ledger is reused; a separate exhaustive concurrency suite was not added.
- No full visual regression, cross-browser, narrow-layout/scroll matrix, dedicated GET-failure or multi-client conflict test. Those were not claimed as passing.
- A lost network response can occur after the API committed; visual rollback is provisional until the authoritative refetch. The API has no client operation/version contract for resolving simultaneous external edits.

## Commits

- `3204dc2` — planning and Chrome validation requirements.
- `f6df14b` — optimistic persistent placement, keyboard reorder, dependencies and placement tests.
- `5a62e2c` — positional DnD, drag preview, Motion arrival and confetti.
- `d2cde92` — release-position landing and explicit reverse rollback.

Final documentation/interaction guard changes follow in the closing commit. The pre-existing lockfile changes and starting prompt remain outside these commits.
