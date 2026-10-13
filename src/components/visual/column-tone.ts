export type ColumnTone = 'sky' | 'violet' | 'orange' | 'teal'
const columnTones: Record<string, ColumnTone> = {
  'sprint-backlog': 'sky',
  backlog: 'sky',
  doing: 'violet',
  review: 'orange',
  done: 'teal',
}
const fallbackTones: ColumnTone[] = ['sky', 'violet', 'orange', 'teal']
export function columnTone(id: string, index: number): ColumnTone {
  return columnTones[id] ?? fallbackTones[index % fallbackTones.length]
}
