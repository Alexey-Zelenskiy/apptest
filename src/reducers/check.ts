import {ActionWithPayload, Item, User, UserItem} from "../types/interfaces";
import {Map, Set, List} from "immutable";
import {ADD_USER, TOGGLE_USER, ToggleUserAction} from "../actions/users";
import {v4} from "react-native-uuid"
import {
    CLEAR_CHECK,
    CLEAR_ITEMS,
    DELETE_ITEM,
    DELETE_USER, DELETE_USER_LAST,
    DeleteItemAction,
    DeleteUserAction,
    SET_CHECK,
    SET_HISTORY,
    SET_ITEMS,
    SET_LIKE_DISLIKE,
    SET_PANEL_HEIGHT,
    SET_PRICE, SET_SPLIT_BY_USER,
    SetCheckAction,
    SetHistoryAction,
    SetItemsAction,
    SetLikeDislikeAction,
    SetPanelHeightAction,
    SetPriceActions,
    SetSplitByUserAction,
    SPLIT_ITEM,
    SplitItemAction,
    TOGGLE_FAVORITE,
    ToggleFavoriteAction,
    SetOrderId,
    SET_ORDER_ID
} from "../actions/check";
import {NEW_CHECK} from "../actions/storage";

export interface CheckStructFirestore {
    items: Item[],
    users: User[],
    usersItemsList: UserItem[],
    likeDislike: { [key: string]: boolean }
    time: string;
    total: number;
}

export interface CheckStruct {
    id: string;
    items: List<Item>,
    users: List<User>,
    usersItemsList: List<UserItem>,
    likeDislike: Map<string, boolean>
    time: string;
    total: number;
}

export interface CheckState {
    items: List<Item>,
    users: List<User>,
    usersItemsList: List<UserItem>,
    likes: Set<string>,
    likeDislike: Map<string, boolean>;
    panelHeight: number,
    splitByUser: Map<string, List<Item>>,
    history: List<CheckStruct>,
    selectedCheckId: string | null;
}

const init: CheckState = {
    items: List(),
    users: List([{uid: v4(), index: 0}, {uid: v4(), index: 1}]),
    usersItemsList: List(),
    likes: Set(),
    likeDislike: Map(),
    panelHeight: 120,
    splitByUser: Map(),
    history: List(),
    selectedCheckId: null,
};

const addUserAction = (state: CheckState): CheckState => {
    const last = state.users.last(null);
    const index = last ? last.index + 1 : 0;
    return {...state, users: state.users.push({uid: v4(), index})}
};

const toggleUser = (state: CheckState, action: ToggleUserAction): CheckState => {
    let usersItemsList = state.usersItemsList;
    const {userUid, itemUid} = action.payload;
    if (usersItemsList.find(el => el.userUid === userUid && el.itemUid === itemUid)) {
        usersItemsList = usersItemsList.filterNot(el => el.userUid === userUid && el.itemUid === itemUid)
    } else {
        usersItemsList = usersItemsList.push({userUid, itemUid})
    }
    return {...state, usersItemsList};
};

const deleteItem = (state: CheckState, action: DeleteItemAction): CheckState => {
    let {items, usersItemsList} = state;
    items = items.filterNot(el => el.uid === action.payload);
    usersItemsList = usersItemsList.filterNot(el => el.itemUid === action.payload);
    return {...state, items, usersItemsList};
};

const setItems = (state: CheckState, action: SetItemsAction): CheckState => {
    return {...state, items: List(action.payload)};
};

const clearItems = (state: CheckState): CheckState => {
    return {...state, items: List()}
};

const toggleFavorite = (state: CheckState, action: ToggleFavoriteAction): CheckState => {
    let {likes} = state;
    likes = likes.includes(action.payload) ? likes.delete(action.payload) : likes.add(action.payload);
    return {...state, likes};
};

const setPanelHeight = (state: CheckState, action: SetPanelHeightAction): CheckState => {
    return {...state, panelHeight: action.payload}
};

const splitItem = (state: CheckState, action: SplitItemAction): CheckState => {
    const [index, item] = state.items.findEntry(item => item.uid === action.payload)!;
    const splitItems = Array(item.count).fill(item).map((item: Item) => ({
        ...item,
        uid: v4(),
        count: 1,
        price: item.price / item.count
    })) as Item[];
    const items = state.items.splice(index, 1, ...splitItems);
    return {...state, items};
};

const newCheck = (state: CheckState): CheckState => {
    const users = List([{uid: v4(), index: 0}, {uid: v4(), index: 1}]);
    return {...state, items: List(), users, usersItemsList: List(), likes: Set()}
};

const setHistory = (state: CheckState, action: SetHistoryAction): CheckState => {
    return {...state, history: List(action.payload)}
};

const setCheck = (state: CheckState, action: SetCheckAction): CheckState => {
    const {id, items, users, likeDislike, usersItemsList} = action.payload;
    return {...state, items, users, likeDislike, usersItemsList, selectedCheckId: id}
};

const clearCheck = (state: CheckState): CheckState => {
    return {
        ...state,
        items: List(),
        users: List([{uid: v4(), index: 0}, {uid: v4(), index: 1}]),
        likes: Set(),
        usersItemsList: List(),
        selectedCheckId: null,
    }
};

const setLikeDislike = (state: CheckState, action: SetLikeDislikeAction): CheckState => {
    const {uid, status} = action.payload;
    let {likeDislike, items} = state;
    if (likeDislike.has(uid) && likeDislike.get(uid)! === action.payload.status) {
        likeDislike = likeDislike.delete(uid);
    } else {
        likeDislike = state.likeDislike.set(uid, status);
    }
    items = items.map(item => {
        if(item.uid === uid){
            return {
                ...item,
                like: 1
            }
        } else {
            return {
                ...item,
            }
        }
    })
    return {...state, likeDislike, items};
};

const setOrder = (state: CheckState, action: SetOrderId): CheckState => {
    const {order_id} = action.payload;
    let {items} = state;
    items = items.map(item => {
        if(item?.orderId === order_id){
            return {
                ...item,
            }
        } else {
            return {
                ...item,
                orderId: order_id
            }
        }
    })
    return {...state, items};
};

const setPrice = (state: CheckState, action: SetPriceActions): CheckState => {
    const {itemUid, price} = action.payload;
    const items = state.items.map(item => {
        if (item.uid === itemUid) {
            return {...item, price}
        }
        return item;
    });
    return {...state, items}
};

const deleteUser = (state: CheckState, action: DeleteUserAction) => {
    if (state.users.count() === 1) return state;
    const users = state.users.filterNot(user => user.uid === action.payload);
    const usersItemsList = state.usersItemsList.filterNot(item => item.userUid === action.payload);
    return {...state, users, usersItemsList};
};

const setSplitByUser = (state: CheckState, action: SetSplitByUserAction) => {
    return {...state, splitByUser: action.payload};
};

const deleteUserLast = (state: CheckState): CheckState => {
    if (state.users.count() === 1) return state;
    const user = state.users.last()! as User;
    const users = state.users.pop();
    const usersItemsList = state.usersItemsList.filterNot(el => el.userUid === user.uid);
    return {...state, users, usersItemsList}
};

export default (state: CheckState = init, action: ActionWithPayload<any>): CheckState => {
    switch (action.type) {
        case ADD_USER:
            return addUserAction(state);
        case TOGGLE_USER:
            return toggleUser(state, action as ToggleUserAction);
        case DELETE_ITEM:
            return deleteItem(state, action as DeleteItemAction);
        case SET_ITEMS:
            return setItems(state, action as SetItemsAction);
        case CLEAR_ITEMS:
            return clearItems(state);
        case TOGGLE_FAVORITE:
            return toggleFavorite(state, action as ToggleFavoriteAction);
        case SET_PANEL_HEIGHT:
            return setPanelHeight(state, (action as SetPanelHeightAction));
        case SPLIT_ITEM:
            return splitItem(state, (action as SplitItemAction));
        case NEW_CHECK:
            return newCheck(state);
        case SET_HISTORY:
            return setHistory(state, (action as SetHistoryAction));
        case SET_CHECK:
            return setCheck(state, (action as SetCheckAction));
        case CLEAR_CHECK:
            return clearCheck(state);
        case SET_LIKE_DISLIKE:
            return setLikeDislike(state, (action as SetLikeDislikeAction));
            case SET_ORDER_ID:
            return setOrder(state, (action as SetOrderId));
        case SET_PRICE:
            return setPrice(state, (action as SetPriceActions));
        case DELETE_USER:
            return deleteUser(state, (action as DeleteUserAction));
        case SET_SPLIT_BY_USER:
            return setSplitByUser(state, (action as SetSplitByUserAction));
        case DELETE_USER_LAST:
            return deleteUserLast(state);
        default:
            return state;
    }
}
