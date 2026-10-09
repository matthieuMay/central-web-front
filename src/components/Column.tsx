import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { useDrop } from 'react-dnd'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { v7 as uuidv7 } from 'uuid'
import { useCreateCard } from '../api/mutations'
import type { ColumnData } from '../types/board'
import { Card } from './Card'

type ColumnProps = {
  column: ColumnData
  selectedCardId: string | null
  onSelectCard: (id: string) => void
  onEditCard: (id: string) => void
  onMoveCard: (cardId: string, columnId: string, position: number) => void
}

export function Column({ column, selectedCardId, onSelectCard, onEditCard, onMoveCard }: ColumnProps) {
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const create = useCreateCard()
  const [insertionPosition, setInsertionPosition] = useState<number | null>(null)
  const stackRef = useRef<HTMLDivElement>(null)
  function getInsertionPosition(clientY: number, cardId: string) {
    const cards = [...(stackRef.current?.querySelectorAll<HTMLElement>('.board-card') ?? [])]
      .filter((element) => element.id !== `board-card-${cardId}`)
    const position = cards.findIndex((element) => clientY < element.getBoundingClientRect().top + element.getBoundingClientRect().height / 2)
    return position < 0 ? cards.length : position
  }
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'card',
    hover: (item: { cardId: string }, monitor) => {
      const point = monitor.getClientOffset()
      if (point) setInsertionPosition(getInsertionPosition(point.y, item.cardId))
    },
    drop: (item: { cardId: string }, monitor) => {
      if (monitor.didDrop()) return
      const point = monitor.getClientOffset()
      setInsertionPosition(null)
      if (point) onMoveCard(item.cardId, column.id, getInsertionPosition(point.y, item.cardId))
    },
    collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }) }),
  }), [column.id, column.cards.length, onMoveCard])
  useEffect(() => {
    if (!isOver) setInsertionPosition(null)
  }, [isOver])

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
      <Stack ref={(node) => { stackRef.current = node; drop(node) }} gap={3}>
        {column.cards.length === 0 && <Text color="fg.muted">No cards yet</Text>}
        {column.cards.map((card, index) => (
          <div key={card.id}>
            {insertionPosition === index && <Box height="5rem" border="2px dashed" borderColor="border.info" borderRadius="md" />}
            <Card card={card} selected={card.id === selectedCardId} onSelect={() => onSelectCard(card.id)} onEdit={() => onEditCard(card.id)} />
          </div>
        ))}
        {insertionPosition === column.cards.length && <Box height="5rem" border="2px dashed" borderColor="border.info" borderRadius="md" />}
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
