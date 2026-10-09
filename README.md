# Mini-Trello — Front

Requires Node.js `>=22.22.0`.

```bash
npm ci
npm run dev
```

The `/board` route initializes from `data/board.json`. Focus a card and use the arrow keys to move it one position up or down, or one column left or right. Cards can also be dragged to any position, including empty columns. Each move is sent to the API at `http://localhost:3000` by default as `PUT /cards/:cardId` with a JSON body of `{"column":"doing","position":1}`; `position` is the zero-based index in the destination column. Start the API from `../central-web-api` and configure its database as described in that project's README. Set `VITE_API_URL` in a frontend `.env` file to override the API origin. The API allows the default frontend origin `http://localhost:5173`; if you use another origin, configure `CORS_ORIGIN` in the API. The board updates from the returned `BoardData`, and moving a card into the last column triggers a confetti animation.
