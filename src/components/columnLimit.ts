import type { BoardData } from '../types/board'

/*
 * columnLimit: the card limit rule of the board. SINGLE SOURCE OF TRUTH.
 *
 * FEATURE
 *   Every column holds at most 4 cards, EXCEPT the last column of the board
 *   (Done), which has no limit. Moving a card into a full column is refused:
 *   the card shakes, its border turns red briefly, and it ends up back where
 *   it was.
 *
 * RESPONSIBILITY OF THIS FILE
 *   Pure functions only: no React, no API call, no animation. They answer two
 *   questions:
 *     - what is the limit of this column? (a number, or null when unlimited)
 *     - can this column accept this card right now?
 *
 * WHERE THE INFORMATION COMES FROM
 *   - board: the TanStack Query cache entry ['board', 'mini-trello'], read in
 *     BoardPage (data.columns). It already contains optimistic updates, so a
 *     move still in flight is counted.
 *   - "last column": the LAST item of board.columns (by order), never found by
 *     name or id.
 *   - the limit value: the constant below. The API does not store or enforce it.
 *
 * RULES
 *   R1. limit = 4 for every column except the last one (limit = null).
 *   R2. A column accepts a card if its limit is null, or if its number of cards
 *       (not counting the moved card when it already belongs to that column) is
 *       below the limit.
 *   R3. Reordering inside the same column is always accepted: the count does
 *       not change.
 *   R4. A column already over the limit (older data) is simply "full": nothing
 *       can enter it, cards can still leave and be reordered. No automatic
 *       removal of cards.
 *
 * ONE ENTRY POINT FOR ALL MOVES
 *   The check must happen BEFORE any API call, in the one function of BoardPage
 *   used by the Move left / Move right buttons, the arrow keys and the
 *   drag-and-drop drop (call it requestMove). If it refuses, no PUT is sent, no
 *   optimistic update happens, and the refusal feedback is triggered instead.
 *
 * USE CASES TO CHECK
 *   1. Doing has 3 cards, a card from Review moves in: accepted (3 -> 4).
 *   2. Doing has 4 cards, a card from Review moves in: refused.
 *   3. Doing has 4 cards, one of them is moved up or down inside Doing: accepted.
 *   4. Done has 10 cards and one more arrives: accepted (no limit).
 *   5. A column with 5 cards (older data) refuses entries but lets cards leave.
 *   6. The first column has no left neighbour and the last has no right one:
 *      those cases are still handled by the existing edge rules, not by this file.
 *
 * DECISIONS (defaults proposed here: edit them if you disagree)
 *   D1. The "Add card" form also respects the limit: in a full column its button
 *       is disabled and says the column is full. (Not in your original request:
 *       confirm or remove.)
 *   D2. The limit exists only in the Front. Another browser or the API could
 *       still exceed it. Accepted for this sprint.
 *   D3. Keyboard and buttons: the card never leaves its column, so it shakes in
 *       place. Drag-and-drop: the card snaps back to its original slot and
 *       shakes there (simplest). A longer version (stay under the cursor, shake,
 *       then glide back) depends on your drag-and-drop library: confirm.
 *   D4. A short visible message and a screen-reader announcement, for example
 *       "Doing is full (4/4)", in the same area as the existing move error
 *       message.
 */
export const MAX_CARDS_PER_COLUMN = 4

export function getColumnLimit(board: BoardData, columnId: string): number | null {
  const columnIndex = board.columns.findIndex((column) => column.id === columnId)
  if (columnIndex < 0) return MAX_CARDS_PER_COLUMN
  return columnIndex === board.columns.length - 1 ? null : MAX_CARDS_PER_COLUMN
}

export function canAcceptCard(board: BoardData, columnId: string, cardId: string): boolean {
  const destination = board.columns.find((column) => column.id === columnId)
  if (!destination) return false

  const source = board.columns.find((column) =>
    column.cards.some((card) => card.id === cardId))
  if (source?.id === destination.id) return true

  const limit = getColumnLimit(board, columnId)
  return limit === null || destination.cards.length < limit
}
