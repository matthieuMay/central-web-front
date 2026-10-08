import { Heading } from "@chakra-ui/react"
import type { BoardData, ColumnData, CardData } from "../types"



export const Column = ({column}: {column: ColumnData}) => {return <Heading>{column.title}</Heading>}