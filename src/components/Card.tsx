import { Box, Heading, Text } from '@chakra-ui/react'
import { useRef, useState, type FormEvent } from 'react'
import { useEditCard } from '../api/mutations'
import type { CardData } from '../types/board'

type CardProps = { 
  card: CardData 
  selected: boolean
  onSelect: () => void
  onMoveCard: (direction: -1 | 1) => boolean
  canMoveLeft: boolean
  canMoveRight: boolean
  isMoving: boolean
}

export function Card({ card, selected, onSelect, onMoveCard, canMoveLeft, canMoveRight, isMoving }: CardProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(card.title)
  const cardRef = useRef<HTMLElement>(null)
  const editButtonRef = useRef<HTMLButtonElement>(null)
  const edit = useEditCard()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || edit.isPending) return
    edit.mutate({ cardId: card.id, title: trimmed }, {
      onSuccess: () => {
        setEditing(false)
        requestAnimationFrame(() => cardRef.current?.focus())
      },
    })
  }
  return (
    <Box
      id={`card-${card.id}`}
      as="article"
      ref={cardRef}
      tabIndex={0}
      bg={selected ? 'blue.50' : 'white'}
      borderWidth="2px"
      borderColor={selected ? 'blue.500' : 'transparent'}
      borderRadius="md"
      p={4}
      overflowWrap="anywhere"
      cursor="pointer"
      onClick={(event) => {
        if (event.target instanceof Element && event.target.closest('button, input, textarea, select, form, [contenteditable="true"]')) return
        onSelect()
      }}
      aria-selected={selected}
    >
      <Heading as="h3" size="sm">{card.title}</Heading>
      {card.description && <Text color="gray.600" mt={2} fontSize="sm">{card.description}</Text>}
      {editing ? (
        <form onSubmit={submit} onClick={(event) => event.stopPropagation()}>
          <label htmlFor={`edit-card-${card.id}`}>Edit card title</label>
          <input id={`edit-card-${card.id}`} value={title} onChange={(event) => setTitle(event.target.value)} required autoFocus />
          <button type="submit" disabled={edit.isPending || !title.trim()}>Save</button>
          <button type="button" disabled={edit.isPending} onClick={() => { setEditing(false); edit.reset(); requestAnimationFrame(() => cardRef.current?.focus()) }}>Cancel</button>
          {edit.isPending && <p role="status">Saving card…</p>}
          {edit.isError && <p role="alert">Could not save card: {edit.error.message}</p>}
        </form>
      ) : (
        <button ref={editButtonRef} type="button" onClick={(event) => { event.stopPropagation(); setTitle(card.title); edit.reset(); setEditing(true) }}>Edit</button>
      )}
      {selected && (
        <>
          <button type="button" disabled={!canMoveLeft || isMoving} aria-label="Move card left" onClick={(event) => { event.stopPropagation(); onMoveCard(-1) }}>{'<'}</button>
          <button type="button" disabled={!canMoveRight || isMoving} aria-label="Move card right" onClick={(event) => { event.stopPropagation(); onMoveCard(1) }}>{'>'}</button>
        </>
      )}
    </Box>
  )
}
