/*
 * ColumnCounter
 *
 * RESPONSIBILITY
 *   Show how full a column is, next to its title: "3/4" when the column has a
 *   limit, just "7" when it has none (last column). When the limit is reached,
 *   it has a distinct "full" look (colour AND text or icon, never colour alone).
 *
 * PROPS
 *   count  number of cards in the column right now (column.cards.length, read
 *          from the board cache, so it includes optimistic changes).
 *   limit  number | null. Computed once in Board with
 *          getColumnLimit(board, column.id) and passed down through Column.
 *          null means unlimited.
 *
 * ACTIONS AND DATA OWNER
 *   No action and no state: purely presentational. It owns nothing. Board
 *   decides the limit, Column passes the count, columnLimit.ts holds the rule.
 *
 * CASES THAT PROVE IT WORKS
 *   1. Doing with 2 cards: "2/4" in the normal style.
 *   2. Doing with 4 cards: "4/4" in the full style, and a screen reader hears
 *      something like "4 of 4 cards, column full" (aria-label).
 *   3. Done with 7 cards: "7", never the full style.
 *   4. Empty Review: "0/4".
 *   5. It updates as soon as a card is created or moved, and goes back to its
 *      previous value if the API refuses the change (rollback).
 *   6. A column with 6 cards (older data): "6/4" in the full style.
 */
type ColumnCounterProps = {
  count: number
  limit: number | null
}

export function ColumnCounter({ count, limit }: ColumnCounterProps) {
  const isFull = limit !== null && count >= limit
  const label = limit === null
    ? `${count} cards, no limit`
    : `${count} of ${limit} cards${isFull ? ', column full' : ''}`

  return (
    <span className={`column-counter${isFull ? ' is-full' : ''}`} aria-label={label}>
      {limit === null ? count : `${count}/${limit}`}
      {isFull && <span aria-hidden="true"> · Full</span>}
    </span>
  )
}