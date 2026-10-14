import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { Fragment, useRef, useState, type DragEvent, type FormEvent } from 'react'
import { v7 as uuidv7 } from 'uuid'
import { useCreateCard } from '../api/mutations'
import type { ColumnData } from '../types/board'
import { Card } from './Card'

// The card being dragged and its height (the placeholder gets the same height).
export type DraggedCard = { cardId: string; height: number }
// Where the card would land: a column and the index of the card it would sit before.
export type DropTarget = { columnId: string; index: number }

// Everything a column needs to take part in drag and drop. The board page owns the state.
export type DragProps = {
  canDrag: boolean
  dragged: DraggedCard | null
  dropTarget: DropTarget | null
  onStart: (cardId: string, height: number) => void
  // Returns true when the dragged card may be dropped in this column.
  onOver: (columnId: string, index: number) => boolean
  onLeave: (columnId: string) => void
  onDrop: () => void
  onEnd: () => void
}

type ColumnProps = {
  column: ColumnData
  selectedCardId: string | null
  onSelectCard: (id: string) => void
  onEditCard: (id: string) => void
  drag: DragProps
}

// The dragged card goes before the first card whose middle is below the pointer, otherwise at the end.
function indexUnderPointer(section: HTMLElement, pointerY: number) {
  const cards = [...section.querySelectorAll('.board-card')]
  const index = cards.findIndex((card) => {
    const box = card.getBoundingClientRect()
    return pointerY < box.top + box.height / 2
  })
  return index === -1 ? cards.length : index
}

function DropPlaceholder({ height }: { height: number }) {
  return <Box aria-hidden="true" h={`${height}px`} borderWidth="2px" borderStyle="dashed" borderColor="blue.fg" bg="blue.subtle" borderRadius="md" />
}

export function Column({ column, selectedCardId, onSelectCard, onEditCard, drag }: ColumnProps) {
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const create = useCreateCard()
  const placeholderIndex = drag.dropTarget?.columnId === column.id ? drag.dropTarget.index : null
  const placeholder = drag.dragged && <DropPlaceholder height={drag.dragged.height} />

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

  function dragOver(event: DragEvent<HTMLElement>) {
    if (!drag.dragged) return
    // preventDefault lets us choose the cursor: "move" where the card may be dropped,
    // "none" (not-allowed cursor, and no drop event) everywhere else.
    event.preventDefault()
    const allowed = drag.onOver(column.id, indexUnderPointer(event.currentTarget, event.clientY))
    event.dataTransfer.dropEffect = allowed ? 'move' : 'none'
  }

  function dragLeave(event: DragEvent<HTMLElement>) {
    // dragleave also fires when moving between elements inside the column:
    // only react when the pointer is really outside the column's box.
    const box = event.currentTarget.getBoundingClientRect()
    const outside = event.clientX < box.left || event.clientX >= box.right || event.clientY < box.top || event.clientY >= box.bottom
    if (outside) drag.onLeave(column.id)
  }

  function drop(event: DragEvent<HTMLElement>) {
    // Also stops the browser from pasting the card id into the Add card field.
    event.preventDefault()
    drag.onDrop()
  }

  return (
    <Box
      as="section" aria-label={column.title} bg="bg.muted" borderRadius="lg" p={4} minW={0} minH={{ base: 'auto', xl: 'calc(100dvh - 12rem)' }}
      onDragOver={dragOver} onDragLeave={dragLeave} onDrop={drop}
    >
    {/* Sprint 6: show the number of Cards next to the title, for example "Doing · 3". */}
      <Heading as="h2" size="md" mb={4}>{column.title}</Heading>
      <Stack gap={3}>
        {column.cards.length === 0 && placeholderIndex === null && <Text color="fg.muted">No cards yet</Text>}
        {column.cards.map((card, index) => (
          <Fragment key={card.id}>
            {placeholderIndex === index && placeholder}
            <Card
              card={card} selected={card.id === selectedCardId} onSelect={() => onSelectCard(card.id)} onEdit={() => onEditCard(card.id)}
              canDrag={drag.canDrag} dragging={card.id === drag.dragged?.cardId}
              onDragStart={(height) => drag.onStart(card.id, height)} onDragEnd={drag.onEnd}
            />
          </Fragment>
        ))}
        {placeholderIndex === column.cards.length && placeholder}
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
