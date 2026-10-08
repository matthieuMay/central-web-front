import { Heading, SimpleGrid, Stack } from '@chakra-ui/react'
import type { BoardData} from '../Types'
import Column from './ColumnData'

type BoardDataProps = {
  board: BoardData
}

function Board({ board }: BoardDataProps) {
  return (
    <Stack gap={6}>
      <Heading as="h1">{board.title}</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4}>
        {board.columns.map((column) => (
          <Column key={column.id} column={column} />
        ))}
      </SimpleGrid>
    </Stack>
  )
}

export default Board