export type Board = {
    id : string;
    name : string;
    columns : Column[];
}

export type Column = {
    id : string;
    name : string;
    cards : Card[];
}

export type Card = {
    id : string;
    title : string;
    description? : string;
}

