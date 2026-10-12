import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import { LayoutGroup } from 'motion/react'
import type { BoardData, CardLabel, UserData } from '../types/board'
import type { UpdateCardCollectionsInput } from '../api/mutations'
import { Column } from './Column'
import { cardLabels } from '../types/cardLabels'

type BoardProps = {
  board: BoardData
  users: UserData[]
  selectedCardId: string | null
  onSelectCard: (id: string) => void
  onEditCard: (id: string) => void
  onMoveCard: (cardId: string, columnId: string, position: number) => void
  celebrationCardId: string | null
  celebrationKey: number
  onUpdateCollections: (input: UpdateCardCollectionsInput) => Promise<unknown>
  collectionsPending: boolean
  visibleLabels: Set<CardLabel>
  onToggleLabel: (label: CardLabel, labels: Set<CardLabel>) => void
  onSortColumn: (columnId: string) => void
  onChangeLabel: (cardId: string, label: CardLabel) => void
}

// Responsibility: compose the board heading and all Columns.
// Props provide the Board data plus selection, editing, and movement callbacks;
// BoardPage owns the state and persistence.
// Actions: it maps each Column and passes the relevant data and callbacks down.
// Correctness: the title renders once, every column renders once, and each
// Column receives the callbacks needed for its cards to remain interactive.
export function Board({ board, users, selectedCardId, onSelectCard, onEditCard, onMoveCard, celebrationCardId, celebrationKey, onUpdateCollections, collectionsPending, visibleLabels, onToggleLabel, onSortColumn, onChangeLabel }: BoardProps) {
  return (
    <LayoutGroup id="board-cards">
    <Stack gap={6}>
      <Heading as="h1" size="2xl">{board.title}</Heading>
      <div className="label-palette" aria-label="Filter cards by label">
        {visibleLabels.size < cardLabels.length && <button type="button" className="label-filter" onClick={() => onToggleLabel(cardLabels[0].id, new Set(cardLabels.map((label) => label.id)))}>Show all</button>}
        {visibleLabels.size === cardLabels.length && <button type="button" className="label-filter" onClick={() => onToggleLabel(cardLabels[0].id, new Set())}>Show none</button>}
        {cardLabels.map((label) => {
          const active = visibleLabels.has(label.id)
          return (
            <button key={label.id} type="button" aria-pressed={active} className="label-filter" style={{ opacity: active ? 1 : 0.25 }} onClick={() => {
              const next = new Set(visibleLabels)
              if (active) next.delete(label.id)
              else next.add(label.id)
              onToggleLabel(label.id, next)
            }} onDoubleClick={() => onToggleLabel(label.id, new Set([label.id]))}>
              <span className="label-dot" style={{ backgroundColor: label.color }} aria-hidden="true" />
              {label.name}
            </button>
          )
        })}
      </div>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4} alignItems="stretch">
        {board.columns.map((column, columnIndex) => (
          <Column key={column.id} column={column} users={users} selectedCardId={selectedCardId} onSelectCard={onSelectCard} onEditCard={onEditCard} onMoveCard={onMoveCard}
            isLastColumn={columnIndex === board.columns.length - 1} onSortColumn={onSortColumn} onChangeLabel={onChangeLabel}
            celebrationCardId={celebrationCardId} celebrationKey={celebrationKey}
            onUpdateCollections={onUpdateCollections} collectionsPending={collectionsPending} visibleLabels={visibleLabels} />
        ))}
      </SimpleGrid>
    </Stack>
    </LayoutGroup>
  )
}
