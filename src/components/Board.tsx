import { Heading } from "@chakra-ui/react"
import type { BoardData } from "../types"


export const Board = ({board}: {board: BoardData}) => {return <Heading>{board.title}</Heading>}

