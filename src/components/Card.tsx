import { Badge, Box, Button, Flex, Heading, Text } from '@chakra-ui/react'
import type { CardData, UserData } from '../types/board'
import { userName } from '../card-editing'
import type { CardDirection } from '../board-movement'
import type { DragEvent } from 'react'
import { MemberAvatar } from './visual/MemberAvatar'

const arrowDirections = new Map<string, CardDirection>([
  ['ArrowLeft', 'left'], ['ArrowRight', 'right'], ['ArrowUp', 'up'], ['ArrowDown', 'down'],
])

const interactiveControlSelector = 'button, a, input, textarea, select, [contenteditable]'

function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest(interactiveControlSelector)
}

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

export function Card({
  card,
  selected,
  onSelect,
  onDeselect,
  onMove,
  blocked,
  onDragStart,
  users,
  onOpen
}: CardProps) {
  const completedTasks = card.checklistItems.filter(item => item.done).length
  const taskCount = card.checklistItems.length
  const checklistPercent = taskCount > 0 ? completedTasks / taskCount * 100 : 0
  return (
    <Box
      as="article"
      className="kanban-card"
      tabIndex={0}
      data-card-id={card.id}
      draggable={!blocked}
      onDragStart={event => {
        if (isInteractiveTarget(event.target)) {
          event.preventDefault()
          return
        }
        onDragStart(event)
      }}
      aria-label={`${card.title}${selected ? ', carte sélectionnée' : ''}`}
      aria-describedby="board-instructions"
      bg="bg"
      borderWidth={selected ? '2px' : '1px'}
      borderColor={selected ? 'brand.focusRing' : 'border'}
      borderRadius="xl"
      p={5}
      boxShadow="card"
      _hover={{ borderColor: 'brand.focusRing', boxShadow: 'elevated' }}
      overflowWrap="anywhere"
      cursor="pointer"
      _focusVisible={{ outline: '3px solid', outlineColor: 'brand.focusRing', outlineOffset: '3px' }}
      onClick={event => {
        if (isInteractiveTarget(event.target))
          return
        event.currentTarget.focus()
        onSelect()
      }}
      onKeyDown={event => {
        if (event.target !== event.currentTarget)
          return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
        if (event.key === 'Escape') {
          event.preventDefault()
          onDeselect()
        }
        const direction = arrowDirections.get(event.key)
        if (selected && direction) {
          event.preventDefault()
          void onMove(direction)
        }
      }}
    >

      <Heading as="h3" size="md" lineHeight="1.5">{card.title}</Heading>
      {selected && <Badge
        mt={2}
        bg="blue.subtle"
        color="blue.fg"
        borderRadius="md"
      >Sélectionnée</Badge>}
      {card.description && <Text
        color="fg.muted"
        mt={3}
        fontSize="sm"
        lineClamp={2}
      >
        {card.description}
      </Text>}
      {taskCount > 0 && <Box mt={4}>

        <Text color="fg.muted" fontSize="sm" mb={2}>Checklist · {completedTasks}/{taskCount} tâches terminées</Text>
        <Box
          aria-hidden="true"
          h="6px"
          bg="bg.muted"
          borderRadius="full"
          overflow="hidden"
        >

          <Box h="100%" bg="tone.teal.accent" width={`${checklistPercent}%`} />
        </Box>
      </Box>}
      <Flex
        gap={3}
        mt={4}
        align="center"
        justify="space-between"
        wrap="wrap"
      >

        {card.comments.length > 0 && <Badge
          bg="bg.muted"
          color="fg.muted"
          borderRadius="md"
          px={2}
          py={1}
        >
          {card.comments.length} commentaire{card.comments.length === 1 ? '' : 's'}
        </Badge>}
        {card.assignees.length > 0 && <Flex
          role="group"
          aria-label="Membres associés"
          gap={1}
          wrap="wrap"
        >

          {card.assignees.map(id => <MemberAvatar key={id} name={userName(users, id)} />)}
        </Flex>}
      </Flex>
      <Button
        mt={4}
        size="sm"
        width="100%"
        variant="outline"
        onClick={onOpen}
        aria-label={`Ouvrir les détails de ${card.title}`}
      >Détails de la carte</Button>
    </Box>
  )
}
