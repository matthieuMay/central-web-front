import boardJson from '../../data/board.json'
import type { BoardData } from '../types'  

const board: BoardData = boardJson

export function BoardPage() {
  return (
    <div>
      <h1>{board.title}</h1>
      {board.columns.map((column) => (
        <section key={column.id}>
          <h2>{column.title}</h2>
          {column.cards.length === 0 ? (
            <p>Aucune carte</p>
          ) : (
            <ul>
              {column.cards.map((card) => (
                <li key={card.id}>
                  <h3>{card.title}</h3>
                  {card.description && <p>{card.description}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}