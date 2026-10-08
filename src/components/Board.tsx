import { Heading } from "@chakra-ui/react"
import type { BoardData, ColumnData, CardData } from "../types"


export const Board = ({board}: {board: BoardData}) => {return <Heading>{board.title}</Heading>}


