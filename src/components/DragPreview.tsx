import { Box, Heading } from '@chakra-ui/react'
import { useDragLayer } from 'react-dnd'

type DragItem = {
  cardId: string
  title: string
}

export function DragPreview() {
  const { item, isDragging, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem() as DragItem | null,
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getClientOffset(),
  }))

  if (!isDragging || !item || !currentOffset) return null

  return (
    <Box
      pointerEvents="none"
      position="fixed"
      left={0}
      top={0}
      zIndex={100}
      transform={`translate(${currentOffset.x + 12}px, ${currentOffset.y + 12}px) scale(0.92)`}
      transformOrigin="top left"
      opacity={0.65}
      width="min(18rem, calc(100vw - 2rem))"
      bg="bg"
      borderColor="border.info"
      borderWidth="2px"
      borderRadius="md"
      p={4}
      boxShadow="lg"
    >
      <Heading as="h3" size="sm">{item.title}</Heading>
    </Box>
  )
}
