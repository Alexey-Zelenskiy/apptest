import {Action} from "redux";

export interface User {
    uid: string,
    index: number
}

export interface UserItem {
    userUid: string,
    itemUid: string
}

export interface Item {
    uid: string;
    id?: number;
    count: number;
    text: string;
    price: number;
}

export interface ParsedCheckData {
    items: Item[];
}

export interface CustomParsedRow {
    price: number;
    count: number;
    text: string;
}

export interface CustomParsedResponse {
    rows: CustomParsedRow[]
}

export interface ActionWithPayload<T> extends Action {
    payload: T;
}
