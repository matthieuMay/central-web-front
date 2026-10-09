import { Box, Heading, SimpleGrid } from '@chakra-ui/react'
import type { BoardData } from '../types'
import { Column } from './Column'

export const Board = ({ board }: { board: BoardData }) => (
  <Box>
    <Heading>{board.title}</Heading>
    <SimpleGrid columns={{ base: 1, md: 4 }}>
      {board.columns.map((column) => <Column key={column.id} column={column} />)}
    </SimpleGrid>
  </Box>
)