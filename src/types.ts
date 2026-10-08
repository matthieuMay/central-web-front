export type CardData ={
    id: string;
    title: string;
    description: string;
}

export type BoardData ={
    id: string;
    title: string;
    columns: ColumnData[];
}

export type ColumnData ={
    id: string;
    title: string;
    cards: CardData[];
}