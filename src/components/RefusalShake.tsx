import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

/*
 * RefusalShake
 *
 * RESPONSIBILITY
 *   Wrap ONE card and play the refusal feedback while refused is true: a short
 *   horizontal shake (about 400 to 500 ms) and a red border that fades back to
 *   normal. Nothing else: it knows nothing about limits, columns or the API.
 *
 * PROPS
 *   refused   boolean. True while this card is marked refused
 *             (refusedCardId === card.id, see useRefusedCard).
 *   children  the card content to wrap.
 *
 * ACTIONS AND DATA OWNER
 *   Stateless, no action. The boolean comes from BoardPage through
 *   Board -> Column -> Card. For now it just renders its children.
 *
 * WHERE THE ANIMATION COMES FROM
 *   Motion, already installed in the project: animate x with a short keyframe
 *   sequence (left, right, left, centre) and the border colour (Chakra token
 *   red.500, then back). useReducedMotion() from Motion: if the user asked for
 *   reduced motion, NO shake, only the red border.
 *
 * INTERACTIONS TO RESPECT
 *   - It must not break the existing drag-and-drop transforms or the layout
 *     animation of the card.
 *   - While refused, the red border takes priority over the blue border of a
 *     selected card; afterwards the selected style comes back.
 *   - Keyboard focus on the card must not be lost.
 *
 * CASES THAT PROVE IT WORKS
 *   1. refused = false: no visual change at all.
 *   2. refused = true: the card shakes and shows a red border, then returns to
 *      normal when refused goes back to false.
 *   3. Reduced motion on: red border only, no movement.
 *   4. A selected card that is refused: red border during the feedback, blue
 *      border afterwards (it is still selected).
 *   5. Card text, buttons and form controls inside the card stay usable
 *      during and after the feedback.
 */
type RefusalShakeProps = {
  refused: boolean
  children: ReactNode
}

export function RefusalShake({ refused, children }: RefusalShakeProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      animate={refused
        ? {
            x: reduceMotion ? 0 : [0, -7, 7, -5, 5, 0],
            outlineColor: reduceMotion ? '#e53e3e' : ['#e53e3e', '#e53e3e', '#e53e3e', 'rgba(229, 62, 62, 0)'],
          }
        : { x: 0, outlineColor: 'rgba(229, 62, 62, 0)' }}
      transition={{ duration: reduceMotion ? 0.6 : 0.48, ease: 'easeInOut' }}
      style={{ display: 'block', outline: '2px solid transparent', outlineOffset: '1px', borderRadius: '6px' }}
    >
      {children}
    </motion.div>
  )
}