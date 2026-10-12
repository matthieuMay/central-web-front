# ADR 0001 — Use native HTML5 drag and drop

Status: accepted (2026-10-12)

## Context

Sprint 4 adds drag and drop to the board: reorder cards inside one column, move a card into a neighbouring column at a chosen place, and drop into an empty column. The code must stay simple for a beginner, and new dependencies need a clear justification.

## Options considered

- **Native HTML5 drag and drop** (`draggable`, `dragstart`, `dragover`, `drop`). No dependency. Works with mouse on desktop browsers. We write the drop-index calculation ourselves (compare the pointer's Y position with each card's middle). Weak or missing on touch screens, and the drag preview is hard to style.
- **`@dnd-kit/core` + `@dnd-kit/sortable`.** Good touch and keyboard support, smooth animations. Adds 2–3 packages and several concepts (sensors, collision detection, sortable contexts) that are heavy for a beginner.
- **`Reorder` from `motion`** (already installed). Only reorders a single list, so it cannot move cards between columns.

## Decision

Use native HTML5 drag and drop.

## Consequences

- No new dependency; the logic stays in a few short, readable handlers.
- Dragging does not work on touch screens. Touch users move cards with the Move left/right/up/down buttons, which also serve as the single-pointer alternative to dragging (WCAG 2.5.7).
- We own the drop-index calculation and the drop indicator styling.
- If touch dragging becomes a requirement later, revisit `@dnd-kit`.
