import { Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import type { SprintAnalytics } from '../../analytics'
import { ChecklistProgress, MetricBar } from './MetricBar'
import { formatPercent } from './format'
import { Surface } from '../visual/Surface'
import { StatTile } from '../visual/StatTile'
import { columnTone } from '../visual/column-tone'

export function SprintOverview({ stats }: {
  stats: SprintAnalytics
}) {
  const checklistDetail = stats.checklist.total === 0 ? 'Aucune tâche'
    : `${stats.checklist.done} / ${stats.checklist.total} tâches terminées`
  return (
    <Stack as="section" aria-label="Sprint Overview" gap={5}>
      <Heading as="h2" size="lg">Vue d’ensemble du sprint</Heading>
      {stats.total === 0 && <Text role="status">Ce tableau ne contient aucune carte.</Text>}
      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap={5}>
        <StatTile
          label="Total des cartes"
          value={stats.total}
          detail="Sur l’ensemble du tableau"
          tone="sky"
        />
        <StatTile
          label="Cartes terminées"
          value={stats.completion.done}
          detail={`${formatPercent(stats.completion.percent)} du tableau`}
          tone="teal"
        />
        <StatTile
          label="Cartes sans assignation"
          value={stats.unassigned}
          detail="Sans membre associé"
          tone="orange"
        />
        <StatTile
          label="Progression checklist"
          value={formatPercent(stats.checklist.percent)}
          detail={checklistDetail}
          tone="violet"
        />
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={5}>
        <Surface>
          <Stack gap={5}>
            <Heading as="h3" size="md">Répartition par colonne</Heading>
            {stats.columns.length === 0 && <Text>Aucune colonne.</Text>}
            {stats.columns.map((column, index) => <MetricBar
              key={column.id}
              label={column.title}
              value={column.count}
              total={stats.total}
              tone={columnTone(column.id, index)}
              detail={`${column.count} carte${column.count === 1 ? '' : 's'} (${formatPercent(column.percent)})`}
            />)}
          </Stack>
        </Surface>
        <Surface>
          <Stack gap={6}>
            <Heading as="h3" size="md">Le sprint avance</Heading>
            <ChecklistProgress value={stats.checklist} />
            <MetricBar
              label="Cartes terminées"
              value={stats.completion.done}
              total={stats.total}
              completed
              detail={`${stats.completion.done} / ${stats.total} (${formatPercent(stats.completion.percent)})`}
            />
            <Text color="fg.muted" fontSize="sm">
              Les cartes terminées sont dans la dernière colonne. La checklist compte chaque tâche, quel que soit le statut de sa carte.
            </Text>
          </Stack>
        </Surface>
      </SimpleGrid>
    </Stack>
  )
}
