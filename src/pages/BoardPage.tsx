import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Badge, Box, Button, Heading, HStack, IconButton, Kbd, SimpleGrid, Skeleton, Stack, Text, VisuallyHidden } from '@chakra-ui/react'
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, Cross2Icon } from '@radix-ui/react-icons'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { boardKey, getBoard } from '../api/board'
import { useMoveCard, useBoardWriteStatus } from '../api/mutations'
import { boardWriteState } from '../api/boardWrites'
import { placeCard, type MoveCardInput } from '../api/placement'
import { Board } from '../components/Board'
import { cardElementId } from '../components/cardIds'
import { EditCardDrawer } from '../components/EditCardDrawer'
import type { CardLanding, DragPosition } from '../components/CardDragPreview'

function isControl(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest('input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"])'))
}

export function BoardPage() {
  const queryClient = useQueryClient()
  const writeStatus = useBoardWriteStatus()
  const { data, isPending, error } = useQuery({ queryKey: boardKey, queryFn: getBoard })
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [arrival, setArrival] = useState<MoveCardInput | null>(null)
  const [landing, setLanding] = useState<CardLanding | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const pendingArrival = useRef<MoveCardInput | null>(null)
  const moving = useRef(false)
  const focusAfterMove = useRef<string | null>(null)
  const move = useMoveCard((input) => {
    const rect = document.getElementById(cardElementId(input.cardId))?.getBoundingClientRect()
    pendingArrival.current = null
    setArrival(null)
    setLanding(rect ? { cardId: input.cardId, origin: { x: rect.left, y: rect.top }, returning: 'failed' } : null)
    focusAfterMove.current = input.cardId
  })
  const busy = writeStatus.busy || writeStatus.blocked || !!editingCardId || !!arrival || !!landing?.returning
  const selectedColumnIndex = data?.columns.findIndex((column) => column.cards.some((card) => card.id === selectedCardId)) ?? -1
  const selectedCard = data?.columns[selectedColumnIndex]?.cards.find((card) => card.id === selectedCardId)
  const editingCard = data?.columns.flatMap((column) => column.cards).find((card) => card.id === editingCardId)

  useLayoutEffect(() => {
    const pending = focusAfterMove.current
    if (pending && data?.columns.some((column) => column.cards.some((card) => card.id === pending))) {
      document.getElementById(cardElementId(pending))?.focus({ preventScroll: true })
      focusAfterMove.current = null
    }
  }, [data])

  function selectCard(id: string) {
    if (moving.current || arrival || landing?.returning) return
    move.reset()
    setSelectedCardId((current) => current === id ? null : id)
    document.getElementById(cardElementId(id))?.focus({ preventScroll: true })
  }

  const moveTo = useCallback((input: MoveCardInput, origin?: DragPosition) => {
    const current = queryClient.getQueryData<typeof data>(boardKey)
    const write = boardWriteState(queryClient)
    if (write.busy || write.recovery || queryClient.getQueryState(boardKey)?.status === 'error') return false
    if (!current || busy || moving.current || queryClient.isMutating({ predicate: (mutation) => mutation.options.scope?.id === 'board-writes' }) || queryClient.isFetching({ queryKey: boardKey, exact: true })) return false
    const placed = placeCard(current, input)
    if (placed === current) return false
    moving.current = true
    move.reset()
    setSelectedCardId(input.cardId)
    const destination = placed.columns.find((column) => column.id === input.column)!
    const target = { ...input, position: destination.cards.findIndex((card) => card.id === input.cardId) }
    pendingArrival.current = target
    setArrival(target)
    setLanding(origin ? { cardId: input.cardId, origin } : null)
    focusAfterMove.current = input.cardId
    move.mutate(input, {
      onSettled: () => { moving.current = false },
    })
    return true
  }, [queryClient, busy, move])

  const cancelDrag = useCallback((id: string, origin: DragPosition) => {
    setLanding({ cardId: id, origin, returning: 'cancelled' })
    document.getElementById(cardElementId(id))?.focus({ preventScroll: true })
  }, [])

  const arrived = (id: string) => {
    if (landing?.returning && landing.cardId === id) {
      if (landing.returning === 'cancelled') setAnnouncement('Déplacement annulé. La carte a retrouvé sa place.')
      setLanding({ ...landing, returning: undefined })
      return false
    }
    if (!arrival || pendingArrival.current !== arrival || arrival.cardId !== id) return false
    const destination = data?.columns.find((column) => column.id === arrival.column)
    setAnnouncement(`${selectedCard?.title ?? 'Carte'} déplacée dans ${destination?.title ?? arrival.column}, position ${arrival.position! + 1}.`)
    pendingArrival.current = null
    setArrival(null)
    return true
  }
  const arrivingCardId = arrival && data?.columns.find((column) => column.id === arrival.column)?.cards[arrival.position!]?.id === arrival.cardId ? arrival.cardId : null

  const moveSelected = useCallback((direction: -1 | 1, vertical = false) => {
    if (!data || !selectedCardId || selectedColumnIndex < 0) return false
    const column = data.columns[selectedColumnIndex]
    if (vertical) {
      const index = column.cards.findIndex((card) => card.id === selectedCardId) + direction
      if (index < 0 || index >= column.cards.length) return false
      return moveTo({ cardId: selectedCardId, column: column.id, position: index })
    }
    const destination = data.columns[selectedColumnIndex + direction]
    return destination ? moveTo({ cardId: selectedCardId, column: destination.id }) : false
  }, [data, selectedCardId, selectedColumnIndex, moveTo])

  useEffect(() => {
    if (!selectedCardId) return
    function onKeyDown(event: KeyboardEvent) {
      if (editingCardId || isControl(event.target)) return
      if (event.key === 'Escape') { setSelectedCardId(null); return }
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : null
      if (direction) {
        event.preventDefault()
        moveSelected(direction, event.key === 'ArrowUp' || event.key === 'ArrowDown')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedCardId, editingCardId, moveSelected])

  if (isPending) return <Stack gap={6} role="status" aria-label="Chargement du tableau"><Skeleton height={9} width="min(20rem, 100%)" /><SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={5}>{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} height="24rem" borderRadius="xl" />)}</SimpleGrid></Stack>
  if (!data) return <Stack role="alert" gap={3} maxW="lg"><Heading size="lg">Le tableau est indisponible</Heading><Text color="fg.muted">{error?.message}</Text><Button width="fit-content" colorPalette="blue" onClick={() => void writeStatus.refresh()}>Réessayer</Button></Stack>
  const cardCount = data.columns.reduce((count, column) => count + column.cards.length, 0)
  const selectedIndex = data.columns[selectedColumnIndex]?.cards.findIndex((card) => card.id === selectedCardId) ?? -1
  return (
    <>
      <HStack justify="space-between" align="start" flexWrap="wrap" gap={4} mb={6}>
        <Box>
          <Heading as="h1" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="600" letterSpacing="-0.03em">{data.title}</Heading>
          <Text color="fg.muted" fontSize="sm" mt={2}>Organisez vos cartes, une étape à la fois.</Text>
        </Box>
        <Badge variant="outline" borderColor="var(--app-border)" color="fg.muted" borderRadius="full" px={3} py={1.5} fontWeight="500">{cardCount} {cardCount === 1 ? 'carte' : 'cartes'} · {data.columns.length} colonnes</Badge>
      </HStack>
      <Box mb={6} px={4} py={3} minH="4rem" borderWidth="1px" borderColor={selectedCard ? 'border.info' : 'var(--app-border)'} borderRadius="lg" bg="var(--app-surface)">
        <VisuallyHidden role="status" aria-live="polite">{announcement}</VisuallyHidden>
        {selectedCard ? (
          <HStack flexWrap="wrap" gap={3}>
            <Text fontSize="sm" fontWeight="500" maxW="20rem" truncate title={selectedCard.title}>{selectedCard.title}</Text>
            <HStack gap={1}>
              <Button size="sm" variant="outline" disabled={selectedColumnIndex === 0 || busy} onClick={() => moveSelected(-1)}><ArrowLeftIcon aria-hidden="true" />À gauche</Button>
              <Button size="sm" variant="outline" disabled={selectedColumnIndex === data.columns.length - 1 || busy} onClick={() => moveSelected(1)}>À droite<ArrowRightIcon aria-hidden="true" /></Button>
              <IconButton size="sm" variant="ghost" aria-label="Monter la carte" title="Monter la carte" disabled={selectedIndex <= 0 || busy} onClick={() => moveSelected(-1, true)}><ArrowUpIcon /></IconButton>
              <IconButton size="sm" variant="ghost" aria-label="Descendre la carte" title="Descendre la carte" disabled={selectedIndex === data.columns[selectedColumnIndex].cards.length - 1 || busy} onClick={() => moveSelected(1, true)}><ArrowDownIcon /></IconButton>
            </HStack>
            <Text color="fg.muted" fontSize="xs">Les flèches du clavier fonctionnent aussi.</Text>
            <IconButton size="sm" variant="ghost" aria-label="Désélectionner la carte" title="Désélectionner · Échap" marginStart="auto" onClick={() => setSelectedCardId(null)}><Cross2Icon /></IconButton>
            {move.isPending && <Text role="status" color="fg.muted" fontSize="sm">Enregistrement…</Text>}
          </HStack>
        ) : <HStack flexWrap="wrap" gap={3} minH={9} justify="space-between"><Text color="fg.muted" fontSize="sm">Cliquez sur une carte pour la déplacer, ou glissez sa poignée.</Text><HStack color="fg.muted" fontSize="xs" gap={1}><Kbd>↑</Kbd><Kbd>↓</Kbd><Text mx={1}>Réordonner</Text><Kbd>←</Kbd><Kbd>→</Kbd><Text ml={1}>Changer de colonne</Text></HStack></HStack>}
        {move.isError && <Text role="alert" color="fg.error" fontSize="sm" mt={2}>Déplacement impossible : {move.error.message}. Réessayez.</Text>}
        {writeStatus.recovery && !editingCardId && <Box role="alert" mt={2}><Text color="fg.error" fontSize="sm">{writeStatus.recovery}</Text><Button size="xs" variant="outline" disabled={writeStatus.busy} onClick={() => void writeStatus.refresh()}>Actualiser</Button></Box>}
      </Box>
      <Board board={data} selectedCardId={selectedCardId} onSelectCard={selectCard} onEditCard={(id) => { if (!moving.current && !arrival && !landing?.returning) setEditingCardId(id) }} disabled={busy} onMoveCard={moveTo} onCancelDrag={cancelDrag} arrivingCardId={arrivingCardId} onArrival={arrived} landing={landing} />
      <EditCardDrawer card={editingCard ?? null} onClose={() => setEditingCardId(null)} />
    </>
  )
}
