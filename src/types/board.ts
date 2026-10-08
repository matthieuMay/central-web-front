type BoardProps = {
  title?: string;
  id: string;
  columns: ColumnProps[];
};

type ColumnProps = {
  title: string;
  id: string;
  cards: CardProps[];
};

type CardProps = {
  title: string;
  id: string;
  description?: string;
};

export type { BoardProps, ColumnProps, CardProps };
