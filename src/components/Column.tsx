import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { useDrop } from 'react-dnd'
import { useRef, useState, type FormEvent } from 'react'
import { v7 as uuidv7 } from 'uuid'
import { useCreateCard } from '../api/mutations'
import type { ColumnData } from '../types/board'
import { Card, type DragCard } from './Card'

type ColumnProps = {
  column: ColumnData
  columns: ColumnData[]
  selectedCardId: string | null
  onSelectCard: (id: string) => void
  onEditCard: (id: string) => void
  confettiCardId: string | null
  onDropCard: (item: DragCard, columnId: string, position: number) => void
}

export function Column({ column, columns, selectedCardId, onSelectCard, onEditCard, confettiCardId, onDropCard }: ColumnProps) {
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const create = useCreateCard()
  const [, drop] = useDrop<DragCard>(() => ({
    accept: 'card',
    drop: (item, monitor) => {
      if (!monitor.didDrop()) onDropCard(item, column.id, column.cards.length)
    },
  }), [column.id, column.cards.length, onDropCard])

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
        {column.cards.length === 0 && <Text color="fg.muted" className="empty-column-drop-zone">Drop a card here</Text>}
        {column.cards.map((card) => (
          <Card key={card.id} card={card} columnId={column.id} columns={columns} cardIndex={column.cards.indexOf(card)} selected={card.id === selectedCardId} confetti={card.id === confettiCardId} onSelect={() => onSelectCard(card.id)} onEdit={() => onEditCard(card.id)} onDropCard={onDropCard} />
        ))}
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
