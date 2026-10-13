import { Box, Flex, Stack, Text } from '@chakra-ui/react'
import type { Progress } from '../../analytics'
import { formatPercent } from './format'
import type { ColumnTone } from '../visual/column-tone'
/** Text conveys the entire value; the bar is a redundant, static visual. */

export function MetricBar({
  label,
  value,
  total,
  detail,
  completed = false,
  tone = completed ? 'teal' : 'violet'
}: {
  label: string
  value: number
  total: number
  detail: string
  completed?: boolean
  tone?: ColumnTone
}) {
  return (
    <Stack gap={2}>
      <Flex justify="space-between" gap={2} wrap="wrap">
        <Text overflowWrap="anywhere" fontWeight="semibold" fontSize="sm">{label}</Text>
        <Text color="fg.muted" fontSize="sm" overflowWrap="anywhere">{detail}</Text>
      </Flex>
      <Box
        aria-hidden="true"
        bg="bg.muted"
        borderWidth="1px"
        borderColor="border"
        borderRadius="full"
        height="10px"
        overflow="hidden"
      >
        <Box
          bg={`tone.${tone}.accent`}
          height="100%"
          width={`${total > 0 ? value / total * 100 : 0}%`}
        />
      </Box>
    </Stack>
  )
}

export function ChecklistProgress({ value }: {
  value: Progress
}) {
  const detail = value.total === 0 ? 'Aucune tâche'
    : `${value.done} / ${value.total} tâches terminées (${formatPercent(value.percent)})`
  return <MetricBar
    label="Checklist"
    value={value.done}
    total={value.total}
    completed
    detail={detail}
  />
}
