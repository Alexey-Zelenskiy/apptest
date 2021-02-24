import {Action} from "redux";
import {Item} from "../types/interfaces";
import {CheckStruct} from "../reducers/check";
import {Map, List} from "immutable";

export interface DeleteItemAction extends Action {
    payload: string;
}

export const DELETE_ITEM = "DELETE_ITEM";
export const deleteItemAction = (itemUid: string): DeleteItemAction => {
    return {type: DELETE_ITEM, payload: itemUid}
};

export interface SetItemsAction extends Action {
    payload: Item[]
}

export const SET_ITEMS = "SET_ITEMS";
export const setItemsAction = (items: Item[]): SetItemsAction => {
    return {type: SET_ITEMS, payload: items}
};

export const CLEAR_ITEMS = "CLEAR_ITEMS";
export const clearItemsAction = (): Action => {
    return {type: CLEAR_ITEMS}
};

export interface ToggleFavoriteAction extends Action {
    payload: string;
}

export const TOGGLE_FAVORITE = "TOGGLE_FAVORITE";
export const toggleFavoriteAction = (itemUid: string): ToggleFavoriteAction => {
    return {type: TOGGLE_FAVORITE, payload: itemUid}
};

export interface SetPanelHeightAction extends Action {
    payload: number
}

export const SET_PANEL_HEIGHT = "SET_PANEL_HEIGHT";
export const setPanelHeightAction = (height: number): SetPanelHeightAction => {
    return {type: SET_PANEL_HEIGHT, payload: height}
};

export interface SplitItemAction extends Action {
    payload: string
}

export const SPLIT_ITEM = "SPLIT_ITEM";
export const splitItemAction = (itemUid: string): SplitItemAction => {
    return {type: SPLIT_ITEM, payload: itemUid}
};

export interface SetSplitByUserAction extends Action {
    payload: Map<string, List<Item>>;
}

export const SET_SPLIT_BY_USER = "SET_SPLIT_BY_USER";
export const setSplitByUserAction = (data: Map<string, List<Item>>): SetSplitByUserAction => {
    return {type: SET_SPLIT_BY_USER, payload: data};
};

export interface SetHistoryAction extends Action {
    payload: CheckStruct[]
}

export const SET_HISTORY = "SET_HISTORY";
export const setHistoryAction = (data: CheckStruct[]): SetHistoryAction => {
    return {type: SET_HISTORY, payload: data}
};

export interface SetCheckAction extends Action {
    payload: CheckStruct
}

export const SET_CHECK = "SET_CHECK";
export const setCheckAction = (data: CheckStruct): SetCheckAction => {
    return {type: SET_CHECK, payload: data}
};

export const RESTORE_CHECK = "RESTORE_CHECK";
export const restoreCheckAction = (): Action => {
    return {type: RESTORE_CHECK}
};

export const CLEAR_CHECK = "CLEAR_CHECK";
export const clearCheckAction = (): Action => {
    return {type: CLEAR_CHECK}
};

export interface SetLikeDislikeAction extends Action {
    payload: { uid: string, status: boolean };
}

export const SET_LIKE_DISLIKE = "SET_LIKE_DISLIKE";
export const setLikeDislikeAction = (uid: string, status: boolean): SetLikeDislikeAction => {
    return {type: SET_LIKE_DISLIKE, payload: {uid, status}}
};

export interface SetPriceActions extends Action {
    payload: { itemUid: string, price: number }
}

export const SET_PRICE = "SET_PRICE";
export const setPriceAction = (itemUid: string, price: number): SetPriceActions => {
    return {type: SET_PRICE, payload: {itemUid, price}}
};

export interface DeleteUserAction extends Action {
    payload: string;
}

export const DELETE_USER = "DELETE_USER";
export const deleteUserAction = (userUid: string): DeleteUserAction => {
    return {type: DELETE_USER, payload: userUid}
};

export const DELETE_USER_LAST = "DELETE_USER_LAST";
export const deleteLastUserAction = (): Action => {
    return {type: DELETE_USER_LAST}
};
