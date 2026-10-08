import { Heading, Text, Stack } from '@chakra-ui/react'
import { Board} from '../components/Board'
import boardData from '../../data/board.json'

export function BoardPage() {
  return (
    <Stack gap={4}>
      <Heading as="h1">Tableau à venir</Heading>
      <Text>Le tableau du Mini-Trello sera construit au Sprint 1.</Text>
    <Board board = { boardData}></Board>
    </Stack>
  )
}
