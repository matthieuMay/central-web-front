import { Box, Heading, HStack, IconButton, Text } from '@chakra-ui/react'
import { motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import type { CardData } from '../types/board'
import { cardElementId, editElementId } from './cardIds'
import Confetti from './Confetti'

type CardProps = { card: CardData; selected: boolean; onSelect: () => void; onEdit: () => void; disabled: boolean; arriving: boolean; onArrival: () => boolean }

export function Card({ card, selected, onSelect, onEdit, disabled, arriving, onArrival }: CardProps) {
  const reducedMotion = useReducedMotion()
  const animating = useRef(false)
  const element = useRef<HTMLElement | null>(null)
  const [burst, setBurst] = useState(0)
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'CARD',
    item: () => ({ cardId: card.id, width: element.current?.offsetWidth ?? 240 }),
    canDrag: !disabled,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [card.id, disabled])

  useEffect(() => { preview(getEmptyImage(), { captureDraggingState: true }) }, [preview])

  const finishArrival = useCallback(() => {
    if (arriving && onArrival()) setBurst((current) => current + 1)
  }, [arriving, onArrival])

  useEffect(() => {
    if (!arriving) return
    // No layout callback occurs for reduced motion or a same-position layout.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (!animating.current || reducedMotion) finishArrival()
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [arriving, finishArrival, reducedMotion])

  function select(event: MouseEvent<HTMLElement>) {
    if ((event.target as Element).closest('button, input, textarea, select, a, [contenteditable]:not([contenteditable="false"])')) return
    onSelect()
  }

  return (
    <motion.div layout={!reducedMotion} layoutId={reducedMotion ? undefined : `card-${card.id}`} transition={{ layout: { type: 'spring', stiffness: 280, damping: 32 } }} onLayoutAnimationStart={() => { animating.current = true }} onLayoutAnimationComplete={() => { animating.current = false; finishArrival() }}>
      <Box
        ref={element} as="article" id={cardElementId(card.id)} data-card-id={card.id} tabIndex={0} onClick={select}
        onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onSelect() } }}
        aria-label={card.title} position="relative" opacity={isDragging ? 0.4 : 1}
        className="board-card" aria-current={selected ? 'true' : undefined}
        bg={selected ? 'bg.info' : 'bg'} borderColor={selected ? 'border.info' : 'border'}
        borderWidth="1px" borderRadius="md" p={4} overflowWrap="anywhere"
      >
        <HStack justify="space-between" align="start" gap={2}>
          <Heading as="h3" size="sm">{card.title}</Heading>
          <IconButton ref={(node) => { drag(node) }} type="button" aria-label={`Drag ${card.title}`} title="Drag to reorder" variant="ghost" size="xs" cursor={disabled ? 'default' : 'grab'} disabled={disabled} onClick={(event) => event.stopPropagation()}>⠿</IconButton>
        </HStack>
        {card.description && <Text color="fg.muted" mt={2} fontSize="sm">{card.description}</Text>}
        <IconButton id={editElementId(card.id)} type="button" aria-label={`Edit ${card.title}`} size="xs" variant="outline" mt={2} onClick={onEdit}>✎</IconButton>
        {burst > 0 && <Confetti key={burst} particleCount={24} />}
      </Box>
    </motion.div>
  )
}
