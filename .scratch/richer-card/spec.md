# Une Carte plus riche

Status: ready-for-agent

## Problem Statement

The `/board` renders Cards as read-only tiles: a title and an optional description. The API already stores three collections on every Card — Assignees, Comments, and Checklist Items — but the front neither shows nor changes them, so a Card is a dead label rather than a piece of work a team can staff, discuss, and track.

## Solution

Selecting the "Ouvrir" control on a Card opens its **Card Detail**, a Dialog with three sections. **Membres** lists the Card's Assignees and lets the user associate or remove any User from `GET /users`. **Commentaires** shows the Card's activity — each Comment's author and server timestamp — and lets the user post a new Comment under an **Acting Author** chosen in the interface. **Tâches à cocher** lets the user create a Checklist Item, tick it, and untick it. Every change persists through `PATCH /cards/:cardId`, which replaces only the collection that was sent, so the other two are never touched and no element is ever lost. Existing Comments keep their server timestamps; new ones let the API set them.

## User Stories

1. As a teammate, I want to open a Card's Detail, so that I can see and change who works on it and what it says without leaving the Board.
2. As a teammate, I want to see every User the API offers, so that I can pick real people for a Card.
3. As a teammate, I want to associate a User with a Card, so that the Card shows who is responsible.
4. As a teammate, I want to remove an Assignee, so that a Card stops showing someone who is done with it.
5. As a teammate, I want to see a Card's Comments in order with each author and time, so that I can follow the activity.
6. As a teammate, I want to choose the Acting Author, so that the Comment I write is credited to the right person.
7. As a teammate, I want to post a Comment, so that I can add to the activity.
8. As a teammate, I want a new Comment's date set by the API, so that I never fabricate a time.
9. As a teammate, I want existing Comments to keep their original dates, so that the activity's history stays true.
10. As a teammate, I want to create a Checklist Item, so that I can write down the next step.
11. As a teammate, I want to tick and untick a Checklist Item, so that the Card reflects what is done.
12. As a teammate, I want adding a Comment or a Checklist Item to never drop the others, so that my Card only ever grows by my intent.
13. As a teammate, I want my change to survive reload by coming from the API, so that the Board and the server agree.
14. As a teammate on a slow connection, I want a loading state while Users load and a clear message if they fail, so that I am not misled about who I can pick.
15. As a keyboard user, I want to open and operate the Card Detail without a pointer, so that I have the same power as anyone.
16. As a keyboard user, I want opening the Detail not to disturb selecting a Card for a Move, so that both interactions coexist.

## Implementation Decisions

### Scope and contract

- **Front-only effort.** The backend contract is frozen and already implemented and tested in `central-web-api`: `GET /users`, `GET /boards/:id`, `PATCH /cards/:cardId`. The front consumes it and changes nothing server-side.
- **Collections are always present.** Every Card in `GET /boards/:id` carries `assignees: string[]`, `comments: { user, comment, createdAt }[]`, and `checklistItems: { description, done }[]`, even when empty. `PATCH` replaces each supplied array **in full**, leaves omitted collections unchanged, and returns the **single updated Card**.
- **Comments and dates.** A new Comment is sent as `{ user, comment }` with no `createdAt`; the API stamps it. When the comments array is re-sent, every Comment that already existed must carry its original `createdAt` back, or the PATCH fails; the API also rejects reusing a timestamp more often than it originally appeared.
- **No element is lost.** Because each section re-sends its whole array (`[...existing, new]`) and omits the other two collections, adding a Comment or a Checklist Item cannot drop existing ones.

### Presentation and state

- **Card Detail is a Dialog**, one per Board, not one per Card. Board owns `openCardId: string | null` alongside `selectedId`, resolves the Card from `boardData` by id, and renders a single `<CardDetail>`.
- **Opening does not touch Move selection.** The Card tile is restructured into an outer `<article data-card-id>` (the dnd ref) containing an inner **select surface** that keeps `role="button"`, `tabIndex`, `aria-pressed`, the dnd listeners, and the click/Enter select-for-Move handler, plus a sibling **"Ouvrir"** `IconButton` whose handler calls `stopPropagation()` then `onOpen(card.id)`. This keeps `src/components/Board.test.tsx:98`'s `closest('[role="button"]')` assertion true and avoids a nested interactive control.
- **Board state lives in TanStack Query.** `CardData` gains the three arrays; `useBoard` (`GET /boards/:id`) remains their single source. A new `usePatchCard(boardId)` mutation sends the PATCH and, on success, writes the returned Card back into the board cache by id (find across columns, replace), mirroring how `useMoveCard` writes the board. There is no `GET /cards/:id`, so no per-card query is introduced.
- **Users are one cached query.** `useUsers()` (`GET /users`, key `['users']`) feeds both the Assignee picker and the Acting Author selector. `CardDetail` receives `users` and `isUsersLoading`.
- **Change detection is per collection.** Each section computes its next whole array and calls `usePatchCard` with only that field. The mutation is non-optimistic (the UI waits for the server's returned Card); optimistic updates are deferred (see the map's fog).
- **Users loading and error.** While Users load, Membres and Commentaires show a loading state and disable adding; if Users fail, they show a muted error and disable those two sections. Tâches à cocher works regardless of Users.

### Components, props, and data ownership

The board query is the **data owner** for every Card field. `CardDetail` copies nothing; it passes slices down and routes mutations up through `usePatchCard`.

- **`Card`** (modified) — presents a tile and exposes two intents. Props `{ card: CardData; columnId: string; isSelected: boolean; onSelect: (cardId: string) => void; onOpen: (cardId: string) => void }`. Emits select (existing) and open (new). Owns no data.
- **`CardDetail`** (Chakra `Dialog`) — orchestrates the three sections; owns transient UI state (the Acting Author and any draft inputs). Props `{ card: CardData; users: User[]; isUsersLoading: boolean; isUsersError: boolean; onClose: () => void }`. Reads card data from the board query and fires PATCH through `usePatchCard`.
- **`CardAssignees`** — shows, associates, and removes Assignees. Props `{ assignees: string[]; users: User[]; onChange: (next: string[]) => void }`. Emits the full next Assignee array (add appends, remove filters).
- **`CardComments`** — lists the activity and composes a Comment. Props `{ comments: CardComment[]; users: User[]; authorId: string; onAuthorChange: (userId: string) => void; onSubmit: (input: CommentInput) => void }`. Renders each Comment's author name and formatted `createdAt`; emits a new `{ user, comment }` with **no** `createdAt`.
- **`CardChecklist`** — lists, creates, and toggles items. Props `{ items: ChecklistItem[]; onAdd: (description: string) => void; onToggle: (index: number) => void }`. Emits add (append) and toggle (by index).
- **`UserSelect`** (shared) — the Acting Author control. Props `{ users: User[]; value: string; onChange: (userId: string) => void; label: string }`; displays `firstname lastname`, stores the `id`.

### Domain types

`src/types/board.ts` adds: `User = { id, firstname, lastname }`, `CardComment = { user, comment, createdAt }`, `CommentInput = { user, comment }`, `ChecklistItem = { description, done }`; `CardData` gains `assignees: string[]`, `comments: CardComment[]`, `checklistItems: ChecklistItem[]` (all required, matching the API). Existing fixtures that build `CardData` (`src/components/Board.test.tsx`, `data/board.json`) must be updated to compile.

### Pure logic

- **Checklist identity is the array index.** Only add and toggle are in scope, order is stable, and the whole array is always re-sent, so an item is addressed by its index. A pure module (e.g. `src/board/checklist.ts`) exposes `addChecklistItem(items, description)` (trimmed, appended) and `toggleChecklistItem(items, index)`. The assumption and its upgrade path to client-generated ids on any future delete/reorder are documented there.
- **Comment append** helper produces `[...existing, { user, comment }]` without mutating existing entries' `createdAt`.

### Accessibility

- The Dialog traps focus and closes on Escape (Chakra defaults); it is labelled by the Card title.
- Each section has an accessible heading; Checklist toggles are real checkboxes with the item description as their label; the "Ouvrir" button has an accessible name; Assignee removal has a per-user accessible name.
- Opening the Detail must not steal Move selection or break the arrow-key Move flow.

### Glossary

The terms Card, User, Assignee, Comment, Acting Author, Checklist Item, and Card Detail are defined in `CONTEXT.md`.

## Testing Decisions

- Good tests assert external behaviour through the highest seam available, never implementation details: given a Board and an interaction, assert the resulting UI and **the request sent**, not internal state.
- **Highest seam:** the Board view with a query client and a mocked `fetch` (extending `src/components/Board.test.tsx`). Open the Detail, then: associate/remove an Assignee and assert the PATCH body carries the full `assignees` array; post a Comment and assert the PATCH body's `comments` include the existing entries with their original `createdAt` and the new one **without** `createdAt`; add and toggle a Checklist Item and assert the PATCH body carries the full `checklistItems` array with the right `done`. Also assert the board re-renders from the returned Card.
- **Lower seam:** the pure checklist helpers (`addChecklistItem`, `toggleChecklistItem`) for append, trim, toggle, and out-of-range index, plus the comment-append helper preserving old timestamps.
- **Prior art:** `src/components/Board.test.tsx` and `src/color-mode.test.tsx` (Vitest + Testing Library, behaviour-first, `vi.stubGlobal` for the `fetch` seam).
- **Sign-off:** the `to-spec` process requires the human's sign-off before implementation. The immediate deliverable is the first-commit ticket (`./issues/01-first-commit-scaffold.md`); the behaviour lands in later tickets.

## Out of Scope

- Any backend change: the collections/PATCH contract is implemented and tested in `central-web-api`.
- Editing a Card's `title`/`description` from the Card Detail.
- Card creation/deletion, Column changes, and the Move feature (already delivered).
- Checklist delete and reorder.
- Editing and deleting Comments or Assignees beyond add and remove.
- Authentication and real identity; the Acting Author is a UI choice, not a session.
- Changing the existing keyboard Move interaction or its tests.
- Optimistic updates (deferred; see the map's fog).

## Further Notes

- The map for this effort lives at `./map.md`; the still-foggy items above live in its "Not yet specified" section and are not tickets yet.
- The first commit is deliberate: component stubs carrying the contracts above as file-level comments, wired empty, with `npm run lint` and `npm run build` green — decisions, not generated code. See `./issues/01-first-commit-scaffold.md`.
- Trade-off acknowledged in ADR [0002](../../docs/adr/0002-board-query-owns-card-collections.md): the Card Detail depends on the board payload being current and on the PATCH omit-to-leave-unchanged rule to keep the untouched collections safe.
