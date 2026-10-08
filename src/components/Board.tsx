import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { useState } from 'react'
import type { BoardData } from '../types/board'
import { Column } from './Column'

type BoardProps = { board: BoardData }

export function Board({ board }: BoardProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  function selectCard(cardId: string) {
    setSelectedCardId(current => current === cardId ? null : cardId)
  }

  return (
    <Stack gap={6}>
      <Heading as="h1" size="2xl">{board.title}</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
        {board.columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            selectedCardId={selectedCardId}
            onSelectCard={selectCard}
          />
        ))}
      </SimpleGrid>
    </Stack>
  )
}
