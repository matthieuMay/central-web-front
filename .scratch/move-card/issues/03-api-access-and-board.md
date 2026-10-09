# 03 — How the front reaches the API and chooses the Board

Type: grilling
Blocked by: None

## Question

Decide how `central-web-front` calls `central-web-api`:

- **Mechanism:** a Vite dev proxy, or a configurable base (`VITE_API_URL`, default `http://localhost:3000`)? The API sets `CORS_ORIGIN=*`, so a direct cross-origin call works; a proxy avoids CORS entirely and keeps the URL same-origin.
- **Board identity:** the `/board` route currently renders a static import. Where does the Board id come from — a route param, a constant for the seed Board (`mini-trello`), or a list picker? Only `GET /boards/:id` exists; there is no boards-list endpoint.
- **Static data:** does `data/board.json` leave the runtime path (kept only as a test fixture), or remain a fallback?

Record the decision as the front's API-access convention (base URL source and board id source).
