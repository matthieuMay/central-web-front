import { Box, Heading, Text } from '@chakra-ui/react'
import { useRef, useState, type FormEvent } from 'react'
import { useEditCard } from '../api/mutations'
import type { CardData } from '../types/board'

type CardProps = { 
  card: CardData 
  selected: boolean
  onSelect: () => void
}

export function Card({ card, selected,onSelect }: CardProps) {
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
    <Box as="article" bg="white" borderWidth="1px" borderRadius="md" p={4} overflowWrap="anywhere"
      cursor="pointer"
      onClick={() => onSelect?.()}
      aria-selected={selected}
      borderColor={selected ? 'blue.500' : 'transparent'}
    >
      <Heading as="h3" size="sm">{card.title}</Heading>
      {card.description && <Text color="gray.600" mt={2} fontSize="sm">{card.description}</Text>}
      {editing ? (
        <form onSubmit={submit} onClick={(event) => event.stopPropagation()}>
          <label htmlFor={`edit-card-${card.id}`}>Edit card title</label>
          <input id={`edit-card-${card.id}`} value={title} onChange={(event) => setTitle(event.target.value)} required autoFocus />
          <button type="submit" disabled={edit.isPending || !title.trim()}>Save</button>
          <button type="button" disabled={edit.isPending} onClick={() => { setEditing(false); edit.reset(); requestAnimationFrame(() => editButtonRef.current?.focus()) }}>Cancel</button>
          {edit.isPending && <p role="status">Saving card…</p>}
          {edit.isError && <p role="alert">Could not save card: {edit.error.message}</p>}
        </form>
      ) : (
        <button ref={editButtonRef} type="button" onClick={(event) => { event.stopPropagation(); setTitle(card.title); edit.reset(); setEditing(true) }}>Edit</button>
      )}
      {selected && (
        <>
          <button type="button" onClick={(event) => { event.stopPropagation(); }}>{'<'}</button>
          <button type="button" onClick={(event) => {event.stopPropagation()} }>{'>'}</button>
        </>
      )}
    </Box>
  )
}
