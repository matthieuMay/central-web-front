# 07: Final pass — full acceptance checks

**What to build:** verify the whole Sprint 4 feature end to end in the browser and fix any gap found, so the sprint goal is met without breaking earlier features.

**Blocked by:** 03 (Reorder with ArrowUp/ArrowDown), 05 (Drag and drop into a neighbouring column), 06 (Confetti when a card enters the last column)

**Status:** ready-for-agent

- [ ] All 13 acceptance checks of the spec pass (with the placeholder instead of a line).
- [ ] Dragging a card into the last column triggers confetti after API confirmation (and the text message under reduced motion).
- [ ] Dark mode, selection, Move buttons, edit drawer and Add card still work.
- [ ] Every order change persists after reload.
- [ ] No new dependency and no test framework added.
- [ ] `npm run lint` and `npm run build` pass.
