import {Action} from "redux";
import {v4} from "react-native-uuid";

export interface SetCameraProcessingAction extends Action {
    payload: boolean;
}

export const SET_CAMERA_PROCESSING = "SET_CAMERA_PROCESSING";
export const setCameraProcessingAction = (state: boolean): SetCameraProcessingAction => {
    return {type: SET_CAMERA_PROCESSING, payload: state}
};

export interface SetCameraUploadingAction extends Action {
    payload: boolean;
}

export const SET_CAMERA_UPLOADING = "SET_CAMERA_UPLOADING";
export const setCameraUploadingAction = (state: boolean): SetCameraUploadingAction => {
    return {type: SET_CAMERA_UPLOADING, payload: state}
};

export interface SendPhotoAction extends Action {
    payload: string;
}

export const SEND_PHOTO_TO_RECOGNITION = "SEND_PHOTO_TO_RECOGNITION";
export const sendPhotoAction = (uri: string): SendPhotoAction => {
    return {type: SEND_PHOTO_TO_RECOGNITION, payload: uri}
};

export interface OpenCameraAction extends Action {
    payload: string;
}

export interface StorePhotoAction extends Action {
    payload: string;
}

export const STORE_PHOTO = "STORE_PHOTO";
export const storePhotoAction = (base64: string): StorePhotoAction => {
    return {type: STORE_PHOTO, payload: base64}
};

export const STORE_ORIGIN_PHOTO = "STORE_ORIGIN_PHOTO";
export const storeOriginPhotoAction = (base64: string): StorePhotoAction => {
    return {type: STORE_ORIGIN_PHOTO, payload: base64}
};

export const OPEN_CAMERA = "OPEN_CAMERA";
export const openCameraAction = (): OpenCameraAction => {
    return {type: OPEN_CAMERA, payload: v4()}
};
export const SET_FCM = "SET_FCM";
export const setFcm = (fcm: string): OpenCameraAction => {
    return {type: SET_FCM, payload: fcm}
};
