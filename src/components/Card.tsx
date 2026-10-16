import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { useRef, useState, type FormEvent } from 'react'
import { useEditCard } from '../api/mutations'
import type { CardData } from '../types/board'

type CardProps = {
  card: CardData
  selected: boolean
  onSelect: () => void
  onMoveLeft: () => void
  onMoveRight: () => void
  canMoveLeft: boolean
  canMoveRight: boolean
  movePending: boolean
}

export function Card({
  card, selected, onSelect, onMoveLeft, onMoveRight,
  canMoveLeft, canMoveRight, movePending,
}: CardProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(card.title)
  const editButtonRef = useRef<HTMLButtonElement>(null)
  const edit = useEditCard()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || edit.isPending) return
    edit.mutate({ cardId: card.id, title: trimmed }, {
      onSuccess: () => {
        setEditing(false)
        requestAnimationFrame(() => editButtonRef.current?.focus())
      },
    })
  }

  return (
    <Box
      as="article"
      bg="white"
      borderWidth={selected ? '2px' : '1px'}
      borderColor={selected ? 'blue.500' : 'gray.200'}
      borderRadius="md"
      p={4}
      overflowWrap="anywhere"
      tabIndex={0}
      onClick={(event) => {
        if (!(event.target instanceof HTMLElement) || !event.target.closest('button, input, textarea, select')) onSelect()
      }}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          onSelect()
        }
      }}
      aria-label={`${card.title}${selected ? ', selected' : ''}`}
    >
      <Heading as="h3" size="sm">{card.title}</Heading>
      {card.description && <Text color="gray.600" mt={2} fontSize="sm">{card.description}</Text>}
      {selected && (
        <Stack direction="row" gap={2} mt={3}>
          <button type="button" disabled={!canMoveLeft || movePending} onClick={onMoveLeft}>Move left</button>
          <button type="button" disabled={!canMoveRight || movePending} onClick={onMoveRight}>Move right</button>
        </Stack>
      )}
      {editing ? (
        <form onSubmit={submit}>
          <label htmlFor={`edit-card-${card.id}`}>Edit card title</label>
          <input id={`edit-card-${card.id}`} value={title} onChange={(event) => setTitle(event.target.value)} required autoFocus />
          <button type="submit" disabled={edit.isPending || !title.trim()}>Save</button>
          <button type="button" disabled={edit.isPending} onClick={() => { setEditing(false); edit.reset(); requestAnimationFrame(() => editButtonRef.current?.focus()) }}>Cancel</button>
          {edit.isPending && <p role="status">Saving card…</p>}
          {edit.isError && <p role="alert">Could not save card: {edit.error.message}</p>}
        </form>
      ) : (
        <button ref={editButtonRef} type="button" onClick={() => { setTitle(card.title); edit.reset(); setEditing(true) }}>Edit</button>
      )}
    </Box>
  )
}
