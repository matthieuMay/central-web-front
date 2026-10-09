import { Box, Heading, IconButton, Text } from '@chakra-ui/react'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, type MouseEvent } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import type { CardData, User } from '../types/board'
import { cardElementId, commentsElementId, editElementId } from './cardIds'
import { CardChecklist } from './CardChecklist'
import { CardAssignees } from './CardAssignees'
import { CardComments } from './CardComments'
import Confetti from './Confetti'

type CardProps = {
  card: CardData
  columnId: string
  position: number
  selected: boolean
  disabled: boolean
  celebrationToken: number | null
  onSelect: () => void
  onEdit: () => void
  onChecklistChange: (items: CardData['checklistItems']) => void
  onComments: () => void
  users: User[]
  checklistDisabled: boolean
}

export function Card({ card, columnId, position, selected, disabled, celebrationToken, onSelect, onEdit, onChecklistChange, onComments, users, checklistDisabled }: CardProps) {
  const reducedMotion = useReducedMotion()
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'CARD',
    item: { cardId: card.id, title: card.title, sourceColumnId: columnId, sourcePosition: position },
    canDrag: !disabled,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [card.id, columnId, position, disabled])

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  function select(event: MouseEvent<HTMLElement>) {
    if ((event.target as Element).closest('button, input, textarea, select, a, [contenteditable]:not([contenteditable="false"])')) return
    onSelect()
  }

  return (
    <motion.div
      layout={!reducedMotion}
      layoutId={reducedMotion ? undefined : `card-${card.id}`}
      transition={{ layout: { type: 'spring', stiffness: 280, damping: 32 } }}
    >
      <Box
        ref={drag}
        as="article" id={cardElementId(card.id)} tabIndex={-1} onClick={select}
        className="board-card" aria-current={selected ? 'true' : undefined} aria-busy={isDragging || undefined}
        aria-label={`${card.title}${selected ? ', selected' : ''}`}
        bg={selected ? 'bg.info' : 'bg'} borderColor={selected ? 'border.info' : 'border'}
        borderWidth={selected ? '2px' : '1px'} borderRadius="md" p={4} overflowWrap="anywhere"
        cursor={disabled ? 'default' : 'grab'} position="relative" overflow="visible"
      >
        {celebrationToken !== null && <Confetti key={`${card.id}-${celebrationToken}`} particleCount={1} />}
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2}>
          <Heading as="h3" size="md" flex="1" minW={0}>{card.title}</Heading>
          <CardAssignees assigneeIds={card.assignees} users={users} onOpenDetails={onEdit} />
        </Box>
        {card.description && <Text color="fg.muted" mt={2} fontSize="sm">{card.description}</Text>}
        <CardComments comments={card.comments ?? []} users={users} onOpen={onComments} />
        <CardChecklist items={card.checklistItems ?? []} onChange={onChecklistChange} readOnly allowToggle disabled={disabled || checklistDisabled} />
        <Box display="flex" gap={2} mt={2}>
          <IconButton id={editElementId(card.id)} type="button" aria-label={`Edit ${card.title}`} size="xs" variant="outline" onClick={onEdit}>✎</IconButton>
          {!card.comments?.length && <IconButton id={`add-${commentsElementId(card.id)}`} type="button" aria-label={`Add comment to ${card.title}`} size="xs" variant="outline" onClick={onComments}>💬</IconButton>}
        </Box>
      </Box>
    </motion.div>
  )
}
