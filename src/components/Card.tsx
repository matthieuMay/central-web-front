import { Box, Button, Heading, Text } from '@chakra-ui/react'
import type { CardData, UserData } from '../types/board'
import { userName } from '../card-editing'
import type { CardDirection } from '../board-movement'
import type { DragEvent } from 'react'

const arrowDirections = new Map<string, CardDirection>([
  ['ArrowLeft', 'left'], ['ArrowRight', 'right'], ['ArrowUp', 'up'], ['ArrowDown', 'down'],
])

type CardProps = {
  card: CardData
  selected: boolean
  onSelect: () => void
  onDeselect: () => void
  onMove: (direction: CardDirection) => Promise<void>
  blocked: boolean
  onDragStart: (event: DragEvent) => void
  users: UserData[]
  onOpen: () => void
}

export function Card({ card, selected, onSelect, onDeselect, onMove, blocked, onDragStart, users, onOpen }: CardProps) {
  return (
    <Box as="article" tabIndex={0} data-card-id={card.id} draggable={!blocked}
      onDragStart={event => {
        if (event.target instanceof Element && event.target.closest('button, a, input, textarea, select, [contenteditable]')) {
          event.preventDefault()
          return
        }
        onDragStart(event)
      }}
      aria-label={`${card.title}${selected ? ', carte sélectionnée' : ''}`}
      aria-describedby="board-instructions" bg={selected ? 'blue.subtle' : 'bg'}
      borderWidth="1px" borderColor={selected ? 'blue.fg' : 'fg.muted'} borderRadius="md" p={4}
      overflowWrap="anywhere" cursor="pointer"
      _focusVisible={{ outline: '3px solid', outlineColor: 'blue.fg', outlineOffset: '2px' }}
      onClick={event => {
        if (event.target instanceof Element && event.target.closest('button, a, input, textarea, select, [contenteditable]')) return
        event.currentTarget.focus()
        onSelect()
      }}
      onKeyDown={event => {
        if (event.target !== event.currentTarget) return
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect() }
        if (event.key === 'Escape') { event.preventDefault(); onDeselect() }
        const direction = arrowDirections.get(event.key)
        if (selected && direction) {
          event.preventDefault()
          void onMove(direction)
        }
      }}>
      <Heading as="h3" size="sm">{card.title}</Heading>
      {selected && <Text color="blue.fg" fontSize="sm">Sélectionnée</Text>}
      {card.description && <Text color="fg.muted" mt={2} fontSize="sm">{card.description}</Text>}
      {card.assignees.length > 0 && <Text mt={2} fontSize="sm" overflowWrap="anywhere">Membres : {card.assignees.map(id => userName(users, id)).join(', ')}</Text>}
      <Text color="fg.muted" fontSize="sm" mt={2}>
        {card.comments.length} commentaire{card.comments.length !== 1 ? 's' : ''} · {card.checklistItems.filter(item => item.done).length}/{card.checklistItems.length} tâches terminées
      </Text>
      <Button mt={3} size="sm" variant="outline" onClick={onOpen} aria-label={`Ouvrir les détails de ${card.title}`}>Détails de la carte</Button>
    </Box>
  )
}
