# Card movement

State: implemented; focused browser results and limitations are recorded in [validation](validation.md).

## Behavior

- Preserve selection, horizontal toolbar actions, Escape deselection, card editing, and card creation.
- Left/Right moves a selected card to the bottom of the adjacent column in board order. At the first/last column the impossible direction does nothing and its button stays disabled.
- Up/Down moves the selected card one place within its column. The first card cannot move up and the last cannot move down; no wrapping or unintended API request.
- Drag an individual card to a visible insertion point before, between, or after cards, within its own column or another column. An empty column accepts the card at index zero. All columns, including edge columns, accept drops.
- A drop outside a valid target, drag cancellation, or a drop at the unchanged position performs no write or celebration.
- Inputs, edit controls, and the edit drawer retain their keyboard behavior. Editing controls do not initiate dragging. Keep stable card IDs and focus on the moved card.
- Mouse and keyboard are the initial input methods. Multi-card dragging is deferred under the user's small-change condition; see [Assess React DnD integration and the multi-card bonus](issues/02-multi-card-feasibility.md).

## Saving and feedback

- Display the move immediately and persist the final placement once; hovering does not write to the API.
- Reject a new committed move while board writes or reconciliation are pending; keep existing create/edit behavior and replay surviving writes. Recheck current board data at drop rather than relying on a drag-start index. See [persistence research](research/persistence.md).
- On failed persistence, animate the card back in the reverse direction without losing other successful/pending creates or edits, preserve selection/focus, and expose a retryable error. The user explicitly confirmed immediate movement and this reverse animation on 2026-10-09.
- Reuse Motion layout/shared-layout infrastructure so the moved card travels and displaced cards smoothly make space. The preview must clearly indicate the actual drop location.
- Use one React DnD provider, card grip sources, and a cards-only drop region per column. Use current card midpoints to select the insertion index after removal. Keep preview state outside the query cache and exclude the create form from drop targeting. A custom preview is translucent and slightly tilted; its offset accounts for the grip position within the card. Animate landing from the release position, and animate a failed write back from the card's current visual position.
- Reuse Confetti and trigger a localized burst at the card's visual arrival, without waiting for the API response. Cover every movement method and same-column reordering; the destination need not be the last column. This timing is explicitly confirmed by the user, including the possibility that the API subsequently fails.
- Drive completion from movement identity and animation lifecycle, not a guessed timeout. Handle reduced motion and unchanged-layout completion explicitly. Avoid repeat bursts from refetches or duplicate completion callbacks.
- Use the layout-specific `onLayoutAnimationComplete` callback for the existing layout animations; ordinary `onAnimationComplete` excludes layout transitions. Source: [Motion component documentation](https://motion.dev/docs/react-motion-component#onlayoutanimationcomplete).
- With reduced motion, preserve insertion/save feedback and completion semantics while removing spatial travel and flying particles.

The burst acknowledges visual arrival. A subsequent failed save animates the card back without another burst. If rollback happens before forward arrival, cancel the outstanding arrival event and do not celebrate the rollback.

## Expected implementation reach

| File | Purpose |
| --- | --- |
| `src/api/board.ts` | Add the API's optional destination position to move requests. |
| `src/api/mutations.ts` | Reuse the optimistic write ledger for movement, rollback, and final reconciliation. |
| `src/pages/BoardPage.tsx` | Coordinate keyboard/buttons/drop, selection, focus, saving and completion identity. |
| `src/components/Board.tsx` | Board-scoped React DnD context and drag/drop coordination alongside LayoutGroup. |
| `src/components/Column.tsx` | Usable empty-column and end-of-column targets; preserve create form. |
| `src/components/Card.tsx` | Drag source, position targeting, visual preview, arrival callback and confetti anchor. |
| `src/components/Confetti.tsx` | Reuse the existing component; make bursts repeatable, localized, noninteractive and reduced-motion aware. |
| `src/components/CardDragPreview.tsx` | Custom translucent/tilted pointer preview and visual landing coordinates. |
| `src/api/placement.ts` | Shared immutable after-removal placement used by optimistic moves and tests. |
| `package.json`, `package-lock.json` | React DnD and the chosen mouse backend; retain pre-existing lockfile changes. |
| `README.md` | Explain the new controls, persistence and failure behavior. |
| Small test/self-check | Verify removal/insertion arithmetic, boundaries, rollback and completion behavior. |

Keep `src/types/board.ts`, static `data/board.json`, and card/edit IDs unchanged unless research identifies a concrete need.

## Implementation sequence

1. Extend the move request and the shared optimistic mutation; verify persisted same-column and cross-column positions, boundaries and rollback.
2. Add Up/Down and route all movement methods through the same placement operation, preserving horizontal append behavior and focus.
3. Add React DnD sources and positional targets, empty-column targets and cancellation-safe previews; persist only on a valid final drop.
4. Refine Motion placement transitions, reverse rollback transitions, and wire confetti to forward visual arrival, including reduced-motion behavior.
5. Run build/lint and a focused final Chrome MCP pass against the already running local frontend/API; report observed results and remaining limits. Multi-card dragging is deferred.

The user authorized direct implementation after planning. Changes were delivered in intermediate commits and checked against the running local app through Chrome MCP.

## Browser validation and feedback

- Use Chrome MCP for prototype feedback, incremental interaction checks and final browser acceptance. The user confirmed that the API runs locally on their computer, the setup is normally configured and a frontend dev instance is already running.
- Reuse the running services and existing browser session/tab where available. Verify their actual addresses once; the README defaults are frontend `http://localhost:5173/board` and API `http://localhost:3000`. Use frontend hot reload to check changes almost in real time. Start or restart a service only if a concrete failure requires it.
- Keep the time spent proportionate: check the affected interaction after each meaningful change, then perform one focused final pass covering the scenarios below. Repeat checks only for a fix, failure or unresolved concern; avoid broad exploratory testing unrelated to card movement.
- Use Chrome MCP to exercise actual mouse dragging, arrow keys, focus, visible placement/arrival/rollback feedback and reload persistence. Inspect relevant requests and console errors when needed. Build/lint and small placement checks complement this browser pass.
- Simulate the failed/delayed movement request before it reaches the server when testing rollback. Preserve existing local board data and restore any test card's original placement after successful movement checks; do not reset the database.
- Give a concise final report of what was observed in Chrome MCP, any failures and any checks that remain unverified. Include a screenshot or recording only when it helps explain the interaction or an issue.

## Acceptance scenarios

- Reorder the middle/first/last card using Up/Down and drag; reload and verify identical order.
- Move left/right with keyboard and buttons; confirm append behavior, selection/focus, empty destination and edge no-ops.
- Drop before the first card, between cards, after the last card and into an empty edge column; verify after-removal index arithmetic in both drag directions.
- Drop outside the board or at the original position; ensure no request or burst.
- Simulate a failed PUT; confirm reverse animated rollback, visible error and selection/focus. If forward arrival completed before failure, its burst is allowed; rollback never triggers another burst. Repeat with an overlapping create/edit to verify ledger replay.
- Verify an insertion preview never writes to the server and cancelling it leaves authoritative board data intact.
- If PUT succeeds but the subsequent GET fails, report reconciliation failure separately and offer retry; do not falsely treat the successful write as rejected. A transport failure may occur after server commit, so rollback is provisional until authoritative refetch.
- Check narrow responsive layouts and page scrolling; column adjacency follows board order and hit testing follows the displayed target.
- Verify each completed forward movement yields one burst at visual arrival, including when saving is still pending. Repeated moves, delayed responses, failures, refetches and reduced motion do not duplicate or strand celebrations.
- Verify inputs, pencil/edit drawer, Escape, and reduced-motion interaction behavior; run `npm run build` and `npm run lint`.
