# Mini-Trello — Front

Requires Node.js `>=22.22.0`.

```bash
npm ci
npm run dev
```

The `/board` route loads the `mini-trello` board from `GET /boards/mini-trello` and users from `GET /users`. Start the API from `../central-web-api` and configure its database as described in that project's README. Set `VITE_API_URL` in a frontend `.env` file to override the API origin (default `http://localhost:3000`). The API allows the default frontend origin `http://localhost:5173`; if you use another origin, configure `CORS_ORIGIN` in the API.

Focus a card and use the arrow keys to move it one position up or down, or one column left or right. Cards can also be dragged to any position, including empty columns. Position changes use `PUT /cards/:cardId` with a JSON body such as `{"column":"doing","position":1}`; `position` is the zero-based index in the destination column. A card's Details button expands assignee, checklist, and comment information inline. Assignee, checklist, and comment changes use `PATCH /cards/:cardId` with only the changed collection and replace the updated card in the board. Checklist descriptions save when their field loses focus. Comments are edited individually in a single textarea at a time, preserving their author and timestamp. Moving a card into the last column triggers a confetti animation.

Run the production build, lint checks, and UI tests with `npm run build`, `npm run lint`, and `npm test`.
