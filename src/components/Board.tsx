import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import type { BoardData } from '../types/board'
import { Column } from './Column'

type BoardProps = { board: BoardData }

export function Board({ board }: BoardProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  return (
    <Stack gap={6}>
      <Heading as="h1" size="2xl">{board.title}</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
        {board.columns.map((column) => (
          <Column key={column.id} column={column} selectedCardId={selectedCardId} setSelectedCardId={setSelectedCardId} />
        ))}
      </SimpleGrid>
    </Stack>
  )
}
