# 05 — Where the front's tests bite

Type: grilling
Blocked by: None

## Question

Confirm the testing seams for the Board feature before implementation (the `to-spec` process requires the human's sign-off):

- **Highest seam:** the Board view wrapped in a query client with a mocked API (`fetch`/MSW), exercising selection, arrow Moves, drop Moves, clamping, and the Completion Celebration as external behaviour.
- **Lower seam:** the pure Move function — the mapping from a gesture or keypress to `{ column, position }` — for same-Column reorders, cross-Column clamped moves, and edge no-ops.
- Which seam(s) to build, what each asserts, and whether one seam suffices (the spec prefers the fewest, ideally one).
- Prior art to follow: `src/color-mode.test.tsx` (Vitest + Testing Library, behaviour-first, `vi.stubGlobal` for environment seams).

Confirm or amend the seams the spec proposes.
