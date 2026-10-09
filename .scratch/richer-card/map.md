# Wayfinder — Une Carte plus riche

Label: wayfinder:map

## Destination

A `/board` where a user opens a Card's Card Detail and, against the live API, manages its Assignees (associate/remove Users from `GET /users`), reads and posts Comments under an Acting Author, and creates, ticks, and untics Checklist Items — without ever dropping an element of a collection. The [`to-spec` output](./spec.md) is the plan; every decision a "Further Notes" section would leave open is resolved below.

## Notes

- Repo `central-web-front` (branch `cjallat/sprint4`). The `central-web-api` contract is frozen — implemented and tested — so **no backend tickets**.
- Skills every session should consult: "grilling" and "domain-modeling" (HITL).
- Glossary: root `CONTEXT.md` — Card, User, Assignee, Comment, Acting Author, Checklist Item, Card Detail (the last five added by this effort).
- Tracker: local Markdown (`docs/agents/issue-tracker.md`). Frontier = open, unblocked, unclaimed tickets in `./issues/`, first by number.
- Standing preference: produce decisions, not implementation. No feature code is written from this map.
- API facts (read from `central-web-api`): `GET /users` → `{ id, firstname, lastname }[]`; every Card carries `assignees`, `comments`, `checklistItems` (even when empty); `PATCH /cards/:cardId` replaces each supplied array in full, leaves omitted ones unchanged, and returns the single updated Card; new Comments omit `createdAt`; kept Comments must resend their original `createdAt`; Checklist Items have no id.

## Decisions so far

- **Presentation:** the three collections live in a Chakra v3 **Dialog** opened from the Card — not inline, not a route.
- **Opening:** the Card tile is restructured so its select surface keeps `role="button"`/`aria-pressed` for Move selection, with a sibling **"Ouvrir"** button that stops propagation; `openCardId` is owned by **Board**.
- **Data ownership:** `CardData` gains the three arrays; the single **`useBoard` query** is the source. A new `usePatchCard(boardId)` mutation writes the returned Card back into the board cache. There is no `GET /cards/:id`.
- **Users:** one cached **`useUsers()`** query (`GET /users`) feeds both the Assignee picker and the Acting Author selector.
- **Checklist identity:** **array index** (append to add, toggle by index), decided in a pure checklist module; only add + toggle are in scope, so order is stable.
- **Comments:** a single **Acting Author** selector (default first User, session-scoped); new comments are appended and sent **without** `createdAt`; existing `createdAt`s are resent verbatim.
- **Patch model:** each section sends **only its changed array, as the full next array**; the API leaves the other two untouched, so nothing is lost. Non-optimistic first; optimistic updates deferred.
- **Vocabulary** for User, Assignee, Comment, Acting Author, Checklist Item, and Card Detail added to `CONTEXT.md`.
- **ADR** [0002](../../docs/adr/0002-board-query-owns-card-collections.md): card collections are read from the board query and written with partial PATCH.

## Not yet specified

<!-- in-scope fog; graduates to tickets as the frontier advances -->

- Optimistic updates for the collection mutations, and how they reconcile with the move mutation already writing the board cache.
- Checklist delete and reorder — which would break array-index identity and force client-generated ids.
- Editing and deleting Comments or Assignees beyond add and remove.

## Out of scope

<!-- work ruled beyond the destination; never graduates -->

- Any backend change: the collections/PATCH contract is implemented and tested in `central-web-api`.
- Editing a Card's `title`/`description` from the Card Detail.
- Card creation/deletion, Column changes, and the Move feature (already delivered).
- Authentication and real identity; the Acting Author is a UI choice, not a session.
- Changing the existing keyboard Move interaction or its tests.
