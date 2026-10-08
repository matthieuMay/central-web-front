import type {ColumnType, CardType} from '../Type'

import {CardComponent} from './Card'

import {Box, Heading, Stack} from '@chakra-ui/react'

export function Column({ column }: { column: ColumnType }) {
    return (
        <Box>
            <Heading as="h2">{column.title}</Heading>
            <Stack gap={2}>
                {column.cards.map((card: CardType) => (
                    <CardComponent key={card.id} card={card} />
                ))}
            </Stack>
        </Box>
    )
}



