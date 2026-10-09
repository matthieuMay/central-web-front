# Assess React DnD integration and the multi-card bonus

Labels: wayfinder:research
Type: research
Status: resolved
Assignee: dnd-research
Blocked by: none

## Question

What is the smallest React DnD integration for precise single-card placement with Chakra and existing Motion, and can multi-card dragging fit without a broad rewrite of selection or unsafe multi-request persistence?

Research official sources and local selection/movement code. Assess mouse backend, drag preview, positional targets, empty/edge columns, cancellation, Motion ownership, focus, and the optional multi-card selection/atomicity cost. Recommend inclusion only if it fits the user's explicit small-change constraint. Record compatibility facts to verify at implementation time; do not install dependencies or implement.

## Assets

- Findings: `../research/drag-and-drop.md`.

## Answer

Include single-card mouse DnD with one board `DndProvider`/`HTML5Backend`, card `useDrag`, and one cards-only `useDrop` region per column. Compute insertion against destination order after removing the source; hover is ephemeral marker state, accepted drop commits once through the shared optimistic move mutation. Preserve Chakra, existing Motion `LayoutGroup`/card identities and keyboard alternatives. Native preview is sufficient initially; add a custom layer only if browser continuity checks justify its cost. Empty/edge columns, cancellation, nested-target safeguards, focus and arrival coordination are covered in [the findings](../research/drag-and-drop.md).

Defer multi-card dragging under the user's small-change constraint: current selection is one ID and documented persistence is one-card PUT, with no documented atomic group endpoint. Group selection, ordering/focus and partial-failure semantics would be additional scope. Upstream sources were checked; React 19/build/browser compatibility must still be verified during implementation. No application code or dependency changes were made.
