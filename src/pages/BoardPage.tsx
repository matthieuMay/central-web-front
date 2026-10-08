import { Heading, Text, Stack } from '@chakra-ui/react'
import {Board} from "../components/Board"
import type {BoardData} from "../types"

const Tableau1: BoardData = {
  id: 'tab1',
  title:'Tableau 1',
  columns: [
    { id:'col1', title: 'A faire', cards: []},
    { id:'col2', title: 'Fait', cards: []}
  ],
}

export function BoardPage() {
  return (
    <Stack gap={4}>
      <Heading as="h1">Tableau à venir</Heading>
      <Text>Le tableau du Mini-Trello sera construit au Sprint 1.</Text>
      <Board board={Tableau1} />
    </Stack>
  )
}