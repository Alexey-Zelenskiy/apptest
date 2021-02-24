import {fork} from "@redux-saga/core/effects";
import cameraActions from "./camera";
import storageActions from "./storage";

export default function* root() {
    yield fork(cameraActions);
    yield fork(storageActions)
}
