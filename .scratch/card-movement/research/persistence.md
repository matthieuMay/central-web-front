# Persistent placement and optimistic movement

Ticket: [01](../issues/01-persistent-placement.md). Primary-source inspection on 2026-10-09; no application/API changes or tests executed.

## Verified contract

The sibling API already supports `PUT /cards/:cardId` with `{ column, position? }`, returns the updated board, and persists placement. Omitted position appends; explicit position is a zero-based index **after removal**, including same-column reorder. No backend change is required for single-card placement. [README, lines 116–119][readme]; [route, lines 101–107][route]; [store, lines 158–169][plan].

- Range: `0..destinationLengthAfterRemoval`, inclusive. Same-column N-card lists therefore accept `0..N−1`; empty target accepts only `0` (or omitted position).
- Position must be a safe integer; null, strings, fractions and unsafe integers fail with 400. Negative/out-of-range integers also fail with 400. Unknown body fields fail; missing card/column produces 404; crossing boards fails with 400. [Body validation][body]; [route][route]; [transaction validation][transaction].
- Same-column insertion at the current index is valid but still executes the transaction; the frontend should suppress effective no-op drops and bound-arrow requests. SQLite and Postgres share the ordering calculation; Postgres locks the board before reading order. [Store, lines 158–214][plan].
- GET orders by persisted positions and retains empty columns via left joins; card position is array order, not a returned position field. [Store GET, lines 75–100][get].

Existing API tests assert invalid requests preserve GET, empty/populated-column append, same-column first/last reorder, concurrent appends and restart persistence. They do not explicitly cover every interior cross-column insertion, original-index no-op or safe-integer overflow. [Tests, lines 235–278][tests]; [restart, lines 284–301][restart]. No batch endpoint appears in the inspected routes; multi-card atomic movement is not available. [Routes][route]. Tests were read only.

## Smallest frontend change

Current `moveCard` sends only column; `useMoveCard` shares `board-writes` serialization but only invalidates on success. Create/edit already use `begin`/`rollback`/`settle`: one batch base, replayable transformations, removal of only a failed operation, and one refetch when all writes finish. Reuse that ledger for movement rather than restoring a whole old board or replacing cache with the PUT response, either of which can discard later create/edit changes. [Request][request]; [ledger and hooks, lines 13–95][ledger].

Extend movement input with optional position and use one pure remove/insert transformation for buttons, arrows and committed drops. Find the card in the board supplied to the transformation, preserve its entire object, and leave missing-card/column replay cases safe. Translate a same-column visual gap into a post-removal index once: `[A,B,C,D]`, B after C → reduced `[A,C,D]`, index `2` → `[A,C,B,D]`. This recommendation follows the API calculation and current replay model. [Store calculation][plan]; [ledger][ledger].

## Recommended pending policy

Reject a new move while any `board-writes` mutation or board reconciliation fetch is pending, editing is open, or another movement/arrival is active. Keep create/edit usable during an accepted move and preserve their transformations on move failure. Recheck eligibility and current placement at drop, because writes may start during a drag.

Scope alone is insufficient: installed TanStack runs queued `onMutate` **before** waiting for its scoped HTTP execution. A move computed from an optimistic create that later fails can therefore send a stale/out-of-range index. [Mutation, lines 324–346][query-mutation]; [scope queue, lines 195–220][query-scope]. Use reactive `useIsMutating` with a predicate on `mutation.options.scope?.id === 'board-writes'`, and the same imperative `queryClient.isMutating` check at commit plus the existing synchronous ref. No extra queue or global store is needed. [Pending count][query-count]; [reactive hook][query-hook]; [predicate][query-filter].

Keep selection by ID; restore focus after both optimistic placement and rollback. Existing focus state stores only card ID and destination column, whose membership is already true before a same-column reorder; use operation/index identity for visual arrival. Existing movement, control-key exclusion and boundary handling provide the base. [BoardPage, lines 19–64][page].

## Error and confetti semantics

Rejected PUT: remove only its ledger entry, animate back, retain unrelated create/edit changes, and show an error. Successful PUT followed by failed GET is different: TanStack normally swallows refetch rejection, so awaited invalidation does not prove fresh data arrived. Do not roll back a committed move as if PUT failed; show a retry/read state and block new indexed moves until an authoritative read succeeds. Existing page `isError` currently hides the board even for failed background reads; acceptance checks must cover recovery. [Ledger][ledger]; [refetch, lines 469–529][query-refetch]; [page error branch][page-error]. A lost response may also follow server commit: rollback is provisional until GET. The index-only API provides no version/operation conflict contract. [PUT shape][route].

**User decision:** movement is immediate; confetti fires once at the moved card's **visual forward arrival**, even while PUT is pending and even if it later fails. Failure reverses the card without another burst. HTTP success does not gate the celebration. Associate arrival with an accepted operation ID, suppress duplicate callbacks, no-op, rollback, sibling-card and refetch-triggered bursts. Existing Motion layout supports card movement; existing Confetti reacts to a changing positive trigger and always generates 40 particles. Respect reduced motion and provide accessible placement feedback. [Card motion][card]; [Confetti effect][confetti].

## Acceptance checks

Check same-column up/down index calculation and boundaries; precise first/interior/append and empty-edge-column insertion; unchanged-drop suppression; GET/reload order; deferred create/edit survival during move rollback; pending and rapid-event rejection; focus restoration; failed refetch after successful PUT with retry; exactly one forward-arrival burst regardless of API timing, with none on rollback/refetch/no-op.

Skipped implementation, dependency installation, database writes and live-service checks. Risk: deployed API may differ from sibling source; external clients can still make index intentions stale, and visual-arrival celebration can precede a later failed save by the user's explicit choice.

[readme]: </Users/gaspard/Desktop/3A/DO-IT/Temps 1/Web1/projet-git/central-web-api/README.md:116>
[route]: </Users/gaspard/Desktop/3A/DO-IT/Temps 1/Web1/projet-git/central-web-api/src/app.ts:101>
[body]: </Users/gaspard/Desktop/3A/DO-IT/Temps 1/Web1/projet-git/central-web-api/src/app.ts:7>
[plan]: </Users/gaspard/Desktop/3A/DO-IT/Temps 1/Web1/projet-git/central-web-api/src/db/store.ts:158>
[transaction]: </Users/gaspard/Desktop/3A/DO-IT/Temps 1/Web1/projet-git/central-web-api/src/db/store.ts:175>
[get]: </Users/gaspard/Desktop/3A/DO-IT/Temps 1/Web1/projet-git/central-web-api/src/db/store.ts:75>
[tests]: </Users/gaspard/Desktop/3A/DO-IT/Temps 1/Web1/projet-git/central-web-api/tests/api.test.ts:235>
[restart]: </Users/gaspard/Desktop/3A/DO-IT/Temps 1/Web1/projet-git/central-web-api/tests/api.test.ts:284>
[request]: </Users/gaspard/Desktop/3A/DO-IT/Temps 1/Web1/projet-git/central-web-front/src/api/board.ts:35>
[ledger]: </Users/gaspard/Desktop/3A/DO-IT/Temps 1/Web1/projet-git/central-web-front/src/api/mutations.ts:13>
[page]: </Users/gaspard/Desktop/3A/DO-IT/Temps 1/Web1/projet-git/central-web-front/src/pages/BoardPage.tsx:19>
[page-error]: </Users/gaspard/Desktop/3A/DO-IT/Temps 1/Web1/projet-git/central-web-front/src/pages/BoardPage.tsx:66>
[card]: </Users/gaspard/Desktop/3A/DO-IT/Temps 1/Web1/projet-git/central-web-front/src/components/Card.tsx:18>
[confetti]: </Users/gaspard/Desktop/3A/DO-IT/Temps 1/Web1/projet-git/central-web-front/src/components/Confetti.tsx:12>
[query-mutation]: </Users/gaspard/Desktop/3A/DO-IT/Temps 1/Web1/projet-git/central-web-front/node_modules/@tanstack/query-core/src/mutation.ts:324>
[query-scope]: </Users/gaspard/Desktop/3A/DO-IT/Temps 1/Web1/projet-git/central-web-front/node_modules/@tanstack/query-core/src/mutationCache.ts:195>
[query-count]: </Users/gaspard/Desktop/3A/DO-IT/Temps 1/Web1/projet-git/central-web-front/node_modules/@tanstack/query-core/src/queryClient.ts:168>
[query-hook]: </Users/gaspard/Desktop/3A/DO-IT/Temps 1/Web1/projet-git/central-web-front/node_modules/@tanstack/react-query/src/useMutationState.ts:35>
[query-filter]: </Users/gaspard/Desktop/3A/DO-IT/Temps 1/Web1/projet-git/central-web-front/node_modules/@tanstack/query-core/src/utils.ts:237>
[query-refetch]: </Users/gaspard/Desktop/3A/DO-IT/Temps 1/Web1/projet-git/central-web-front/node_modules/@tanstack/query-core/src/queryClient.ts:469>
