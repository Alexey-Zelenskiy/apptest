import {createStore, applyMiddleware, compose} from "redux";
import createSagaMiddleware from "redux-saga";
import rootReducer from ".";
import root from "../sagas";

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
    rootReducer,
    compose(applyMiddleware(sagaMiddleware)),
);
sagaMiddleware.run(root);

export const configureStore = () => {
    return store;
};
