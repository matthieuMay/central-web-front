/wayfinder Sprint 4 goal: move cards and reward the user.
Keyboard: with a selected card, ArrowLeft/ArrowRight move it to the neighbouring column (already exists), ArrowUp/ArrowDown change its rank in its column; no impossible move at the edges.
Drag and drop: reorder within the same column; drop into the neighbouring column at the targeted place; an empty column also accepts a drop.
Confetti (existing src/components/Confetti.tsx) only when a card enters the last column after the API has confirmed the move; respect prefers-reduced-motion.
API contract: PUT /cards/:cardId with {"column": "<columnId>", "position": <zero-based index after removing the card>} returns the full BoardData; without position the card goes to the end. The local API runs at http://localhost:3000.
The order must persist after reload. Keep the dark mode, selection, Move buttons and edit drawer working.
Constraints: keep the code simple and readable for a beginner; avoid new dependencies unless clearly necessary and justify them; no test framework. npm run lint and npm run build must pass.
Help me identify the open decisions (UX, UI, technical) before any code. Do not implement before my go.
