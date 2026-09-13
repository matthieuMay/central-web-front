# Mini-Trello Front — Agent instructions

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

Env: copy `.env.example` → `.env` (`VITE_API_URL`) for Sprint 3+.

## Domain

Read `CONTEXT.md` before changing Board / Column / Card / state flow.

## Conventions

- Functional components, TypeScript strict.
- Board (state) → Column → Card (props).
- Immutable updates; lift state up to Board.
- No new deps unless asked (except `@dnd-kit/*` on Sprint 4).
- No commit/push to the shared remote (students submit zip/USB).

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues (`gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default five: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `CONTEXT.md` + `docs/adr/`. See `docs/agents/domain.md`.
