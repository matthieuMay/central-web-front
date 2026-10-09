# Card movement with precise placement and arrival feedback

Labels: wayfinder:map

## Destination

Implement persistent card reordering and precise drag-and-drop, preserving existing horizontal movement and adding Motion transitions and arrival confetti.

## Notes

- The user initially requested planning, then authorized direct implementation and intermediate commits on 2026-10-09.
- Use wayfinder, grilling, domain-modeling, research, and animate. The user's request for animated movement overrides animate's general recommendation against keyboard-triggered animation.
- Confirmed: Up/Down move the selected card one place within its column without wrapping. Left/Right and existing toolbar buttons append to the adjacent column in board order. Drag-and-drop selects a precise insertion point, including empty columns.
- Confirmed: movement appears immediately; failed persistence animates the card back in the reverse direction, restores the appropriate order and displays an error. Do not delay departure for the API response.
- Confirmed: mouse and keyboard initially; touch drag-and-drop is outside the initial scope.
- Chakra UI is the existing UI system; React DnD is required for dragging; Motion is already installed. Reuse existing components and mutation infrastructure.
- Confirmed: confetti fires at visual arrival, without waiting for persistence success, in any column and on same-column reordering. A later failed request still animates the card back. Never fire again for rollback, hover, cancellation, no-ops, initial load, or ordinary refetches.
- Multi-card dragging is a conditional bonus only if it does not substantially broaden the implementation.
- Tracker and research assets live in local Markdown under this directory. Use linked local findings for this local planning handoff; do not publish remote research branches.
- Existing unrelated work: package-lock.json was already modified before this session. Preserve it.
- User-confirmed validation environment: the API runs locally on their computer and a configured frontend dev instance is already running. Use Chrome MCP for incremental feedback and final browser tests, reuse those services with hot reload, and keep checks focused and reasonable in duration. See [Browser validation and feedback](spec.md#browser-validation-and-feedback).

## Decisions so far

- [Persist precise placement and preserve optimistic writes](issues/01-persistent-placement.md): the existing API accepts an after-removal index; reuse the optimistic ledger and guard indexed moves against unsettled board writes.
- [Assess React DnD integration and the multi-card bonus](issues/02-multi-card-feasibility.md): use board-scoped mouse DnD and ephemeral insertion previews; defer the multi-card bonus under the small-change constraint.
- [Review the insertion preview, movement and arrival confetti](issues/03-arrival-feedback.md): delivered the user-refined tilted/translucent preview, release-origin landing, reverse rollback and visual-arrival confetti.

Interaction delivery: [Review the insertion preview, movement and arrival confetti](issues/03-arrival-feedback.md). The user requested direct implementation, then refined the drag appearance and release-to-destination landing; those changes are delivered. See [validation](validation.md) for browser evidence and remaining verification limits.

## Not yet specified

- None for the requested implementation. Remaining verification limits are recorded in [validation](validation.md).

## Out of scope

- Touch drag-and-drop in the initial version, per the user's choice.
- Multi-card drag for this first version, per the conditional small-change requirement and [Assess React DnD integration and the multi-card bonus](issues/02-multi-card-feasibility.md).
- Board redesign, new card schema, replacement of Chakra UI or Motion, and unrelated backend features.
