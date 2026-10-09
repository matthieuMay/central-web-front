import { Box, Heading, Stack } from '@chakra-ui/react'
import { Fragment, useRef, useState, type FormEvent } from 'react'
import { useDrop } from 'react-dnd'
import { v7 as uuidv7 } from 'uuid'
import { useCreateCard } from '../api/mutations'
import type { ColumnData } from '../types/board'
import { Card } from './Card'
import { CARD, type DraggedCard } from './cardIds'

type ColumnProps = {
  column: ColumnData
  selectedCardId: string | null
  onSelectCard: (id: string) => void
  onEditCard: (id: string) => void
  onDropCard: (cardId: string, columnId: string, index: number) => void
}

export function Column({ column, selectedCardId, onSelectCard, onEditCard, onDropCard }: ColumnProps) {
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const sectionRef = useRef<HTMLElement | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const create = useCreateCard()

  // Insertion index among the rendered cards (the dragged one included):
  // the number of cards whose vertical middle is above the pointer.
  function indexAt(y: number | undefined) {
    const cards = sectionRef.current?.querySelectorAll('.board-card') ?? []
    if (y === undefined) return cards.length
    return Array.from(cards).filter((card) => {
      const rect = card.getBoundingClientRect()
      return rect.top + rect.height / 2 < y
    }).length
  }

  const [{ isOver }, drop] = useDrop<DraggedCard, void, { isOver: boolean }>({
    accept: CARD,
    hover: (_item, monitor) => setDropIndex(indexAt(monitor.getClientOffset()?.y)),
    drop: (item, monitor) => {
      onDropCard(item.id, column.id, indexAt(monitor.getClientOffset()?.y))
      setDropIndex(null)
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }, [column.id, onDropCard])

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

  const indicator = <div aria-hidden className="drop-indicator" />
  const shownIndex = isOver ? dropIndex : null

  return (
    <Box
      ref={(node: HTMLElement | null) => { sectionRef.current = node; drop(node) }}
      as="section" aria-label={column.title} className="column glass" data-column={column.id} data-over={isOver || undefined} p={4} pt={5} minW={0}
      minH={{ base: 'auto', xl: 'calc(100dvh - 12rem)' }}
    >
      <div className="column-header">
        <span className="column-dot" aria-hidden />
        <Heading as="h2" size="md">{column.title}</Heading>
        <span className="column-count">{column.cards.length}</span>
      </div>
      <Stack gap={3}>
        {column.cards.length === 0 && <div className="column-empty">{isOver ? 'Drop here' : 'No cards yet'}</div>}
        {column.cards.map((card, index) => (
          <Fragment key={card.id}>
            {shownIndex === index && indicator}
            <Card card={card} selected={card.id === selectedCardId} onSelect={() => onSelectCard(card.id)} onEdit={() => onEditCard(card.id)} />
          </Fragment>
        ))}
        {shownIndex === column.cards.length && column.cards.length > 0 && indicator}
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
