import { Heading, Stack, SimpleGrid, For} from '@chakra-ui/react'
import board from '../../data/board.json'
import Column from '../components/Column'
import Card from '../components/Card'
import type { BoardData, ColumnData, CardData } from '../type'

export function BoardPage() {
  const boardInfo : BoardData = board
  const columns: ColumnData[] = board.columns;
  return (
    <Stack gap={4}>
      <Heading as="h1">{boardInfo.title}</Heading>
      <SimpleGrid columns={{ base: 1, md: 4, xl: 4 }} gap={4}>
        <For each={columns}>
          {(column) => <Column column={column} />}

        </For>
      </SimpleGrid>
    </Stack>
  )
}
