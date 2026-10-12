# 04: Drag and drop within one column, with a placeholder

**What to build:** on desktop, the user can drag a card (anywhere except its ✎ button) to a new place in the same column. While dragging between cards, a placeholder the size of the dragged card shows exactly where it will be inserted. Uses native HTML5 drag and drop (see ADR 0001); no new dependency.

**Blocked by:** 02 (Move left/right sends `position` and updates the screen immediately)

**Status:** ready-for-agent

- [ ] Starting a drag selects the card and fades it out.
- [ ] Hovering between two cards shows the placeholder there; it follows the pointer (inserted before the first card whose vertical middle is below the pointer, otherwise at the end).
- [ ] Dropping moves the card to the placeholder position immediately; reload keeps the order.
- [ ] Dropping back on the original place sends no request.
- [ ] Escape during the drag, or dropping outside the column, removes the placeholder and sends no request.
- [ ] A plain click still selects/deselects; the ✎ button still opens the edit drawer and does not start a drag.
- [ ] Dragging is ignored while a move is pending.
- [ ] Placeholder and faded card are readable in light and dark mode.
- [ ] `npm run lint` and `npm run build` pass.
