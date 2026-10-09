import { Box, Heading, Text } from '@chakra-ui/react'
import { useRef, useState, type FormEvent } from 'react'
import { useEditCard } from '../api/mutations'
import type { CardData } from '../types/board'

type CardProps = {
  card: CardData
  isSelected?: boolean
  onSelect?: () => void
  canMoveLeft?: boolean
  canMoveRight?: boolean
  onMoveLeft?: () => void
  onMoveRight?: () => void
  isMoving?: boolean
}

export function Card({
  card,
  isSelected = false,
  onSelect,
  canMoveLeft = false,
  canMoveRight = false,
  onMoveLeft,
  onMoveRight,
  isMoving = false,
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
      bg={isSelected ? 'blue.50' : 'white'}
      borderWidth={isSelected ? '2px' : '1px'}
      borderColor={isSelected ? 'blue.500' : 'gray.200'}
      borderRadius="md"
      p={4}
      overflowWrap="anywhere"
      cursor="pointer"
      tabIndex={0}
      role="article"
      aria-selected={isSelected}
      data-selected={isSelected ? 'true' : undefined}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          const target = event.target as HTMLElement
          if (target.tagName !== 'BUTTON' && target.tagName !== 'INPUT') {
            event.preventDefault()
            onSelect?.()
          }
        }
      }}
    >
      <Heading as="h3" size="sm">{card.title}</Heading>
      {card.description && <Text color="gray.600" mt={2} fontSize="sm">{card.description}</Text>}
      {editing ? (
        <form onSubmit={submit} onClick={(event) => event.stopPropagation()}>
          <label htmlFor={`edit-card-${card.id}`}>Edit card title</label>
          <input
            id={`edit-card-${card.id}`}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            autoFocus
          />
          <button type="submit" disabled={edit.isPending || !title.trim()}>Save</button>
          <button
            type="button"
            disabled={edit.isPending}
            onClick={() => {
              setEditing(false)
              edit.reset()
              requestAnimationFrame(() => editButtonRef.current?.focus())
            }}
          >
            Cancel
          </button>
          {edit.isPending && <p role="status">Saving card…</p>}
          {edit.isError && <p role="alert">Could not save card: {edit.error.message}</p>}
        </form>
      ) : (
        <>
          <button
            ref={editButtonRef}
            type="button"
            disabled={isMoving}
            onClick={(event) => {
              event.stopPropagation()
              setTitle(card.title)
              edit.reset()
              setEditing(true)
            }}
          >
            Edit
          </button>
          <button
            type="button"
            aria-label="Déplacer à gauche"
            disabled={!canMoveLeft || isMoving}
            onClick={(event) => {
              event.stopPropagation()
              onSelect?.()
              onMoveLeft?.()
            }}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Déplacer à droite"
            disabled={!canMoveRight || isMoving}
            onClick={(event) => {
              event.stopPropagation()
              onSelect?.()
              onMoveRight?.()
            }}
          >
            →
          </button>
        </>
      )}
    </Box>
  )
}
