import { Badge, Box, Button, Field, Heading, HStack, Input, Stack, Text } from '@chakra-ui/react'
import { PlusIcon } from '@radix-ui/react-icons'
import { useRef, useState, type FormEvent } from 'react'
import { useDrop } from 'react-dnd'
import { v7 as uuidv7 } from 'uuid'
import { useCreateCard } from '../api/mutations'
import type { ColumnData } from '../types/board'
import { Card } from './Card'
import type { MoveCardInput } from '../api/placement'
import type { CardDragItem, CardLanding, DragPosition } from './CardDragPreview'

type ColumnProps = {
  column: ColumnData
  selectedCardId: string | null
  onSelectCard: (id: string) => void
  onEditCard: (id: string) => void
  disabled: boolean
  onMoveCard: (input: MoveCardInput, origin?: DragPosition) => boolean
  onCancelDrag: (id: string, origin: DragPosition) => void
  landing: CardLanding | null
  arrivingCardId: string | null
  onArrival: (id: string) => boolean
}

export function Column({ column, selectedCardId, onSelectCard, onEditCard, disabled, onMoveCard, onCancelDrag, arrivingCardId, onArrival, landing }: ColumnProps) {
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const create = useCreateCard()
  const cardsRef = useRef<HTMLDivElement>(null)
  const [insertion, setInsertion] = useState<{ position: number; top: number } | null>(null)

  function locate(cardId: string, y: number) {
    const region = cardsRef.current
    if (!region) return null
    const cards = [...region.querySelectorAll<HTMLElement>('[data-card-id]')].filter((element) => element.dataset.cardId !== cardId)
    const position = cards.filter((element) => {
      const rect = element.getBoundingClientRect()
      return y >= rect.top + rect.height / 2
    }).length
    if (column.cards.findIndex((card) => card.id === cardId) === position) return null
    const next = cards[position]?.getBoundingClientRect()
    const previous = cards[position - 1]?.getBoundingClientRect()
    return { position, top: (next ? next.top - 6 : previous ? previous.bottom + 6 : region.getBoundingClientRect().top + 24) - region.getBoundingClientRect().top }
  }

  const [{ isOver, canDrop }, drop] = useDrop<CardDragItem, { moved: boolean }, { isOver: boolean; canDrop: boolean }>(() => ({
    accept: 'CARD',
    canDrop: () => !disabled,
    hover: (item, monitor) => {
      const point = monitor.getClientOffset()
      if (!monitor.canDrop() || !point) return
      const next = locate(item.cardId, point.y)
      setInsertion((current) => current?.position === next?.position && current?.top === next?.top ? current : next)
    },
    drop: (item, monitor) => {
      const point = monitor.getClientOffset()
      const target = point && locate(item.cardId, point.y)
      const source = monitor.getSourceClientOffset()
      const origin = source ? { x: source.x + item.offset.x, y: source.y + item.offset.y } : undefined
      return { moved: !!target && onMoveCard({ cardId: item.cardId, column: column.id, position: target.position }, origin) }
    },
    collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }), canDrop: monitor.canDrop() }),
  }), [column, disabled, onMoveCard])

  function submit(event: FormEvent) {
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
    <Box as="section" aria-label={column.title} bg="var(--app-panel)" borderRadius="xl" p={4} minW={0} display="flex" flexDirection="column" minH={{ base: 'auto', xl: '32rem' }}>
      <HStack justify="space-between" mb={5} gap={3}>
        <Heading as="h2" size="sm" fontWeight="600">{column.title}</Heading>
        <Badge bg="var(--app-surface)" color="fg.muted" borderRadius="md" minW={7} justifyContent="center" fontVariantNumeric="tabular-nums" aria-label={`${column.cards.length} cartes`}>{column.cards.length}</Badge>
      </HStack>
      <Stack gap={3} flex="1">
      <Stack ref={(node) => { cardsRef.current = node; drop(node) }} role="group" aria-label={`Cartes dans ${column.title}`} gap={3} minH="7rem" flex="1" position="relative" borderRadius="md" outline={isOver && canDrop ? '2px dashed' : undefined} outlineColor="border.info" outlineOffset="6px" pb={3}>
        {column.cards.length === 0 && <Box borderWidth="1px" borderStyle="dashed" borderColor="var(--app-border)" borderRadius="lg" px={4} py={7} textAlign="center"><Text fontSize="sm" fontWeight="500">Aucune carte</Text><Text color="fg.muted" fontSize="sm" mt={1}>Déposez une carte ici ou créez-en une.</Text></Box>}
        {column.cards.map((card) => (
          <Card key={card.id} card={card} selected={card.id === selectedCardId} onSelect={() => onSelectCard(card.id)} onEdit={() => onEditCard(card.id)} disabled={disabled} arriving={card.id === arrivingCardId} onArrival={() => onArrival(card.id)} onCancelDrag={onCancelDrag} dropOrigin={landing?.cardId === card.id ? landing.origin : null} returning={landing?.cardId === card.id ? landing.returning : undefined} />
        ))}
        {isOver && canDrop && insertion && <Box aria-hidden="true" data-drop-indicator="" position="absolute" top={`${insertion.top}px`} insetInline={0} height="3px" bg="border.info" borderRadius="full" pointerEvents="none" zIndex={2} />}
      </Stack>
        <Box as="form" onSubmit={submit} mt="auto" pt={4} borderTopWidth="1px" borderColor="var(--app-border)">
          <Field.Root>
            <Field.Label htmlFor={`new-card-${column.id}`} fontSize="xs" color="fg.muted">Nouvelle carte</Field.Label>
            <Input ref={inputRef} id={`new-card-${column.id}`} aria-label={`Titre de la nouvelle carte dans ${column.title}`} placeholder="Titre de la carte…" _placeholder={{ color: 'fg.muted' }} value={title} onChange={(event) => setTitle(event.target.value)} required bg="var(--app-surface)" size="sm" borderRadius="md" disabled={create.isPending} />
          </Field.Root>
          <Button type="submit" variant="ghost" colorPalette="blue" size="sm" width="full" mt={2} disabled={create.isPending || !title.trim()} loading={create.isPending} loadingText="Ajout en cours…"><PlusIcon aria-hidden="true" />Ajouter une carte</Button>
          {create.isError && <Text role="alert" color="fg.error" fontSize="sm" mt={2}>Ajout impossible : {create.error.message}. Réessayez.</Text>}
        </Box>
      </Stack>
    </Box>
  )
}
