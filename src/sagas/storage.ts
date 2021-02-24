import { takeLatest, select, put } from "@redux-saga/core/effects";
import AsyncStorage from "@react-native-community/async-storage";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import messaging from "@react-native-firebase/messaging";
import { Keys } from "../constants/keys";
import { RootState } from "../reducers";
import { Map, List } from "immutable";
import { Item, User, UserItem } from "../types/interfaces";
import {
	CHECK_LAST_TIME,
	DELETE_APNS_TOKEN,
	NEW_CHECK, STORE_APNS_TOKEN, STORE_AUTH,
	STORE_CHECK, STORE_GEO, STORE_ITEMS,
	STORE_LIKES,
	STORE_RELATIONS,
	STORE_USERS, StoreAPNSTokenAction, StoreAuthAction, StoreGeoAction
} from "../actions/storage";
import { clearCheckAction, RESTORE_CHECK, setCheckAction } from "../actions/check";
import { CheckStruct } from "../reducers/check";
import { Alert } from "react-native";
import { STORE_PHOTO, StorePhotoAction } from "../actions/camera";
import moment from "moment";

function* getLastCheck() {
	const selectedCheckId = yield select((state: RootState) => state.check.selectedCheckId);
	if (selectedCheckId) return selectedCheckId;
	let time = yield AsyncStorage.getItem(Keys.lastCheck);
	if (!time) {
		time = (new Date()).toISOString();
		yield AsyncStorage.setItem(Keys.lastCheck, time);
	}
	return time;
}

function* storeItems() {
	const user = auth().currentUser;
	const time = yield getLastCheck();
	const items: List<Item> = yield select((state: RootState) => state.check.items);
	try {
		yield firestore().collection("users").doc(user?.uid)
			.collection("checks").doc(time).update({
				items: items.toArray(),
			});
	} catch (error) {
		console.log(error);
		if (__DEV__) Alert.alert("", error.message);
	}
}

function* storeUsers() {
	const user = auth().currentUser;
	const time = yield getLastCheck();
	const users: List<User> = yield select((state: RootState) => state.check.users);
	try {
		yield firestore().collection("users").doc(user?.uid)
			.collection("checks").doc(time).update({
				users: users.toArray(),
			});
	} catch (error) {
		console.log(error);
		if (__DEV__) Alert.alert("", error.message);
	}
}

function* checkLastTime() {
	const lastTime = yield getLastCheck();
	if (lastTime) {
		const duration = moment.duration(moment().diff(lastTime));
		const minutes = duration.minutes();
		if (minutes > 120) {
			yield newCheck();
		}
	}
}

function* storeLikes() {
	const user = auth().currentUser;
	const time = yield getLastCheck();
	const likeDislike: Map<string, boolean> = yield select((state: RootState) => state.check.likeDislike);
	try {
		yield firestore().collection("users").doc(user?.uid)
			.collection("checks").doc(time).update({
				likeDislike: likeDislike.toObject(),
			});
	} catch (error) {
		console.log(error);
		if (__DEV__) Alert.alert("", error.message);
	}
}

function* storeRelations() {
	const user = auth().currentUser;
	const time = yield getLastCheck();
	const usersItemsList: List<UserItem> = yield select((state: RootState) => {
		return state.check.usersItemsList;
	});
	try {
		yield firestore().collection("users").doc(user?.uid)
			.collection("checks").doc(time).update({
				usersItemsList: usersItemsList.toArray()
			});
	} catch (error) {
		console.log(error);
		if (__DEV__) Alert.alert("", error.message);
	}
}

function* storeCheck() {
	const user = auth().currentUser;
	const time = yield getLastCheck();
	const items: List<Item> = yield select((state: RootState) => state.check.items);
	const users: List<User> = yield select((state: RootState) => state.check.users);
	const likeDislike: Map<string, boolean> = yield select((state: RootState) => state.check.likeDislike);
	const usersItemsList: List<UserItem> = yield select((state: RootState) => {
		return state.check.usersItemsList;
	});
	try {
		yield firestore().collection("users").doc(user?.uid)
			.collection("checks").doc(time).set({
				items: items.toArray(),
				time,
				users: users.toArray(),
				likeDislike: likeDislike.toObject(),
				usersItemsList: usersItemsList.toArray()
			}, {merge: true});
	} catch (error) {
		console.log(error);
		if (__DEV__) Alert.alert("", error.message);
	}
}

function* newCheck() {
	const user = auth().currentUser;
	const time = (new Date()).toISOString();
	yield AsyncStorage.setItem(Keys.lastCheck, time);
	try {
		yield firestore().collection("users").doc(user?.uid)
			.collection("checks").doc(time).set({time});
	} catch (error) {
		console.log(error);
		if (__DEV__) Alert.alert("", error.message);
	}
	yield put(clearCheckAction());
}

function* restoreCheck() {
	const time = yield getLastCheck();
	const history: List<CheckStruct> = yield  select((state: RootState) => state.check.history);
	const check = history.find(check => check.time === time);
	if (!check) return yield put(clearCheckAction());
	yield put(setCheckAction(check));
}

function* storePhoto(action: StorePhotoAction) {
	const user = auth().currentUser;
	const time = yield getLastCheck();
	try {
		yield firestore().collection("users").doc(user?.uid)
			.collection("checks").doc(time).set({
				imageBase64: action.payload
			}, {merge: true});
	} catch (error) {
		console.log(error);
		if (__DEV__) Alert.alert("", error.message);
	}
}

function* storeAuth(action: StoreAuthAction) {
	const user = auth().currentUser;
	try {
		yield firestore().collection("users").doc(user?.uid)
			.set(action.payload, {merge: true});
	} catch (error) {
		console.log(error);
		if (__DEV__) Alert.alert("", error.message);
	}
}

function* storageAPNSToken() {
	if (__DEV__) return;
	const user = auth().currentUser;
	const allow: boolean = yield messaging().requestPermission();
	if (!allow) return;
	const token: string | null = yield messaging().getToken();
	if (token === null) return;
	try {
		yield firestore().collection("users").doc(user?.uid)
			.set({APNSToken: token}, {merge: true});
	} catch (error) {
		console.log(error);
		if (__DEV__) Alert.alert("", error.message);
	}
}

function* deleteAPNSToken() {
	const user = auth().currentUser;
	try {
		yield firestore().collection("users").doc(user?.uid)
			.set({APNSToken: null}, {merge: true});
	} catch (error) {
		console.log(error);
		if (__DEV__) Alert.alert("", error.message);
	}
}

function* storeGeo(action: StoreGeoAction) {
	const user = auth().currentUser;
	const time = yield getLastCheck();
	const geo = action.payload;
	try {
		yield firestore().collection("users").doc(user?.uid)
			.collection("checks").doc(time).set({geo}, {merge: true});
	} catch (error) {
		console.log(error);
		if (__DEV__) Alert.alert("", error.message);
	}
}

export default function* storageActions() {
	yield takeLatest(STORE_ITEMS, storeItems);
	yield takeLatest(STORE_CHECK, storeCheck);
	yield takeLatest(STORE_USERS, storeUsers);
	yield takeLatest(STORE_LIKES, storeLikes);
	yield takeLatest(STORE_RELATIONS, storeRelations);
	yield takeLatest(NEW_CHECK, newCheck);
	yield takeLatest(CHECK_LAST_TIME, checkLastTime);
	yield takeLatest(RESTORE_CHECK, restoreCheck);
	yield takeLatest(STORE_PHOTO, storePhoto);
	yield takeLatest(STORE_AUTH, storeAuth);
	yield takeLatest(STORE_APNS_TOKEN, storageAPNSToken);
	yield takeLatest(DELETE_APNS_TOKEN, deleteAPNSToken);
	yield takeLatest(STORE_GEO, storeGeo);
}
