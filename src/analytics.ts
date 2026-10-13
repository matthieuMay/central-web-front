import type { BoardData, UserData } from './types/board'

export type Progress = {
  done: number
  total: number
  percent: number | null
}
export type MemberWorkload = {
  id: string
  name: string
  total: number
  active: number
  completed: number
  checklist: Progress
}
export type SprintAnalytics = {
  total: number
  completion: Progress
  checklist: Progress
  columns: {
    id: string
    title: string
    count: number
    percent: number | null
  }[]
  unassigned: number
  unavailableAssigneeCards: number
  members: MemberWorkload[]
  workload: {
    average: number | null
    min: number
    max: number
    gap: number
  }
}
export function progress(done: number, total: number): Progress {
  return { done, total, percent: total === 0 ? null : done / total * 100 }
}
/** Snapshot only: the last column means completed; every assignment receives the whole card. */
export function calculateSprintAnalytics(board: BoardData, users: UserData[]): SprintAnalytics {
  const members = new Map<string, MemberWorkload>(users.map(user => [user.id, {
    id: user.id,
    name: `${user.firstname} ${user.lastname}`.trim() || user.id,
    total: 0,
    active: 0,
    completed: 0,
    checklist: progress(0, 0),
  }]))
  const total = board.columns.reduce((sum, column) => sum + column.cards.length, 0)
  let taskTotal = 0
  let taskDone = 0
  let unassigned = 0
  let unavailableAssigneeCards = 0
  board.columns.forEach((column, index) => {
    const completed = index === board.columns.length - 1
    column.cards.forEach(card => {
      const done = card.checklistItems.filter(item => item.done).length
      taskTotal += card.checklistItems.length
      taskDone += done
      if (card.assignees.length === 0)
        unassigned++
      if (card.assignees.some(id => !members.has(id)))
        unavailableAssigneeCards++
      for (const id of new Set(card.assignees)) {
        const member = members.get(id)
        if (!member)
          continue
        member.total++
        if (completed)
          member.completed++
        else
          member.active++
        member.checklist = progress(
          member.checklist.done + done,
          member.checklist.total + card.checklistItems.length,
        )
      }
    })
  })
  const orderedMembers = [...members.values()].sort((first, second) =>
    second.active - first.active ||
    first.name.localeCompare(second.name, 'fr') ||
    first.id.localeCompare(second.id),
  )
  const counts = orderedMembers.map(member => member.active)
  const max = counts.length === 0 ? 0 : Math.max(...counts)
  const min = counts.length === 0 ? 0 : Math.min(...counts)
  return {
    total,
    completion: progress(board.columns.at(-1)?.cards.length ?? 0, total),
    checklist: progress(taskDone, taskTotal),
    columns: board.columns.map(column => ({
      id: column.id,
      title: column.title,
      count: column.cards.length,
      percent: total === 0 ? null : column.cards.length / total * 100,
    })),
    unassigned,
    unavailableAssigneeCards,
    members: orderedMembers,
    workload: {
      average: counts.length === 0 ? null
        : counts.reduce((sum, count) => sum + count, 0) / counts.length,
      min,
      max,
      gap: max - min,
    },
  }
}
