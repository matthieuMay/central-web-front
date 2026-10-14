import { HStack, Text } from '@chakra-ui/react'

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
  // Nothing to show: no empty line under the Card.
  if (assigneeCount === 0 && checklistTotal === 0 && commentCount === 0) return null

  const checklistComplete = checklistDone === checklistTotal

  return (
    <HStack gap={3} mt={2} fontSize="xs" color="fg.muted">
      {assigneeCount > 0 && <Text aria-label={`${assigneeCount} members`}>👤 {assigneeCount}</Text>}
      {checklistTotal > 0 && (
        <Text aria-label={`${checklistDone} of ${checklistTotal} tasks done`} color={checklistComplete ? 'green.fg' : 'fg.muted'}>
          ☑ {checklistDone}/{checklistTotal}
        </Text>
      )}
      {commentCount > 0 && <Text aria-label={`${commentCount} comments`}>💬 {commentCount}</Text>}
    </HStack>
  )
}
