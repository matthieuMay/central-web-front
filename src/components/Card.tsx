import { Box, Text, Checkbox, Button, HStack} from '@chakra-ui/react'
import type { CardType } from '../Type'

export function CardComponent({ card }: { card: CardType }) {
    return (
        <Box borderWidth="1px" borderRadius="md" p={4} bg="white">
            <HStack>
                <Checkbox.Root>
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Text>{card.title}</Text>
            </Checkbox.Root>
            </HStack>
            <Text>{card.description || 'No description'}</Text>
            <HStack gap={2} mt={2}>
            <Button>←</Button>
            <Button>→</Button>
            </HStack>
        </Box>
    )
}