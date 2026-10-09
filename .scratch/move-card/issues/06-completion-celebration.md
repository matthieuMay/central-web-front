# 06 — Where and when the Completion Celebration renders

Type: grilling
Blocked by: None

## Question

Decide how the existing `Confetti` component fires:

- **Mount point:** a Board-level overlay, or anchored per-Card? The component is currently an unused default export taking a `particleCount` prop.
- **Detection:** how "a Move entered the Final Column" is detected from the optimistic cache so it fires **once on entry** and **never** on a reorder that stays in the Final Column.
- **Identity of the Final Column:** positional (`board.columns[columns.length - 1]`) vs its title/id — confirm positional is right, given the Board's array order is authoritative.
- **Trigger mechanics:** is `particleCount` bumped as an event, and what resets it so a second entry can fire again?
