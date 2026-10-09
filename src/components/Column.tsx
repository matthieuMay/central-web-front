import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { useRef, useState, type FormEvent } from 'react'
import { useDrop } from 'react-dnd'
import { v7 as uuidv7 } from 'uuid'
import { useCreateCard } from '../api/mutations'
import type { ColumnData } from '../types/board'
import { Card } from './Card'
import type { MoveCardInput } from '../api/placement'
import type { CardDragItem, CardLanding, DragPosition } from './CardDragPreview'

type ColumnProps = {
  column: ColumnData
  selectedCardId: string | null
  onSelectCard: (id: string) => void
  onEditCard: (id: string) => void
  disabled: boolean
  onMoveCard: (input: MoveCardInput, origin?: DragPosition) => boolean
  onCancelDrag: (id: string, origin: DragPosition) => void
  landing: CardLanding | null
  arrivingCardId: string | null
  onArrival: (id: string) => boolean
}

export function Column({ column, selectedCardId, onSelectCard, onEditCard, disabled, onMoveCard, onCancelDrag, arrivingCardId, onArrival, landing }: ColumnProps) {
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const create = useCreateCard()
  const cardsRef = useRef<HTMLDivElement>(null)
  const [insertion, setInsertion] = useState<{ position: number; top: number } | null>(null)

  function locate(cardId: string, y: number) {
    const region = cardsRef.current
    if (!region) return null
    const cards = [...region.querySelectorAll<HTMLElement>('[data-card-id]')].filter((element) => element.dataset.cardId !== cardId)
    const position = cards.filter((element) => {
      const rect = element.getBoundingClientRect()
      return y >= rect.top + rect.height / 2
    }).length
    if (column.cards.findIndex((card) => card.id === cardId) === position) return null
    const next = cards[position]?.getBoundingClientRect()
    const previous = cards[position - 1]?.getBoundingClientRect()
    return { position, top: (next ? next.top - 6 : previous ? previous.bottom + 6 : region.getBoundingClientRect().top + 24) - region.getBoundingClientRect().top }
  }

  const [{ isOver, canDrop }, drop] = useDrop<CardDragItem, { moved: boolean }, { isOver: boolean; canDrop: boolean }>(() => ({
    accept: 'CARD',
    canDrop: () => !disabled,
    hover: (item, monitor) => {
      const point = monitor.getClientOffset()
      if (!monitor.canDrop() || !point) return
      const next = locate(item.cardId, point.y)
      setInsertion((current) => current?.position === next?.position && current?.top === next?.top ? current : next)
    },
    drop: (item, monitor) => {
      const point = monitor.getClientOffset()
      const target = point && locate(item.cardId, point.y)
      const source = monitor.getSourceClientOffset()
      const origin = source ? { x: source.x + item.offset.x, y: source.y + item.offset.y } : undefined
      return { moved: !!target && onMoveCard({ cardId: item.cardId, column: column.id, position: target.position }, origin) }
    },
    collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }), canDrop: monitor.canDrop() }),
  }), [column, disabled, onMoveCard])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || create.isPending) return
    create.mutate({ columnId: column.id, id: uuidv7(), title: trimmed }, {
      onSuccess: () => {
        setTitle('')
        inputRef.current?.focus()
      },
    })
  }

  return (
    <Box as="section" aria-label={column.title} bg="bg.muted" borderRadius="lg" p={4} minW={0} minH={{ base: 'auto', xl: 'calc(100dvh - 12rem)' }}>
      <Heading as="h2" size="md" mb={4}>{column.title}</Heading>
      <Stack gap={3}>
      <Stack ref={(node) => { cardsRef.current = node; drop(node) }} role="group" aria-label={`Cards in ${column.title}`} gap={3} minH="6rem" position="relative" borderRadius="md" outline={isOver && canDrop ? '2px dashed' : undefined} outlineColor="border.info" outlineOffset="8px" pb={3}>
        {column.cards.length === 0 && <Text color="fg.muted" p={4}>Drop a card here</Text>}
        {column.cards.map((card) => (
          <Card key={card.id} card={card} selected={card.id === selectedCardId} onSelect={() => onSelectCard(card.id)} onEdit={() => onEditCard(card.id)} disabled={disabled} arriving={card.id === arrivingCardId} onArrival={() => onArrival(card.id)} onCancelDrag={onCancelDrag} dropOrigin={landing?.cardId === card.id ? landing.origin : null} returning={landing?.cardId === card.id ? landing.returning : undefined} />
        ))}
        {isOver && canDrop && insertion && <Box aria-hidden="true" data-drop-indicator="" position="absolute" top={`${insertion.top}px`} insetInline={0} height="3px" bg="border.info" borderRadius="full" pointerEvents="none" zIndex={2} boxShadow="0 0 12px var(--chakra-colors-border-info)" />}
      </Stack>
        <form onSubmit={submit}>
          <label htmlFor={`new-card-${column.id}`}>New card title in {column.title}</label>
          <input ref={inputRef} id={`new-card-${column.id}`} value={title} onChange={(event) => setTitle(event.target.value)} required />
          <button type="submit" disabled={create.isPending || !title.trim()}>Add card</button>
          {create.isPending && <p role="status">Adding card…</p>}
          {create.isError && <p role="alert">Could not add card: {create.error.message}</p>}
        </form>
      </Stack>
    </Box>
  )
}
