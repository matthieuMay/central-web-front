import { Box, Heading, Text } from '@chakra-ui/react'
import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react'
import { useEditCard } from '../api/mutations'
import type { CardData } from '../types/board'

type CardProps = {
  card: CardData
  selected: boolean
  onSelect: () => void
}

export function Card({ card, selected, onSelect }: CardProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(card.title)
  const editButtonRef = useRef<HTMLButtonElement>(null)
  const cardRef = useRef<HTMLElement>(null)
  const edit = useEditCard()

  // Quand la Carte devient sélectionnée, on lui donne le focus.
  // Cela marche aussi après un déplacement : la Carte réapparaît
  // dans sa nouvelle Colonne, toujours sélectionnée, et reprend le focus.
  useEffect(() => {
    if (selected) {
      cardRef.current?.focus()
    }
  }, [selected])

  function handleClick(event: MouseEvent<HTMLElement>) {
    const clickedElement = event.target as HTMLElement
    // Pas de sélection involontaire :
    // pendant l'édition, ou quand on clique sur un bouton (Edit, Save, Cancel).
    if (editing) return
    if (clickedElement.tagName === 'BUTTON') return
    onSelect()
  }

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
      ref={cardRef}
      tabIndex={-1}
      onClick={handleClick}
      cursor="pointer"
      bg={selected ? 'blue.50' : 'white'}
      borderColor={selected ? 'blue.600' : 'gray.200'}
      borderWidth={selected ? '2px' : '1px'}
      borderRadius="md"
      p={4}
      overflowWrap="anywhere"
    >
      <Heading as="h3" size="sm">{card.title}</Heading>
      {card.description && <Text color="gray.600" mt={2} fontSize="sm">{card.description}</Text>}
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