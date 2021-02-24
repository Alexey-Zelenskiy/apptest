import {Action} from "redux";

export const STORE_CHECK = "STORE_CHECK";
export const storeCheckAction = (): Action => {
	return {type: STORE_CHECK}
};

export const STORE_ITEMS = "STORE_ITEMS";
export const storeItemsAction = (): Action => {
	return {type: STORE_ITEMS}
};

export const STORE_USERS = "STORE_USERS";
export const storeUsersAction = (): Action => {
	return {type: STORE_USERS}
};

export const STORE_LIKES = "STORE_LIKES";
export const storeLikesAction = (): Action => {
	return {type: STORE_LIKES}
};

export const STORE_RELATIONS = "STORE_RELATIONS";
export const storeRelationsAction = (): Action => {
	return {type: STORE_RELATIONS}
};

export const NEW_CHECK = "NEW_CHECK";
export const newCheckAction = (): Action => {
	return {type: NEW_CHECK}
};

export const GET_HISTORY = "GET_HISTORY";
export const getHistoryAction = (): Action => {
	return {type: GET_HISTORY}
};

export interface StoreAuthAction extends Action {
	payload: Object;
}

export const STORE_AUTH = "STORE_AUTH";
export const storeAuthAction = (user: Object): StoreAuthAction => {
	return {type: STORE_AUTH, payload: user}
};

export interface StoreAPNSTokenAction extends Action {
}

export const STORE_APNS_TOKEN = "STORE_APNS_TOKEN";
export const storeAPNSTokenAction = (): StoreAPNSTokenAction => {
	return {type: STORE_APNS_TOKEN}
};

export interface DeleteAPNSTokenAction extends Action {
}

export const DELETE_APNS_TOKEN = "DELETE_APNS_TOKEN";
export const deleteAPNSTokenAction = (): DeleteAPNSTokenAction => {
	return {type: DELETE_APNS_TOKEN}
};

export interface StoreGeoAction extends Action {
	payload: Object
}

export const STORE_GEO = "STORE_GEO";
export const storeGeoAction = (data: Object): StoreGeoAction => {
	return {type: STORE_GEO, payload: data}
};

export const CHECK_LAST_TIME = "CHECK_LAST_TIME";
export const checkLastTimeAction = (): Action => {
	return {type: CHECK_LAST_TIME}
};
