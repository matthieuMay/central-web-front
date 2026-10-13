import type { CardEdit } from '../../card-editing'
import type { UserData } from '../../types/board'

export type EditorProps = { blocked: boolean; onEdit: (edit: CardEdit) => Promise<boolean> }
export type UsersProps = { users: UserData[]; usersUnavailable: boolean }
