import { Box, Stack, Text } from '@chakra-ui/react'
import type { BoardData } from '../types/board'

// Sprint 6 — Progress summary of the sprint, shown under the board title.
// Hypothesis: the board holds the tasks of the current sprint (sprint backlog)
// and the LAST column holds the finished tasks.
// Responsibility: DISPLAY ONLY, nothing is sent to the API.
// - count all the Cards of the board;
// - count the Cards of the last column (= done);
// - show "X cards · Y done · Z %" and a simple progress bar (a Box whose width is Z %);
// - when the board has no Card, show "No cards in this sprint yet" (no division by 0).
type SprintProgressProps = {
  board: BoardData
}

export function SprintProgress({ board }: SprintProgressProps) {
  // flatMap puts the Cards of every column in one single list.
  const total = board.columns.flatMap((column) => column.cards).length
  const lastColumn = board.columns[board.columns.length - 1]
  const done = lastColumn ? lastColumn.cards.length : 0

  if (total === 0) return <Text color="fg.muted">No cards in this sprint yet</Text>

  const percent = Math.round((done / total) * 100)

  return (
    <Stack gap={2}>
      <Text>{total} cards · {done} done · {percent} %</Text>
      <Box role="progressbar" aria-label="Sprint progress" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} h={2} bg="bg.muted" borderRadius="full" overflow="hidden">
        <Box h="full" w={`${percent}%`} bg="green.solid" />
      </Box>
    </Stack>
  )
}
