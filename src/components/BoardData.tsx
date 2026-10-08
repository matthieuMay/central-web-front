import type { BoardData} from '../Types'
import Column from './ColumnData'

type BoardDataProps = {
  board: BoardData
}

function Board({ board }: BoardDataProps) {
  return (
    <div>
      <h1>{board.title}</h1>
      {board.columns.map((column) => (
        <Column key={column.id} column={column} />
      ))}
    </div>
  )
}

export default Board