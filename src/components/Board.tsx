import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { LayoutGroup } from 'motion/react'
import type { BoardData, UserData } from '../types/board'
import type { UpdateCardCollectionsInput } from '../api/mutations'
import { Column } from './Column'

type BoardProps = {
  board: BoardData
  users: UserData[]
  selectedCardId: string | null
  onSelectCard: (id: string) => void
  onEditCard: (id: string) => void
  onMoveCard: (cardId: string, columnId: string, position: number) => void
  onUpdateCollections: (input: UpdateCardCollectionsInput) => Promise<unknown>
  collectionsPending: boolean
}

// Responsibility: compose the board heading and all Columns.
// Props provide the Board data plus selection, editing, and movement callbacks;
// BoardPage owns the state and persistence.
// Actions: it maps each Column and passes the relevant data and callbacks down.
// Correctness: the title renders once, every column renders once, and each
// Column receives the callbacks needed for its cards to remain interactive.
export function Board({ board, users, selectedCardId, onSelectCard, onEditCard, onMoveCard, onUpdateCollections, collectionsPending }: BoardProps) {
  return (
    <LayoutGroup id="board-cards">
    <Stack gap={6}>
      <Heading as="h1" size="2xl">{board.title}</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
        {board.columns.map((column) => (
          <Column key={column.id} column={column} users={users} selectedCardId={selectedCardId} onSelectCard={onSelectCard} onEditCard={onEditCard} onMoveCard={onMoveCard}
            onUpdateCollections={onUpdateCollections} collectionsPending={collectionsPending} />
        ))}
      </SimpleGrid>
    </Stack>
    </LayoutGroup>
  )
}
