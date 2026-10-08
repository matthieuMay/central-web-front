import type { BoardData } from '../types'
import { Heading, Text, Stack } from '@chakra-ui/react'

export const Board = ({board}:{board: BoardData}) => {
    return <Heading>{board.title}</Heading>
    
}