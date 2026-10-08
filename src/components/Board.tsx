import type { BoardData } from "../types"
import { Heading, Text, Stack, SimpleGrid, Box } from '@chakra-ui/react'

export const Board=({board}:{board:BoardData}) => {
    return (
    <Stack>
        <Heading as="h2">{board.title}</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4}>
            <Box>
                <Text>{board.columns[0].title}</Text>
            </Box>
            <Box>
                <Text>{board.columns[1].title}</Text>
            </Box>
        </SimpleGrid>
    </Stack>
    )
}