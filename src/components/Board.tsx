import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { useState } from 'react'
import type { BoardData } from '../types/board'
import { Column } from './Column'

type BoardProps = { board: BoardData }


export function Board({ board }: BoardProps) {
  const [cardSelectedId, setCardSelectedId] = useState<string | null>(null)
  function handleCardSelect(cardId: string) {
    if (cardSelectedId !== null) {
      console.log(`Card ${cardSelectedId} deselected`)
    }
    if (cardSelectedId && cardSelectedId === cardId) {
      setCardSelectedId(null)
    } else {
      setCardSelectedId(cardId)
      console.log(`Card ${cardSelectedId} selected`)
    } 
  }
  
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (cardSelectedId === null) {
      console.log('No card selected')
      return
    }
    if (event.key === 'ArrowLeft') {
      console.log(`La carte ${cardSelectedId} a été déplacée vers la gauche`)
    }
    if (event.key === 'ArrowRight') {
      console.log(`La carte ${cardSelectedId} a été déplacée vers la droite`)
    }
   
  }






  return (
    <Stack gap={6}  onKeyDown={handleKeyDown} tabIndex={0}>
      <Heading as="h1" size="2xl">{board.title}</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
        {board.columns.map((column) => (
          <Column key={column.id} column={column} onCardSelect={handleCardSelect} cardSelectedId={cardSelectedId} />
        ))}
      </SimpleGrid>
    </Stack>
  )
}
