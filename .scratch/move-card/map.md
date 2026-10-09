# Wayfinder — Move a Card

Label: wayfinder:map

## Destination

A working `/board` where a user can Move a Card by keyboard and by drag-and-drop against the live API, with the Completion Celebration when a Card reaches the Final Column. The [`to-spec` output](./spec.md) is the plan; this map resolves the decisions its "Further Notes" still leave open, so implementation can be handed off with nothing left to decide.

## Notes

- Repo `central-web-front` (branch `cjallat/sprint4`). The `central-web-api` contract is frozen — implemented and tested — so **no backend tickets**.
- Skills every session should consult: "grilling" and "domain-modeling" (HITL); "research" for the AFK ticket.
- Glossary: root `CONTEXT.md` — Board, Column, Card, Move, Position, Destination Column, Final Column, Completion Celebration.
- Tracker: local Markdown (`docs/agents/issue-tracker.md`). Frontier = open, unblocked, unclaimed tickets in `./issues/`, first by number.
- Standing preference: produce decisions, not implementation. No feature code is written from this map.

## Decisions so far

- [Move a Card (spec)](./spec.md): front-only effort; the `PUT /cards/:cardId` contract is frozen, implemented, and tested; Board state moves into TanStack Query.
- Scope (front-only) and state model (React Query owns the Board, optimistic `PUT`): recorded in the spec's Implementation Decisions.
- Interaction substrate `@dnd-kit/core`, subject to the feasibility ticket below.
- Completion Celebration fires on entering the Final Column, never on a reorder inside it.
- Keyboard `←`/`→` preserve Position, clamped to the Destination Column's length.
- Vocabulary for Board, Column, Card, Move, Position, Destination Column, Final Column, and Completion Celebration added to `CONTEXT.md`.

## Not yet specified

<!-- in-scope fog; graduates to tickets as the frontier advances -->

- Behaviour of rapid or concurrent Moves: how optimistic updates reconcile when responses arrive out of order.
- Touch-sensor tuning and responsive drop affordances on small screens.
- Prefactor: removing the static `data/board.json` runtime import (it becomes at most a test fixture).
- The exact handling of a drop into an empty Column and how its Position is computed.

## Out of scope

<!-- work ruled beyond the destination; never graduates -->

- Any backend change: the Move contract is implemented and tested in `central-web-api`.
- Column reorder/create/rename/delete; Card create/edit/delete; assignees/comments/checklist UI.
- Cross-Board Moves (the API rejects them), authentication/users, and the Home/Not-Found pages.
- Persisting the selected Card across reloads.
