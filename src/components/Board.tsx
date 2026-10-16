import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { Column, type BoardColumn } from './Column'

export interface BoardData {
  title: string
  columns: BoardColumn[]
}

interface BoardProps {
  board: BoardData
}

export function Board({ board }: BoardProps) {
  return (
    <Stack gap={4}>
      <Heading as="h1">{board.title}</Heading>
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 4 }}
        gap={4}
        alignItems="start"
      >
        {board.columns.map((column) => (
          <Column key={column.id} column={column} />
        ))}
      </SimpleGrid>
    </Stack>
  )
}