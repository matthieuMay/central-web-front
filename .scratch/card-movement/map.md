## Destination

Deliver keyboard and drag-and-drop card movement across adjacent Columns and within a Column, persist the exact resulting order through the existing PUT API, and celebrate successful arrivals in the final Column.

## Notes

- Use the existing React component structure, React Query mutation ledger, BoardData array order, API contract, and installed `motion` dependency.
- Keep movement accessible and preserve current behavior. Avoid a new dependency unless a focused prototype shows the existing browser/event approach cannot satisfy the agreed interaction.
- Consult the local `grilling` and `domain-modeling` skills; use Board, Column, Card, and position terminology from the API context.
- The API contract is already implemented. Do not change API schema or add another endpoint absent a demonstrated gap.

## Decisions so far

None. Existing code/API facts are recorded in the open decision tickets, not treated as decisions.

## Not yet specified

No additional fog identified beyond the open decision tickets. Revisit touch/pointer drag behavior if the chosen drag strategy cannot be established from a small prototype.

## Out of scope

- Replacing React Query, changing BoardData to persist a separate per-Card position field, changing the API schema, or adding a movement endpoint.
- Adding a DnD dependency by default; reconsider only if the agreed interaction cannot be implemented accessibly with the current stack.
