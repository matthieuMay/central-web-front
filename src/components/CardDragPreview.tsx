import { Box, Button, Heading, HStack, IconButton, Text } from '@chakra-ui/react'
import { DragHandleDots2Icon, Pencil1Icon } from '@radix-ui/react-icons'
import { motion, useReducedMotion } from 'motion/react'
import { useDragLayer } from 'react-dnd'
import type { BoardData } from '../types/board'

export type DragPosition = { x: number; y: number }
export type CardLanding = { cardId: string; origin: DragPosition; returning?: 'cancelled' | 'failed' }
export type CardDragItem = { cardId: string; width: number; offset: DragPosition }

export function CardDragPreview({ board, compact = false }: { board: BoardData; compact?: boolean }) {
  const reducedMotion = useReducedMotion()
  const { item, offset, dragging } = useDragLayer((monitor) => ({
    item: monitor.getItem<CardDragItem>(),
    offset: monitor.getSourceClientOffset(),
    dragging: monitor.isDragging(),
  }))
  const card = board.columns.flatMap((column) => column.cards).find((card) => card.id === item?.cardId)
  if (!dragging || !offset || !card) return null

  return (
    <Box position="fixed" inset={0} pointerEvents="none" zIndex={1500} aria-hidden="true" data-drag-preview="">
      <div style={{ position: 'absolute', width: item.width, transform: `translate3d(${offset.x + item.offset.x}px, ${offset.y + item.offset.y}px, 0)` }}>
        <motion.div initial={{ transform: 'rotate(0deg)', opacity: 1 }} animate={{ transform: reducedMotion ? 'rotate(0deg)' : 'rotate(-3deg)', opacity: 0.88 }} transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}>
          <Box bg="bg.info" borderWidth="1px" borderColor="border.info" borderRadius="lg" p={4} boxShadow="2xl" overflowWrap="anywhere">
            <HStack justify="space-between" align="start" gap={2}>
              <Heading as="h3" fontSize="sm" lineHeight="1.5" fontWeight="600">{card.title}</Heading>
              <IconButton aria-label="Aperçu du déplacement" tabIndex={-1} variant="ghost" size="xs" minH={{ base: 10, md: 8 }} minW={{ base: 10, md: 8 }} color="fg.muted"><DragHandleDots2Icon /></IconButton>
            </HStack>
            {!compact && card.description && <Text color="fg.muted" mt={2} fontSize="sm">{card.description}</Text>}
            {!compact && <Button tabIndex={-1} size="xs" variant="ghost" color="fg.muted" mt={3} minH={8} px={2}><Pencil1Icon />Modifier</Button>}
          </Box>
        </motion.div>
      </div>
    </Box>
  )
}
