import type { ColumnData } from '../Types'

type ColumnDataProps = {
  column: ColumnData
}

function Column({ column }: ColumnDataProps) {
  return (
    <section>
      <h2>{column.title}</h2>
      <ul>
        {column.cards.map((card) => (
          <li key={card.id}>{card.title}</li>
        ))}
      </ul>
    </section>
  )
}

export default Column