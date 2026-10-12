import type { CardLabel } from './board'

export const cardLabels: { id: CardLabel; name: string; color: string }[] = [
  { id: 'urgent', name: 'Urgent', color: '#ef4444' },
  { id: 'documentation', name: 'Documentation', color: '#3b82f6' },
  { id: 'bug', name: 'Bug', color: '#eab308' },
  { id: 'feature', name: 'Feature', color: '#22c55e' },
]
