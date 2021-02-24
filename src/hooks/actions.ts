import {useDispatch} from 'react-redux';
import {
  deleteItemAction,
  deleteUserAction,
  deleteLastUserAction,
  setCheckAction,
  setHistoryAction,
  setItemsAction,
  setPanelHeightAction,
  setSplitByUserAction,
} from '../actions/check';
import {
  checkLastTimeAction,
  deleteAPNSTokenAction,
  newCheckAction,
  storeAPNSTokenAction,
  storeAuthAction,
  storeRelationsAction,
  storeUsersAction,
} from '../actions/storage';
import {CheckStruct} from '../reducers/check';
import {addUserAction} from '../actions/users';
import {Item} from '../types/interfaces';
import {Map, List} from 'immutable';

export const useActions = () => {
  const dispatch = useDispatch();

  const newCheck = () => dispatch(newCheckAction());

  const setItems = (items: Item[]) => dispatch(setItemsAction(items));
  const setPanelHeight = (height: number) =>
    dispatch(setPanelHeightAction(height));
  const setHistory = (data: CheckStruct[]) => dispatch(setHistoryAction(data));
  const setCheck = (data: CheckStruct) => dispatch(setCheckAction(data));
  const setSplitByUser = (data: Map<string, List<Item>>) =>
    dispatch(setSplitByUserAction(data));

  const addUser = () => dispatch(addUserAction());
  const checkLastTime = () => dispatch(checkLastTimeAction());

  const deleteLastUser = () => dispatch(deleteLastUserAction());
  const deleteUser = (userUid: string) => dispatch(deleteUserAction(userUid));
  const deleteItem = (itemUid: string) => dispatch(deleteItemAction(itemUid));

  const storeAuth = (user: Object) => dispatch(storeAuthAction(user));
  const storeUsers = () => dispatch(storeUsersAction());
  const storeRelations = () => dispatch(storeRelationsAction());
  const storeAPNSToken = () => dispatch(storeAPNSTokenAction());
  const deleteAPNSToken = () => dispatch(deleteAPNSTokenAction());

  return {
    newCheck,
    setItems,
    setPanelHeight,
    setHistory,
    setCheck,
    setSplitByUser,
    addUser,
    checkLastTime,
    deleteLastUser,
    deleteUser,
    deleteItem,
    storeAuth,
    storeUsers,
    storeRelations,
    storeAPNSToken,
    deleteAPNSToken,
  };
};
