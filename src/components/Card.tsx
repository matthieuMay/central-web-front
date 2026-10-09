import { Box, Button, Checkbox, Heading, HStack, IconButton, Stack, Text } from '@chakra-ui/react'
import { ChatBubbleIcon, DragHandleDots2Icon, Pencil1Icon } from '@radix-ui/react-icons'
import { motion, useAnimate, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { useQuery } from '@tanstack/react-query'
import { getUsers, usersKey } from '../api/board'
import { useUpdateCardCollections } from '../api/mutations'
import type { CardChecklistItem, CardData } from '../types/board'
import { cardElementId, editElementId } from './cardIds'
import Confetti from './Confetti'
import type { CardDragItem, CardLanding, DragPosition } from './CardDragPreview'

// shortcut: colors cycle beyond ten users, expand the palette when the catalog grows.
const avatarPalettes = ['blue', 'purple', 'teal', 'pink', 'orange', 'green', 'cyan', 'red', 'yellow', 'gray'] as const

type CardProps = { card: CardData; selected: boolean; onSelect: () => void; onEdit: () => void; disabled: boolean; arriving: boolean; onArrival: () => boolean; onCancelDrag: (id: string, origin: DragPosition) => void; dropOrigin: DragPosition | null; returning: CardLanding['returning'] }

export function Card({ card, selected, onSelect, onEdit, disabled, arriving, onArrival, onCancelDrag, dropOrigin, returning }: CardProps) {
  const users = useQuery({ queryKey: usersKey, queryFn: getUsers, staleTime: 60_000, retry: false, enabled: card.assignees.length > 0 })
  const avatarColors = new Map((users.data ?? []).toSorted((a, b) => a.id.localeCompare(b.id)).map((user, index) => [user.id, avatarPalettes[index % avatarPalettes.length]]))
  const collections = useUpdateCardCollections()
  const [collectionError, setCollectionError] = useState('')
  const [collectionStatus, setCollectionStatus] = useState('')
  async function setDone(index: number, item: CardChecklistItem, done: boolean) {
    if (disabled) return
    setCollectionError('')
    setCollectionStatus('Enregistrement de la tâche…')
    try {
      await collections.mutateAsync({ cardId: card.id, action: { type: 'set-checklist-done', index, item, done } })
      setCollectionStatus('Tâche enregistrée.')
    } catch (error) {
      setCollectionStatus('')
      setCollectionError(error instanceof Error ? error.message : 'Modification de la tâche impossible.')
    }
  }
  const reducedMotion = useReducedMotion()
  const animating = useRef(false)
  const element = useRef<HTMLElement | null>(null)
  const handle = useRef<HTMLButtonElement | null>(null)
  const arrivalHandler = useRef(onArrival)
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const [burst, setBurst] = useState(0)
  const [{ isDragging }, drag, preview] = useDrag<CardDragItem, { moved: boolean }, { isDragging: boolean }>(() => ({
    type: 'CARD',
    item: () => {
      const cardRect = element.current!.getBoundingClientRect()
      const handleRect = handle.current!.getBoundingClientRect()
      return { cardId: card.id, width: cardRect.width, offset: { x: cardRect.left - handleRect.left, y: cardRect.top - handleRect.top } }
    },
    canDrag: !disabled,
    end: (item, monitor) => {
      if (monitor.didDrop()) return
      const source = monitor.getSourceClientOffset()
      if (source) onCancelDrag(item.cardId, { x: source.x + item.offset.x, y: source.y + item.offset.y })
    },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [card.id, disabled, onCancelDrag])

  useEffect(() => { preview(getEmptyImage(), { captureDraggingState: true }) }, [preview])

  useLayoutEffect(() => { arrivalHandler.current = onArrival }, [onArrival])

  const finishArrival = useCallback(() => {
    if ((arriving || returning) && arrivalHandler.current()) setBurst((current) => current + 1)
  }, [arriving, returning])

  useLayoutEffect(() => {
    if (!dropOrigin || (!arriving && !returning) || reducedMotion) return
    const node = element.current!.parentElement!
    node.style.transform = 'none'
    const rect = node.getBoundingClientRect()
    const opacity = returning === 'failed' ? 1 : 0.88
    const from = `translate3d(${dropOrigin.x - rect.left}px, ${dropOrigin.y - rect.top}px, 0) rotate(${returning === 'failed' ? 0 : -3}deg)`
    node.style.transform = from
    node.style.opacity = String(opacity)
    animating.current = true
    let cancelled = false
    const playback = animate(node, {
      transform: [from, 'translate3d(0, 0, 0) rotate(0deg)'],
      opacity: [opacity, 1],
    }, { type: 'spring', stiffness: 280, damping: 32 })
    void playback.then(() => { if (!cancelled) { animating.current = false; finishArrival() } })
    return () => { cancelled = true; playback.stop(); animating.current = false }
  }, [dropOrigin, arriving, returning, reducedMotion, animate, finishArrival])

  useEffect(() => {
    if (!arriving && !returning) return
    // No layout callback occurs for reduced motion or a same-position layout.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (!animating.current || reducedMotion) finishArrival()
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [arriving, returning, finishArrival, reducedMotion])

  function select(event: MouseEvent<HTMLElement>) {
    if ((event.target as Element).closest('button, input, textarea, select, a, [contenteditable]:not([contenteditable="false"])')) return
    onSelect()
  }

  return (
    <motion.div ref={scope} layout={!reducedMotion && !isDragging && !(dropOrigin && (arriving || returning))} layoutId={reducedMotion || isDragging || dropOrigin ? undefined : `card-${card.id}`} transition={{ layout: { type: 'spring', stiffness: 280, damping: 32 } }} onLayoutAnimationStart={() => { animating.current = true }} onLayoutAnimationComplete={() => { animating.current = false; finishArrival() }}>
      <Box
        ref={element} as="article" id={cardElementId(card.id)} data-card-id={card.id} tabIndex={0} onClick={select}
        onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onSelect() } }}
        aria-label={card.title} position="relative" opacity={isDragging ? 0.4 : 1}
        className="board-card" aria-current={selected ? 'true' : undefined}
        bg={selected ? 'bg.info' : 'var(--app-surface)'} borderColor={selected ? 'border.info' : 'var(--app-border)'}
        borderWidth="1px" borderRadius="lg" p={4} overflowWrap="anywhere" boxShadow="0 1px 3px rgba(0, 0, 0, 0.06)"
        transition="background 150ms ease, border-color 150ms ease, box-shadow 150ms ease"
        _hover={{ borderColor: selected ? 'border.info' : 'border.emphasized', boxShadow: '0 3px 8px rgba(0, 0, 0, 0.08)' }}
      >
        <HStack justify="space-between" align="start" gap={2}>
          <Heading as="h3" fontSize="sm" lineHeight="1.5" fontWeight="600">{card.title}</Heading>
          <IconButton ref={(node) => { handle.current = node; drag(node) }} type="button" aria-label={`Déplacer ${card.title}`} title="Glisser pour déplacer" variant="ghost" size="xs" minH={{ base: 10, md: 8 }} minW={{ base: 10, md: 8 }} color="fg.muted" cursor={disabled ? 'default' : 'grab'} disabled={disabled} onClick={(event) => event.stopPropagation()}><DragHandleDots2Icon aria-hidden="true" /></IconButton>
        </HStack>
        {card.description && <Text color="fg.muted" mt={2} fontSize="sm">{card.description}</Text>}
        {card.checklistItems.some((item) => !item.done) && <Stack gap={2} mt={3} onClick={(event) => event.stopPropagation()}>
          {card.checklistItems.map((item, index) => item.done ? null : <Checkbox.Root key={index} size="sm" checked={item.done} disabled={disabled || collections.isPending} onCheckedChange={({ checked }) => void setDone(index, item, checked === true)}>
            {/* Rejected writes leave Root unchanged; resync Ark’s native input after every render. */}
            <Checkbox.HiddenInput ref={(input) => { if (input) input.checked = item.done }} /><Checkbox.Control flexShrink={0} /><Checkbox.Label fontSize="sm" overflowWrap="anywhere" whiteSpace="pre-wrap">{item.description}</Checkbox.Label>
          </Checkbox.Root>)}
        </Stack>}
        <HStack gap={2} mt={3} flexWrap="wrap" justify="space-between">
          <HStack gap={1} flexWrap="wrap" aria-label="Membres assignés">
            {card.assignees.map((id) => {
              const user = users.isError ? undefined : users.data?.find((person) => person.id === id)
              const name = user ? `${user.firstname} ${user.lastname}` : `Utilisateur inconnu (${id})`
              const initials = user ? `${user.firstname[0] ?? ''}${user.lastname[0] ?? ''}`.toUpperCase() || '?' : '?'
              return <Box key={id} as="span" role="img" aria-label={`Membre : ${name}`} title={name} display="inline-flex" alignItems="center" justifyContent="center" width={7} height={7} borderRadius="full" colorPalette={user ? avatarColors.get(id) : 'gray'} bg="colorPalette.subtle" color="colorPalette.fg" borderWidth="1px" borderColor="colorPalette.muted" fontSize="xs" fontWeight="600">{initials}</Box>
            })}
          </HStack>
          <HStack gap={1} color="fg.muted" fontSize="xs"><ChatBubbleIcon aria-hidden="true" /><Text>{card.comments.length} {card.comments.length === 1 ? 'commentaire' : 'commentaires'}</Text></HStack>
        </HStack>
        <Text role="status" aria-live="polite" fontSize="xs" color="fg.muted">{collectionStatus}</Text>
        {collectionError && <Text role="alert" fontSize="sm" color="fg.error" mt={2}>{collectionError}</Text>}
        <Button id={editElementId(card.id)} type="button" aria-label={`Modifier ${card.title}`} size="xs" variant="ghost" color="fg.muted" mt={3} minH={8} px={2} aria-disabled={disabled} onClick={() => { if (!disabled) onEdit() }}><Pencil1Icon aria-hidden="true" />Modifier</Button>
        {burst > 0 && <Confetti key={burst} particleCount={24} />}
      </Box>
    </motion.div>
  )
}
