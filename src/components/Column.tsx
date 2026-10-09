import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { useRef, useState, type FormEvent } from 'react'
import { useDrop, type XYCoord } from 'react-dnd'
import { v7 as uuidv7 } from 'uuid'
import { useCreateCard } from '../api/mutations'
import type { ColumnData } from '../types/board'
import { Card } from './Card'
import { CARD_DRAG_TYPE, type CardDragItem, type DropPoint } from './cardDrag'

type ColumnProps = {
  column: ColumnData
  selectedCardId: string | null
  dragDisabled: boolean
  onSelectCard: (id: string) => void
  onEditCard: (id: string) => void
  onDropCard: (cardId: string, columnId: string, slot: number, point: DropPoint) => void
}

type DropLine = { slot: number; top: number }

// Half of the Stack's gap, so the line sits between two cards.
const LINE_OFFSET = 6

export function Column({ column, selectedCardId, dragDisabled, onSelectCard, onEditCard, onDropCard }: ColumnProps) {
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [line, setLine] = useState<DropLine | null>(null)
  const create = useCreateCard()

  // The slot is the number of cards whose vertical middle is above the pointer.
  function dropLine(pointer: XYCoord | null): DropLine | null {
    const section = sectionRef.current?.getBoundingClientRect()
    const list = listRef.current
    if (!pointer || !section || !list) return null
    const rects = [...list.querySelectorAll('.board-card')].map((node) => node.getBoundingClientRect())
    const slot = rects.filter((rect) => rect.top + rect.height / 2 < pointer.y).length
    const top = slot < rects.length ? rects[slot].top - LINE_OFFSET
      : rects.length ? rects[rects.length - 1].bottom + LINE_OFFSET
      : list.getBoundingClientRect().top
    return { slot, top: top - section.top }
  }

  // A drop that would leave the card where it is shows no line.
  function isNoop(item: CardDragItem, slot: number) {
    const index = column.cards.findIndex((card) => card.id === item.id)
    return index >= 0 && (slot === index || slot === index + 1)
  }

  const [{ isOver }, drop] = useDrop<CardDragItem, void, { isOver: boolean }>(() => ({
    accept: CARD_DRAG_TYPE,
    hover: (item, monitor) => {
      const next = dropLine(monitor.getClientOffset())
      const shown = next && !isNoop(item, next.slot) ? next : null
      setLine((current) => current?.slot === shown?.slot && current?.top === shown?.top ? current : shown)
    },
    drop: (item, monitor) => {
      const target = dropLine(monitor.getClientOffset())
      const section = sectionRef.current?.getBoundingClientRect()
      if (target && section)
        onDropCard(item.id, column.id, target.slot, { x: section.left + section.width / 2, y: section.top + target.top })
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }), [column, onDropCard])

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
    <Box
      as="section" aria-label={column.title} bg="bg.muted" borderRadius="lg" p={4} minW={0} minH={{ base: 'auto', xl: 'calc(100dvh - 12rem)' }}
      position="relative" outline={isOver ? '2px dashed' : undefined} outlineColor="border.info"
      ref={(node: HTMLElement | null) => { sectionRef.current = node; drop(node) }}
    >
      <Heading as="h2" size="md" mb={4}>{column.title}</Heading>
      {isOver && line && (
        <Box aria-hidden position="absolute" left={4} right={4} top={`${line.top}px`} h="2px" mt="-1px" bg="border.info" borderRadius="full" pointerEvents="none" />
      )}
      <Stack gap={3} ref={listRef}>
        {column.cards.length === 0 && <Text color="fg.muted">Aucune carte</Text>}
        {column.cards.map((card) => (
          <Card key={card.id} card={card} selected={card.id === selectedCardId} dragDisabled={dragDisabled} onSelect={() => onSelectCard(card.id)} onEdit={() => onEditCard(card.id)} />
        ))}
        <form onSubmit={submit}>
          <label htmlFor={`new-card-${column.id}`}>Titre de la nouvelle carte dans {column.title}</label>
          <input ref={inputRef} id={`new-card-${column.id}`} value={title} onChange={(event) => setTitle(event.target.value)} required />
          <button type="submit" disabled={create.isPending || !title.trim()}>Ajouter une carte</button>
          {create.isPending && <p role="status">Ajout de la carte…</p>}
          {create.isError && <p role="alert">Impossible d’ajouter la carte : {create.error.message}</p>}
        </form>
      </Stack>
    </Box>
  )
}
