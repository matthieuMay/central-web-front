# Mini-Trello — Front

Requires Node.js `>=22.22.0`.

```bash
npm ci
npm run dev
```

The `/board` route renders a read-only board from `data/board.json`. The JSON models the future API response; its array order determines the order of columns and cards. No network request or business state is required in Sprint 1.
