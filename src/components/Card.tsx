import { useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'
import type { CardData, CardPatch } from '../types/board'
import type { CardDragPayload, DropPoint } from '../lib/dnd'
import { getCardDragData, setCardDragData } from '../lib/dnd'
import { GripIcon, PencilIcon } from './icons'

export type { CardPatch }

type CardProps = {
  card: CardData
  columnId: string
  index: number
  onMoveCard: (payload: CardDragPayload, toColumnId: string, toIndex: number, dropPoint: DropPoint) => void
  onUpdateCard: (columnId: string, cardId: string, patch: CardPatch) => void
}

export function Card({ card, columnId, index, onMoveCard, onUpdateCard }: CardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description ?? '')

  function startEditing() {
    setTitle(card.title)
    setDescription(card.description ?? '')
    setIsEditing(true)
  }

  function save() {
    const nextTitle = title.trim()
    if (!nextTitle) return
    onUpdateCard(columnId, card.id, { title: nextTitle, description: description.trim() })
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <Box bg="bg.panel" borderWidth="1px" borderColor="blue.focusRing" borderRadius="md" p={4}>
        <Stack gap={2}>
          <Input
            size="sm"
            value={title}
            autoFocus
            aria-label="Card title"
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                save()
              }
              if (event.key === 'Escape') setIsEditing(false)
            }}
          />
          <Textarea
            size="sm"
            rows={3}
            value={description}
            aria-label="Card description"
            placeholder="Add a description"
            onChange={(event) => setDescription(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setIsEditing(false)
            }}
          />
          <HStack justify="flex-end" gap={2}>
            <Button size="xs" variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button size="xs" colorPalette="blue" onClick={save} disabled={!title.trim()}>
              Save
            </Button>
          </HStack>
        </Stack>
      </Box>
    )
  }

  return (
    <Box
      as="article"
      draggable
      onDragStart={(event) => {
        setIsDragging(true)
        setCardDragData(event, { cardId: card.id, columnId })
      }}
      onDragEnd={() => {
        setIsDragging(false)
        setIsDragOver(false)
      }}
      onDragOver={(event) => {
        event.preventDefault()
        event.stopPropagation()
        event.dataTransfer.dropEffect = 'move'
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(event) => {
        event.preventDefault()
        event.stopPropagation()
        setIsDragOver(false)
        const payload = getCardDragData(event)
        if (payload) {
          onMoveCard(payload, columnId, index, { x: event.clientX, y: event.clientY })
        }
      }}
      bg="bg.panel"
      borderWidth="1px"
      borderRadius="md"
      p={4}
      overflowWrap="anywhere"
      cursor="grab"
      opacity={isDragging ? 0.4 : 1}
      boxShadow={isDragOver ? '0 0 0 2px var(--chakra-colors-blue-focus-ring)' : undefined}
      transition="box-shadow 120ms, opacity 120ms"
      _active={{ cursor: 'grabbing' }}
    >
      <Flex align="flex-start" gap={2}>
        <Box color="fg.muted" mt="3px" flexShrink={0}>
          <GripIcon />
        </Box>
        <Heading as="h3" size="sm" flex="1">
          {card.title}
        </Heading>
        <IconButton
          size="2xs"
          variant="ghost"
          aria-label={`Edit ${card.title}`}
          onClick={startEditing}
        >
          <PencilIcon />
        </IconButton>
      </Flex>
      {card.description && (
        <Text color="fg.muted" mt={2} fontSize="sm">
          {card.description}
        </Text>
      )}
    </Box>
  )
}
