import { Box, Text } from '@chakra-ui/react'
import type { ColumnTone } from './column-tone'
import { Surface } from './Surface'

export function StatTile({ label, value, detail, tone }: {
  label: string
  value: string | number
  detail: string
  tone: ColumnTone
}) {
  return <Surface tone={tone}>
    <Text color="fg.muted" fontSize="sm" fontWeight="semibold">{label}</Text>
    <Box
      aria-hidden="true"
      h="3px"
      w="8"
      bg={`tone.${tone}.accent`}
      borderRadius="full"
      mt={3}
    />
    <Text
      fontSize={{ base: '3xl', md: '4xl' }}
      fontWeight="bold"
      color={`tone.${tone}.accent`}
      my={3}
      lineHeight="1.1"
    >
      {value}
    </Text>
    <Text color="fg.muted" fontSize="sm">{detail}</Text>
  </Surface>
}
