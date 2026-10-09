import { Box, Heading, Text } from '@chakra-ui/react'
import { motion, useReducedMotion } from 'motion/react'
import { useDragLayer } from 'react-dnd'
import type { BoardData } from '../types/board'

export function CardDragPreview({ board }: { board: BoardData }) {
  const reducedMotion = useReducedMotion()
  const { item, offset, dragging } = useDragLayer((monitor) => ({
    item: monitor.getItem<{ cardId: string; width: number }>(),
    offset: monitor.getSourceClientOffset(),
    dragging: monitor.isDragging(),
  }))
  const card = board.columns.flatMap((column) => column.cards).find((card) => card.id === item?.cardId)
  if (!dragging || !offset || !card) return null

  return (
    <Box position="fixed" inset={0} pointerEvents="none" zIndex={1500} aria-hidden="true" data-drag-preview="">
      <div style={{ position: 'absolute', width: item.width, transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}>
        <motion.div initial={{ transform: 'rotate(0deg)', opacity: 1 }} animate={{ transform: reducedMotion ? 'rotate(0deg)' : 'rotate(-3deg)', opacity: 0.88 }} transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}>
          <Box bg="bg.info" borderWidth="1px" borderColor="border.info" borderRadius="md" p={4} boxShadow="2xl" overflowWrap="anywhere">
            <Heading as="h3" size="sm">{card.title}</Heading>
            {card.description && <Text color="fg.muted" mt={2} fontSize="sm">{card.description}</Text>}
          </Box>
        </motion.div>
      </div>
    </Box>
  )
}
