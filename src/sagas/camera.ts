import { takeLatest, takeEvery, put, delay } from "@redux-saga/core/effects";
import { SEND_PHOTO_TO_RECOGNITION, SendPhotoAction, setCameraUploadingAction } from "../actions/camera";
import { Alert } from "react-native";
import vision, { firebase, VisionCloudTextRecognizerModelType } from '@react-native-firebase/ml-vision';
import { storeCheckAction, storeGeoAction } from "../actions/storage";
import { setItemsAction } from "../actions/check";
import { CustomParsedResponse } from "../types/interfaces";
import CustomParser from "../classes/CustomParser";
import I18n from "react-native-i18n";
import enLocale from "../locales/en";
import ruLocale from "../locales/ru";
import itLocale from "../locales/it";

const [locale] = I18n.currentLocale().split("-") as string[];
let messages: { [key: string]: string } = enLocale;

if (locale === "ru") {
	messages = ruLocale
}
if (locale === "en") {
	messages = enLocale;
}
if (locale === "it") {
	messages = itLocale;
}

function* sendPhoto(action: SendPhotoAction) {
	const data = new FormData();
	data.append('image', {
		uri: action.payload,
		type: 'image/jpeg',
		name: "Photo"
	});

	yield put(setCameraUploadingAction(true));
	try {
		const response: Response = yield fetch("http://beta2.arxip.com:8089/upload", {
			method: 'POST',
			headers: {
				'Content-Type': 'multipart/form-data'
			},
			body: data
		});
		const result: CustomParsedResponse = yield response.json();
		const {items} = CustomParser.parse(result)
		if (items.length === 0) {
			return Alert.alert(messages['no_recognized']);
		}
		yield put(setItemsAction(items));
		yield put(storeCheckAction());
		if(items.length > 0){
			yield delay(500)
			yield put(setCameraUploadingAction(false));
		}
	} catch (e) {
	} finally {
		yield delay(500)
		yield put(setCameraUploadingAction(false));
	}
}

export default function* cameraActions() {
	yield takeEvery(SEND_PHOTO_TO_RECOGNITION, sendPhoto)
}
