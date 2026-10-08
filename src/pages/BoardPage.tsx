import { Heading, Text, Stack } from '@chakra-ui/react'
import { Board } from '../components/Board'
import board from "../../data/board.json"

export function BoardPage() {
  return (
    <Stack gap={4}>
      <Board board={board} />
    </Stack>
  )
}
