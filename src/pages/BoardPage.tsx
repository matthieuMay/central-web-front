import { Heading } from '@chakra-ui/react'
import boardJson from '../../data/board.json'
import type { BoardData } from '../types/board'

const board : BoardData = boardJson

export function BoardPage() {
  return <Heading as ="h1">{board.title}</Heading>
}

