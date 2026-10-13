import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import type { ColumnData } from '../types/board'
import { Card } from './Card'
import type { CardDirection } from '../board-movement'
import type { DragEvent } from 'react'
import type { DropTarget } from './Board'

type ColumnProps = {
  column: ColumnData
  selectedCardId: string | null
  onSelectCard: (cardId: string) => void
  onDeselectCard: () => void
  onMoveCard: (cardId: string, direction: CardDirection) => Promise<void>
  blocked: boolean
  dropTarget: DropTarget | null
  onDragStart: (event: DragEvent, cardId: string) => void
  onDragOver: (event: DragEvent, columnId: string) => void
  onDrop: (event: DragEvent, columnId: string) => void
  onDragLeave: () => void
}

function DropMarker({ edge }: { edge: 'top' | 'bottom' }) {
  return <Box aria-hidden="true" data-drop-marker="" position="absolute" insetInline={0}
    top={edge === 'top' ? '-6px' : undefined} bottom={edge === 'bottom' ? '-6px' : undefined}
    height="3px" bg="blue.fg" borderRadius="full" pointerEvents="none" />
}

export function Column({ column, selectedCardId, onSelectCard, onDeselectCard, onMoveCard,
  blocked, dropTarget, onDragStart, onDragOver, onDrop, onDragLeave }: ColumnProps) {
  const target = dropTarget?.intent.columnId === column.id ? dropTarget : null
  return (
    <Box as="section" aria-label={column.title} bg="bg.muted" borderWidth="1px" borderColor="fg.muted" borderRadius="lg" p={4} minW={0} minH={{ base: 'auto', xl: 'calc(100dvh - 12rem)' }}
      display="flex" flexDirection="column" onDragOver={event => onDragOver(event, column.id)} onDrop={event => onDrop(event, column.id)}
      onDragLeave={event => {
        if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) onDragLeave()
      }}>
      <Heading as="h2" size="md" mb={4}>{column.title}</Heading>
      <Stack gap={3}>
        {column.cards.length === 0 && <Text color="fg.muted">No cards yet</Text>}
        {column.cards.map((card) => (
          <Box key={card.id} position="relative">
          {target?.anchor?.cardId === card.id && <DropMarker edge={target.anchor.side === 'before' ? 'top' : 'bottom'} />}
          <Card card={card} selected={selectedCardId === card.id} blocked={blocked} onDragStart={event => onDragStart(event, card.id)}
            onSelect={() => onSelectCard(card.id)} onDeselect={onDeselectCard}
            onMove={direction => onMoveCard(card.id, direction)} />
          </Box>
        ))}
      </Stack>
      <Box role="group" aria-label={`Déposer en fin de ${column.title}`} position="relative" minH="48px" flex={1} mt={3}>
        {target && !target.anchor && <DropMarker edge="top" />}
        <Text color="fg.muted" fontSize="sm">Fin de colonne</Text>
      </Box>
    </Box>
  )
}
