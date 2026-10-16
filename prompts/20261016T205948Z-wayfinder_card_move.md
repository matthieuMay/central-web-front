/wayfinder

Explore the existing implementation and identify the decisions and risks involved in adding:

- Keyboard movement: select a card, use Left/Right to move between adjacent columns, and Up/Down to reorder within a column.
- Drag-and-drop: reorder within a column, move to an adjacent column at a chosen position, and drop into empty columns.
- API persistence using `PUT /cards/:cardId` with `column` and optional zero-based `position`.
- Confetti when a card successfully arrives in the final column.
Inspect the existing movement implementation, API integration, state management, available skills, and relevant local specifications. Do not modify code yet.

Return a decision map of what needs to be decided, what already exists, what could break, and what should be implemented first. Keep the existing architecture and avoid unnecessary dependencies.
