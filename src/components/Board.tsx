import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import type { BoardData } from '../types/board'
import { Column } from './Column'

type BoardProps = { 
    board: BoardData 
    selectedCardId : string | null 
    onSelectCard : (cardId : string) => void
}

export function Board({ board, selectedCardId, onSelectCard }: BoardProps) {
  return (
    <Stack gap={6}>
      <Heading as="h1" size="2xl">{board.title}</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
        {board.columns.map((column) => (
          <Column key={column.id} column={column} selectedCardId={selectedCardId} onSelectCard={onSelectCard}/>
        ))}
      </SimpleGrid>
    </Stack>
  )
}
