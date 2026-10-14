import { Text } from '@chakra-ui/react'

// Sprint 6 — Badges shown at the bottom of a Card.
// Responsibility: DISPLAY ONLY. Show three small counters so the progress of a Card
// is visible without opening it: members (👤), checklist (☑ done/total), comments (💬).
// The parent (Card) does the counting and passes plain numbers.
// Rules: a counter that is 0 is not shown (checklist: hidden when checklistTotal is 0).
// When every checklist task is done, the checklist badge is shown in green.
type CardBadgesProps = {
  assigneeCount: number
  checklistDone: number
  checklistTotal: number
  commentCount: number
}

export function CardBadges({ assigneeCount, checklistDone, checklistTotal, commentCount }: CardBadgesProps) {
  // TODO Sprint 6: replace this temporary line with the three badges.
  return (
    <Text fontSize="xs" color="fg.muted" mt={2}>
      badges: {assigneeCount} / {checklistDone}-{checklistTotal} / {commentCount} — to implement
    </Text>
  )
}