# 06: Confetti when a card enters the last column

**What to build:** when the API confirms that a card has entered the last column from another column, confetti bursts from the card's new position. Reduced-motion users see a short text message instead. The existing Confetti component is fixed so it can be used: fixed overlay that does not block clicks or shift layout, random values generated when triggered (not during render), nothing rendered under reduced motion.

**Blocked by:** 02 (Move left/right sends `position` and updates the screen immediately)

**Status:** ready-for-agent

- [ ] Moving a card into the last column with Move right or ArrowRight shows confetti only after the API answers (visible delay with DevTools network throttling).
- [ ] Confetti starts from the moved card and does not block clicks or move the layout.
- [ ] Reordering inside the last column shows no confetti.
- [ ] A failed move into the last column (blocked PUT) shows no confetti.
- [ ] With `prefers-reduced-motion: reduce` emulated, no confetti; "🎉 Moved to <last column title>" is shown instead.
- [ ] Confetti works in light and dark mode.
- [ ] `npm run lint` and `npm run build` pass.
