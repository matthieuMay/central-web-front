import { Heading, Text, Stack, Box} from '@chakra-ui/react'
import type {CardData, ColumnData, BoardData} from '../types'
import board from '../../data/board.json'


type BoardProps = {
  board: BoardData
}

type ColumnProps = {
  column: ColumnData
}

type CardProps = {
  card: CardData
}







function Card({card}: CardProps) {
  return (
    <Box key={card.id} padding="3" background="white" borderWidth="1px" borderRadius="md">
      <Text fontWeight="bold">{card.title}</Text>
      <Text>{card.description}</Text>
    </Box>
  )
}
function Column({column} : ColumnProps) {
  return (
    <Box key={column.id} padding="4" background="gray.100">
      <Text fontWeight="bold">{column.title}</Text>
      <Stack>
        {column.cards ? column.cards.map((card) => (
          <Card key={card.id} card={card} />
        )) : <Text>No cards available</Text>}
      </Stack>
    </Box>
  )
}
function Board({board}: BoardProps) {
  return (
    <Box padding="4">
      <Heading as="h1">{board.title}</Heading>
      <Stack direction={{ base: "column", md: "row" }} gap={4}>
        {board.columns.map((column) => (
          <Column key={column.id} column={column} />
        ))}
      </Stack>
    </Box>
  )
}
export function BoardPage() {
  const boardData: BoardData = board as BoardData;
  return (
    <>
      <Board board={boardData} />
    </>
  )
}