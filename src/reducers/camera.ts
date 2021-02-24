import {ActionWithPayload} from '../types/interfaces';
import {
  OPEN_CAMERA,
  OpenCameraAction,
  SET_CAMERA_PROCESSING,
  SET_CAMERA_UPLOADING,
  SET_FCM,
  SetCameraProcessingAction,
  SetCameraUploadingAction,
} from '../actions/camera';

export interface CameraState {
  isProcessing: boolean;
  isUploading: boolean;
  openCamera: string;
  fcm: string;
}

const init: CameraState = {
  isProcessing: false,
  isUploading: false,
  openCamera: '',
  fcm: '',
};

export default (state: CameraState = init, action: ActionWithPayload<any>) => {
  switch (action.type) {
    case SET_CAMERA_PROCESSING:
      return {
        ...state,
        isProcessing: (action as SetCameraProcessingAction).payload,
      };
    case SET_FCM:
      return {
        ...state,
        fcm: action.payload,
      };
    case SET_CAMERA_UPLOADING:
      return {
        ...state,
        isUploading: (action as SetCameraUploadingAction).payload,
      };
    case OPEN_CAMERA:
      return {...state, openCamera: (action as OpenCameraAction).payload};
    default:
      return state;
  }
};
