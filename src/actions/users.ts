export const ADD_USER = "ADD_USER";
export const addUserAction = () => {
    return {type: ADD_USER}
};

import {Action} from "redux";

export interface ToggleUserAction extends Action {
    payload: {
        userUid: string;
        itemUid: string;
    }
}

export const TOGGLE_USER = "TOGGLE_USER";
export const toggleUserAction = (userUid: string, itemUid: string): ToggleUserAction => {
    return {type: TOGGLE_USER, payload: {userUid, itemUid}}
};
