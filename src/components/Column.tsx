import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { useRef, useState, type FormEvent } from 'react'
import { useDrop } from 'react-dnd'
import { v7 as uuidv7 } from 'uuid'
import { useCreateCard } from '../api/mutations'
import type { CardLabel, ColumnData, UserData } from '../types/board'
import type { UpdateCardCollectionsInput } from '../api/mutations'
import { cardDragType, Card, type CardDragItem } from './Card'

type ColumnProps = {
  column: ColumnData
  users: UserData[]
  selectedCardId: string | null
  onSelectCard: (id: string) => void
  onEditCard: (id: string) => void
  onMoveCard: (cardId: string, columnId: string, position: number) => void
  isLastColumn: boolean
  onSortColumn: (columnId: string) => void
  onChangeLabel: (cardId: string, label: CardLabel) => void
  celebrationCardId: string | null
  celebrationKey: number
  onUpdateCollections: (input: UpdateCardCollectionsInput) => Promise<unknown>
  collectionsPending: boolean
  visibleLabels: Set<CardLabel>
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
export function Column({ column, users, selectedCardId, onSelectCard, onEditCard, onMoveCard, isLastColumn, onSortColumn, onChangeLabel, celebrationCardId, celebrationKey, onUpdateCollections, collectionsPending, visibleLabels }: ColumnProps) {
  const [title, setTitle] = useState('')
  const [label, setLabel] = useState<CardLabel | ''>('')
  const [dragPosition, setDragPosition] = useState<number | null>(null)
  const columnRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const create = useCreateCard()

  function getDropPosition(clientY: number) {
    const cards = columnRef.current?.querySelectorAll<HTMLElement>('.board-card')
    if (!cards) return column.cards.length
    const position = Array.from(cards).findIndex((card) => {
      const bounds = card.getBoundingClientRect()
      return clientY < bounds.top + bounds.height / 2
    })
    return position === -1 ? column.cards.length : position
  }

  const [, drop] = useDrop<CardDragItem>(() => ({
    accept: cardDragType,
    hover: (_item, monitor) => {
      if (!monitor.isOver({ shallow: true })) return
      const point = monitor.getClientOffset()
      setDragPosition(point ? getDropPosition(point.y) : column.cards.length)
    },
    drop: (item, monitor) => {
      if (monitor.didDrop()) return
      const point = monitor.getClientOffset()
      onMoveCard(item.cardId, column.id, point ? getDropPosition(point.y) : column.cards.length)
      setDragPosition(null)
      return { dropped: true }
    },
    collect: (monitor) => {
      if (!monitor.isOver()) setDragPosition(null)
      return {}
    },
  }), [column.cards.length, column.id, onMoveCard])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || create.isPending) return
    create.mutate({ columnId: column.id, id: uuidv7(), title: trimmed, ...(label ? { label } : {}) }, {
      onSuccess: () => {
        setTitle('')
        setLabel('')
        inputRef.current?.focus()
      },
    })
  }

  return (
    <Box ref={(node: HTMLDivElement | null) => { columnRef.current = node; drop(node) }} as="section" aria-label={column.title} bg="bg.muted" borderRadius="lg" p={4} minW={0} minH={{ base: 'auto', xl: 'calc(100dvh - 12rem)' }}>
      <Heading as="h2" size="md" mb={4}>
        {column.title}
        <button type="button" className="column-sort-button" aria-label={`Sort ${column.title} by label priority`} onClick={() => onSortColumn(column.id)}>↑</button>
      </Heading>
      <Stack gap={3}>
        {column.cards.length === 0 && dragPosition !== 0 && <Text color="fg.muted">No cards yet</Text>}
        {column.cards.filter((card) => !card.label || visibleLabels.has(card.label)).map((card, index) => (
          <div key={card.id}>
            {dragPosition === index && <div className="card-drop-shadow" aria-hidden="true" />}
            <Card card={card} columnId={column.id} users={users} selected={card.id === selectedCardId} onSelect={() => onSelectCard(card.id)} onEdit={() => onEditCard(card.id)}
              celebrationKey={isLastColumn && celebrationCardId === card.id ? celebrationKey : 0}
              showLabel
              onChangeLabel={onChangeLabel}
              onUpdateCollections={onUpdateCollections} collectionsPending={collectionsPending}
              onDragOver={(offset) => setDragPosition(offset === null ? null : index + offset)}
              onDrop={(item, offset) => onMoveCard(item.cardId, column.id, index + offset)} />
          </div>
        ))}
        {dragPosition === column.cards.length && <div className="card-drop-shadow" aria-hidden="true" />}
        <form onSubmit={submit}>
          <label htmlFor={`new-card-${column.id}`}>New card title in {column.title}</label>
          <input ref={inputRef} id={`new-card-${column.id}`} value={title} onChange={(event) => setTitle(event.target.value)} required />
          <label htmlFor={`new-label-${column.id}`}>Label</label>
          <select id={`new-label-${column.id}`} value={label} onChange={(event) => setLabel(event.target.value as CardLabel | '')}>
            <option value="">No label</option>
            <option value="urgent">Urgent</option>
            <option value="documentation">Documentation</option>
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
          </select>
          <button type="submit" disabled={create.isPending || !title.trim()}>Add card</button>
          {create.isPending && <p role="status">Adding card…</p>}
          {create.isError && <p role="alert">Could not add card: {create.error.message}</p>}
        </form>
      </Stack>
    </Box>
  )
}
