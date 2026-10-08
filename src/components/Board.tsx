import { Heading, SimpleGrid, Stack } from "@chakra-ui/react";
import type { BoardProps } from "../types/board";
import Column from "./Column";


export function Board({ board }: { board: BoardProps }) {
  return (
    <Stack gap={4}>
      {board.title && <Heading>{board.title}</Heading>}
      <SimpleGrid columns={board.columns.length} >
        {board.columns.map((column) => (
          <Column column={column} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}
