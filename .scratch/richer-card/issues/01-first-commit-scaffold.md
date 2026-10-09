# 01 — First commit: component stubs carrying the decisions, wired empty

Type: task
Status: ready-for-agent
Blocked by: None

## Task

Scaffold the components named in the spec — the `Card` change, `CardDetail`, `CardAssignees`, `CardComments`, `CardChecklist`, and `UserSelect` — with each one's responsibility, props, events, and data owner written as a comment block at the top of its file. No feature logic: render a stable, empty shell and wire the tree so the Board still renders. Then `npm run lint`, `npm run build`, and commit.

This is the first commit from the brief: our decisions, not generated code. The behaviour lands in later tickets.

## Notes

- Contracts are fixed in [`../spec.md`](../spec.md) → Implementation Decisions.
- Opening the Detail requires splitting the Card tile: the select surface keeps `role="button"`/`aria-pressed` (pinned by `src/components/Board.test.tsx:98`) and the new "Ouvrir" button sits beside it.
- `CardData` gains `assignees`, `comments`, and `checklistItems`; existing fixtures (`src/components/Board.test.tsx`, `data/board.json`) must be updated to compile.
- Do not implement behaviour here — this ticket is the "everything before" commit only.
