import type { BoardType, ColumnType } from "../Type";

import { SimpleGrid } from "@chakra-ui/react";

import {Column} from "./Column"

export function Board({ board }: { board: BoardType }) {
    return (
        <SimpleGrid columns={{ base: 1, md: 2, xl: board.columns.length }} gap={4}>
            {board.columns.map((column: ColumnType) => ( 
                <Column key={column.id} column={column} />
            ))}
        </SimpleGrid>
    )
}


