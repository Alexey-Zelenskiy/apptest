import {combineReducers} from "redux";

import check, {CheckState} from "./check";
import camera, {CameraState} from "./camera";
import app, {AppState} from "./app";

export interface RootState {
    check: CheckState
    camera: CameraState,
    app: AppState
}

export default combineReducers({check, camera, app})
