import { Text } from '@chakra-ui/react'
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
  // TODO Sprint 6: replace this temporary line with the summary and the bar.
  return <Text color="fg.muted">Sprint progress: {board.columns.length} columns — to implement</Text>
}