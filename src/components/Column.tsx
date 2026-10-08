import { Box, Heading, Stack, Text } from "@chakra-ui/react";
import type { ColumnProps } from "../types/board";
import Card from "./Card";

function Column({ column }: { column: ColumnProps }) {
  return (
    <Box borderWidth="1px" borderRadius="md" p={4}>
      <Heading size="md" mb={2}>
        <Text as="span" color="gray.500" mr={2}>

          {column.title}
        </Text>
      </Heading>
      <Stack gap={2}>
        {column.cards.map((card) => (
          <Card card={card} />
        ))}
      </Stack>
    </Box>
  );
}


export default Column;
