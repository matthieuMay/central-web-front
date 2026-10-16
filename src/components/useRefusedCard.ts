import { useCallback, useEffect, useRef, useState } from 'react'

/*
 * useRefusedCard
 *
 * RESPONSIBILITY
 *   Hold the short-lived state "this card was just refused", which drives the
 *   shake and the red border. It does NOT decide whether a move is refused
 *   (columnLimit.ts does) and it does NOT animate anything (RefusalShake does).
 *
 * WHAT IT RETURNS
 *   refusedCardId  string | null. The id of the card currently showing the
 *                  refusal feedback, or null.
 *   refuse(cardId) marks that card as refused, then puts the state back to null
 *                  by itself after FEEDBACK_MS (about 600 ms).
 *
 * DATA OWNER
 *   BoardPage calls this hook once, next to selectedCardId. It passes
 *   refusedCardId down Board -> Column -> Card, where each card receives a
 *   boolean: refused = (card.id === refusedCardId). This is UI state: it never
 *   goes in TanStack Query and is never sent to the API.
 *
 * WHERE THE INFORMATION COMES FROM
 *   refuse(cardId) is called by the single move entry point of BoardPage
 *   (requestMove, used by buttons, arrow keys and drag-and-drop) when
 *   canAcceptCard returns false.
 *
 * CASES THAT PROVE IT WORKS
 *   1. refuse('card-4'): refusedCardId becomes 'card-4', then null after the delay.
 *   2. Another refusal of the same card during the feedback: the feedback is
 *      simply extended (the timer restarts); replaying the shake is not required.
 *   3. Card A refused, then card B within the delay: only B is marked.
 *   4. Leaving /board during the delay: no timer keeps running and no state
 *      update happens after the component is gone.
 *   5. Reduced motion does not change this hook: RefusalShake decides to skip
 *      the shake and keep only the red border.
 */
export const FEEDBACK_MS = 600

export function useRefusedCard() {
  const [refusedCardId, setRefusedCardId] = useState<string | null>(null)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const refuse = useCallback((cardId: string) => {
    if (timeout.current) clearTimeout(timeout.current)
    setRefusedCardId(cardId)
    timeout.current = setTimeout(() => {
      setRefusedCardId((current) => current === cardId ? null : current)
      timeout.current = null
    }, FEEDBACK_MS)
  }, [])

  useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current)
  }, [])

  return {
    refusedCardId,
    refuse,
  }
}
