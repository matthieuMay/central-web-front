export type BoardType = {
    id : string;
    title : string;
    columns : ColumnType[];
}

export type ColumnType = {
    id : string;
    title : string;
    cards : CardType[];
}

export type CardType = {
    id : string;
    title : string;
    description? : string;
}

