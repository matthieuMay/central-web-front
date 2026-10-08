import { Box, Text, Checkbox, Button, HStack} from '@chakra-ui/react'
import type { CardType } from '../Type'

export function CardComponent({ card }: { card: CardType }) {
    return (
        <Box borderWidth="1px" borderRadius="md" p={4} bg="white">
            <HStack>
                <Checkbox.Root>
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label fontSize="lg" fontWeight="semibold">{card.title}</Checkbox.Label>
            </Checkbox.Root>
            </HStack>
            <Text>{card.description}</Text>
            <HStack gap={2} mt={2}>
            <Button bg="gray.400">←</Button>
            <Button bg="gray.400">→</Button>
            </HStack>
        </Box>
    )
}