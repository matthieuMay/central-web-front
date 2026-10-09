import { Box, Heading, HStack, IconButton, Text } from '@chakra-ui/react'
import { motion, useAnimate, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import type { CardData } from '../types/board'
import { cardElementId, editElementId } from './cardIds'
import Confetti from './Confetti'
import type { CardDragItem, CardLanding, DragPosition } from './CardDragPreview'

type CardProps = { card: CardData; selected: boolean; onSelect: () => void; onEdit: () => void; disabled: boolean; arriving: boolean; onArrival: () => boolean; onCancelDrag: (id: string, origin: DragPosition) => void; dropOrigin: DragPosition | null; returning: CardLanding['returning'] }

export function Card({ card, selected, onSelect, onEdit, disabled, arriving, onArrival, onCancelDrag, dropOrigin, returning }: CardProps) {
  const reducedMotion = useReducedMotion()
  const animating = useRef(false)
  const element = useRef<HTMLElement | null>(null)
  const handle = useRef<HTMLButtonElement | null>(null)
  const arrivalHandler = useRef(onArrival)
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const [burst, setBurst] = useState(0)
  const [{ isDragging }, drag, preview] = useDrag<CardDragItem, { moved: boolean }, { isDragging: boolean }>(() => ({
    type: 'CARD',
    item: () => {
      const cardRect = element.current!.getBoundingClientRect()
      const handleRect = handle.current!.getBoundingClientRect()
      return { cardId: card.id, width: cardRect.width, offset: { x: cardRect.left - handleRect.left, y: cardRect.top - handleRect.top } }
    },
    canDrag: !disabled,
    end: (item, monitor) => {
      if (monitor.didDrop()) return
      const source = monitor.getSourceClientOffset()
      if (source) onCancelDrag(item.cardId, { x: source.x + item.offset.x, y: source.y + item.offset.y })
    },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [card.id, disabled, onCancelDrag])

  useEffect(() => { preview(getEmptyImage(), { captureDraggingState: true }) }, [preview])

  useLayoutEffect(() => { arrivalHandler.current = onArrival }, [onArrival])

  const finishArrival = useCallback(() => {
    if ((arriving || returning) && arrivalHandler.current()) setBurst((current) => current + 1)
  }, [arriving, returning])

  useLayoutEffect(() => {
    if (!dropOrigin || (!arriving && !returning) || reducedMotion) return
    const node = element.current!.parentElement!
    node.style.transform = 'none'
    const rect = node.getBoundingClientRect()
    const opacity = returning === 'failed' ? 1 : 0.88
    const from = `translate3d(${dropOrigin.x - rect.left}px, ${dropOrigin.y - rect.top}px, 0) rotate(${returning === 'failed' ? 0 : -3}deg)`
    node.style.transform = from
    node.style.opacity = String(opacity)
    animating.current = true
    let cancelled = false
    const playback = animate(node, {
      transform: [from, 'translate3d(0, 0, 0) rotate(0deg)'],
      opacity: [opacity, 1],
    }, { type: 'spring', stiffness: 280, damping: 32 })
    void playback.then(() => { if (!cancelled) { animating.current = false; finishArrival() } })
    return () => { cancelled = true; playback.stop(); animating.current = false }
  }, [dropOrigin, arriving, returning, reducedMotion, animate, finishArrival])

  useEffect(() => {
    if (!arriving && !returning) return
    // No layout callback occurs for reduced motion or a same-position layout.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (!animating.current || reducedMotion) finishArrival()
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [arriving, returning, finishArrival, reducedMotion])

  function select(event: MouseEvent<HTMLElement>) {
    if ((event.target as Element).closest('button, input, textarea, select, a, [contenteditable]:not([contenteditable="false"])')) return
    onSelect()
  }

  return (
    <motion.div ref={scope} layout={!reducedMotion && !isDragging && !(dropOrigin && (arriving || returning))} layoutId={reducedMotion || isDragging || dropOrigin ? undefined : `card-${card.id}`} transition={{ layout: { type: 'spring', stiffness: 280, damping: 32 } }} onLayoutAnimationStart={() => { animating.current = true }} onLayoutAnimationComplete={() => { animating.current = false; finishArrival() }}>
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
          <IconButton ref={(node) => { handle.current = node; drag(node) }} type="button" aria-label={`Drag ${card.title}`} title="Drag to reorder" variant="ghost" size="xs" cursor={disabled ? 'default' : 'grab'} disabled={disabled} onClick={(event) => event.stopPropagation()}>⠿</IconButton>
        </HStack>
        {card.description && <Text color="fg.muted" mt={2} fontSize="sm">{card.description}</Text>}
        <IconButton id={editElementId(card.id)} type="button" aria-label={`Edit ${card.title}`} size="xs" variant="outline" mt={2} onClick={onEdit}>✎</IconButton>
        {burst > 0 && <Confetti key={burst} particleCount={24} />}
      </Box>
    </motion.div>
  )
}
