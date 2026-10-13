import { Box, type BoxProps } from '@chakra-ui/react'
import type { ColumnTone } from './column-tone'

export function Surface({ tone, children, ...props }: BoxProps & {
  tone?: ColumnTone
}) {
  return <Box
    bg={tone ? `tone.${tone}.surface` : 'bg'}
    borderWidth="1px"
    borderColor="border"
    borderRadius="2xl"
    p={{ base: 5, md: 6 }}
    boxShadow="card"
    minW={0}
    {...props}
  >
    {children}
  </Box>
}
