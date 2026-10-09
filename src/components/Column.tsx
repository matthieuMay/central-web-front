import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { useRef, useState, type FormEvent } from 'react'
import { useDrop } from 'react-dnd'
import { v7 as uuidv7 } from 'uuid'
import { useCreateCard } from '../api/mutations'
import type { ColumnData } from '../types/board'
import { cardDragType, Card, type CardDragItem } from './Card'

type ColumnProps = {
  column: ColumnData
  selectedCardId: string | null
  onSelectCard: (id: string) => void
  onEditCard: (id: string) => void
  onMoveCard: (cardId: string, columnId: string, position: number) => void
}

// Responsibility: render one Column's ordered cards, drop placeholder, and
// new-card form. Props provide column data, selection state, and callbacks;
// the board/page owns card selection, editing, and movement.
// Actions: the create mutation persists a new card, while card selection,
// editing, and drops delegate to the parent callbacks.
// Needs: the card workflow must support associating and removing people
// supplied by the API, and creating checklist tasks that can be checked and
// unchecked.
// Correctness: cards remain in column order, the placeholder marks the target
// slot, empty columns accept drops, and invalid empty submissions do nothing.
export function Column({ column, selectedCardId, onSelectCard, onEditCard, onMoveCard }: ColumnProps) {
  const [title, setTitle] = useState('')
  const [dragPosition, setDragPosition] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const create = useCreateCard()
  const [, drop] = useDrop<CardDragItem>(() => ({
    accept: cardDragType,
    hover: (_item, monitor) => {
      if (monitor.isOver({ shallow: true })) setDragPosition(column.cards.length)
    },
    drop: (item, monitor) => {
      if (monitor.didDrop()) return
      onMoveCard(item.cardId, column.id, column.cards.length)
      setDragPosition(null)
      return { dropped: true }
    },
    collect: (monitor) => {
      if (!monitor.isOver({ shallow: true })) setDragPosition(null)
      return {}
    },
  }), [column.cards.length, column.id, onMoveCard])

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
    <Box ref={drop} as="section" aria-label={column.title} bg="bg.muted" borderRadius="lg" p={4} minW={0} minH={{ base: 'auto', xl: 'calc(100dvh - 12rem)' }}>
      <Heading as="h2" size="md" mb={4}>{column.title}</Heading>
      <Stack gap={3}>
        {column.cards.length === 0 && <Text color="fg.muted">No cards yet</Text>}
        {column.cards.map((card, index) => (
          <div key={card.id}>
            {dragPosition === index && <div className="card-drop-shadow" aria-hidden="true" />}
            <Card card={card} columnId={column.id} selected={card.id === selectedCardId} onSelect={() => onSelectCard(card.id)} onEdit={() => onEditCard(card.id)}
              onDragOver={(offset) => setDragPosition(offset === null ? null : index + offset)}
              onDrop={(item, offset) => onMoveCard(item.cardId, column.id, index + offset)} />
          </div>
        ))}
        {dragPosition === column.cards.length && <div className="card-drop-shadow" aria-hidden="true" />}
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
