# 01 — dnd-kit feasibility under React 19

Type: research
Blocked by: None

## Question

Can `@dnd-kit/core` (stable 6.3.1, currently the two-years-old release) be used on **React 19** to deliver *both* required input paths at once?

- **(a) Pointer and touch:** drop a Card into any Column — including an empty one — at the aimed Position, and reorder within a Column.
- **(b) Keyboard:** a *selected* Card is sent to a neighbouring Column with `←`/`→` and changes Position with `↑`/`↓`, preserving Position on a cross-Column move and clamping at the edges.

dnd-kit's keyboard sensor is a **grab-then-arrows drag model** (`Space`/`Enter` to lift and drop), which may not map cleanly onto the objective's "select a Card, then arrows" model. Determine:

1. React 19 peer/run compatibility for `@dnd-kit/core` 6.3.1 (and whether the newer `@dnd-kit/dom` line is the safer base on React 19).
2. Whether the sortable preset supports **cross-container** movement with custom collision detection and a stable "position" readout.
3. Whether the required select-then-arrow keyboard flow can ride the keyboard sensor or must be hand-rolled, with dnd-kit driving pointer/touch only.

Recommend one approach (dnd-kit for both, dnd-kit + hand-rolled keyboard, or another library). This resolves the Q3 "if not too complicated" caveat and gates the keyboard-model ticket.
