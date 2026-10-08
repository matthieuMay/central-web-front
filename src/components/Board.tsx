import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import type { BoardData } from '../types/board'
import { Column } from './Column'

type BoardProps = { board: BoardData }
var cardSelected: string | null = null;
function handleCardSelect(cardId: string) {
  if (cardSelected !== null) {
    console.log(`Card ${cardSelected} deselected`)
  }
  if (cardSelected && cardSelected === cardId) {
    cardSelected = null
  } else {
    cardSelected = cardId
    console.log(`Card ${cardSelected} selected`)
  } 
}

function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
  if (cardSelected === null) {
    console.log('No card selected')
    return
  }
  if (event.key === 'Left') {
    console.log(`La carte ${cardSelected} a été déplacée vers la gauche`)
  }
  if (event.key === 'Right') {
    console.log(`La carte ${cardSelected} a été déplacée vers la droite`)
  }
}

export function Board({ board }: BoardProps) {
  return (
    <Stack gap={6} onKeyDown={handleKeyDown}>
      <Heading as="h1" size="2xl">{board.title}</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
        {board.columns.map((column) => (
          <Column key={column.id} column={column} onCardSelect={handleCardSelect} />
        ))}
      </SimpleGrid>
    </Stack>
  )
}
