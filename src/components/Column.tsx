import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { useRef, useState, type FormEvent } from 'react'
import { useDrop } from 'react-dnd'
import { v7 as uuidv7 } from 'uuid'
import { useCreateCard } from '../api/mutations'
import type { ColumnData } from '../types/board'
import { Card } from './Card'

type ColumnProps = {
  column: ColumnData
  selectedCardId: string | null
  onSelectCard: (id: string) => void
  onEditCard: (id: string) => void
  moving: boolean
  celebrationCardId: string | null
  celebrationToken: number
  onMoveCard: (cardId: string, columnId: string, position: number, sourceColumnId: string) => void
  onChecklistChange: (cardId: string, items: ColumnData['cards'][number]['checklistItems']) => void
  checklistDisabled: boolean
}

type DragItem = { cardId: string; sourceColumnId: string; sourcePosition: number }

function DropSlot({ columnId, position, moving, empty, onMoveCard }: {
  columnId: string
  position: number
  moving: boolean
  empty: boolean
  onMoveCard: ColumnProps['onMoveCard']
}) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'CARD',
    canDrop: (item: DragItem) => !moving && !(item.sourceColumnId === columnId && item.sourcePosition === position),
    drop: (item: DragItem, monitor) => {
      if (monitor.didDrop()) return
      const targetPosition = item.sourceColumnId === columnId && item.sourcePosition < position ? position - 1 : position
      onMoveCard(item.cardId, columnId, targetPosition, item.sourceColumnId)
    },
    collect: (monitor) => ({ isOver: monitor.isOver(), canDrop: monitor.canDrop() }),
  }), [columnId, position, moving, onMoveCard])

  return (
    <Box
      ref={drop}
      aria-hidden
      minH={empty ? '4rem' : '2.5rem'}
      display="flex"
      alignItems="center"
      justifyContent="center"
      data-drop-position={position}
    >
      <Box
        aria-hidden
        width="100%"
        height="0.75rem"
        borderRadius="sm"
        bg={isOver && canDrop ? 'blue.500' : 'transparent'}
        transition="background-color 120ms ease"
      />
    </Box>
  )
}

export function Column({ column, selectedCardId, onSelectCard, onEditCard, moving, celebrationCardId, celebrationToken, onMoveCard, onChecklistChange, checklistDisabled }: ColumnProps) {
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const create = useCreateCard()
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'CARD',
    canDrop: () => !moving,
    drop: (item: DragItem, monitor) => {
      if (monitor.didDrop()) return
      const position = item.sourceColumnId === column.id ? Math.max(0, column.cards.length - 1) : column.cards.length
      onMoveCard(item.cardId, column.id, position, item.sourceColumnId)
    },
    collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }) }),
  }), [column.id, column.cards.length, moving, onMoveCard])

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
    <Box ref={drop} as="section" aria-label={column.title} bg={isOver ? 'bg.info' : 'bg.muted'} borderRadius="lg" p={4} minW={0} minH={{ base: 'auto', xl: 'calc(100dvh - 12rem)' }}>
      <Heading as="h2" size="md" mb={4}>{column.title}</Heading>
      <Stack gap={3}>
        {column.cards.length === 0 && <Text color="fg.muted">No cards yet</Text>}
        <DropSlot columnId={column.id} position={0} moving={moving} empty={column.cards.length === 0} onMoveCard={onMoveCard} />
        {column.cards.map((card, index) => (
          <div key={card.id}>
            <Card
              columnId={column.id}
              position={index}
              card={card}
              selected={card.id === selectedCardId}
              disabled={moving}
              celebrationToken={card.id === celebrationCardId ? celebrationToken : null}
              onSelect={() => onSelectCard(card.id)}
              onEdit={() => onEditCard(card.id)}
              onChecklistChange={(items) => onChecklistChange(card.id, items)}
              checklistDisabled={checklistDisabled}
            />
            <DropSlot columnId={column.id} position={index + 1} moving={moving} empty={false} onMoveCard={onMoveCard} />
          </div>
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
