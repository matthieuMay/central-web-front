import { Heading, Text, Stack } from '@chakra-ui/react'
import board from '../../data/board.json'
import type { BoardType } from '../Type'
import { Board } from '../components/Board'
export function BoardPage() {
  return (
    <Stack gap={4}>
      <Heading as="h1">{(board as BoardType).title}</Heading>
      <Board board={board as BoardType} />
    </Stack>
  )
}

