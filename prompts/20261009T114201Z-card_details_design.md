The user explicitly invoked the "/grill-with-docs" skill. Follow its instructions now.

The requested design concerns adding card details to the board: assignees, comments with a selectable author, and checklist items. The supplied API contract is:
- GET /users
- GET /boards/mini-trello
- PATCH /cards/:cardId, where submitted lists replace those lists and omitted lists remain unchanged.
New comments must omit createAt, and checklist items have no API id.
