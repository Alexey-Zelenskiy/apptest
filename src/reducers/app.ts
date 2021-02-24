import {ActionWithPayload} from "../types/interfaces";

export interface AppState {
    page: string;
    email: string | null;
}

const init = {
    page: "Check",
    email: null
};

export default (state: AppState = init, action: ActionWithPayload<any>): AppState => {
    switch (action.type) {
        default:
            return state;
    }
}
