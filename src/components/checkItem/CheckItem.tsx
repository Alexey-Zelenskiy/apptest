import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
} from 'react-native';
import {
  layerIcon,
  thumbsDefDownIcon,
  thumbsDefUpIcon,
  thumbsDownIcon,
  thumbsUpIcon,
} from '../../constants/images';
import React, {useState} from 'react';
import {Item} from '../../types/interfaces';
import CircleUser from '../circleUser/CircleUser';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../reducers';
import {
  setLikeDislikeAction,
  setPriceAction,
  splitItemAction,
  toggleFavoriteAction,
} from '../../actions/check';
import {storeItemsAction, storeLikesAction} from '../../actions/storage';
import {ScrollView} from 'react-navigation';
import useTranslation from '../../hooks/useTranslation';
import prompt from 'react-native-prompt-android';
import {CameraState} from '../../reducers/camera';
import {getUniqueId} from 'react-native-device-info';
import {loadData} from '../../api';
import axios from 'axios';

interface Props {
  item: Item;
  simple?: boolean;
  disable?: boolean;
  geo: any;
  history: any;
  fcmToken: any;
  items: any;
  users: any;
  usersItemsList: any;
}

export const CheckItem = ({
  item,
  simple,
  disable = false,
  geo,
  history,
  fcmToken,
  users,
  usersItemsList,
  items,
}: Props) => {
  const dispatch = useDispatch();
  const splitItem = (itemUid: string) => dispatch(splitItemAction(itemUid));
  const storeLikes = () => dispatch(storeLikesAction());
  const toggleLikeDislike = (uid: string, status: boolean) =>
    dispatch(setLikeDislikeAction(uid, status));
  const setPrice = (itemUid: string, price: number) =>
    dispatch(setPriceAction(itemUid, price));
  const storeItems = () => dispatch(storeItemsAction());
  const {formatMessage: f} = useTranslation();
  const likeDislike = useSelector(
    (state: RootState) => state.check.likeDislike,
  );

  const [moveDisable, setMoveDisable] = useState(false);

  const renderUsers = (itemUid: string, orderId: any) => {
    return users.map((user: { uid: string | number | null | undefined; index: number; }) => (
      <CircleUser
      usersItemsList={usersItemsList}
      users={users}
      geo={geo}
      items={items}
      fcmToken={fcmToken}
      orderId={orderId}
        itemUid={itemUid}
        userUid={user.uid}
        key={user.uid}
        value={user.index}
        disable={disable}
      />
    ));
  };

  const likeIcon =
    likeDislike.has(item.uid) && likeDislike.get(item.uid)
      ? thumbsUpIcon
      : thumbsDefUpIcon;
  const dislikeIcon =
    likeDislike.has(item.uid) && !likeDislike.get(item.uid)
      ? thumbsDownIcon
      : thumbsDefDownIcon;

  const _splitItem = (itemUid: string) => {
    splitItem(itemUid);
    storeItems();
  };

  const splitItemHandler = (itemUid: string) => {
    if (disable) {
      return;
    }
    Alert.alert(
      f({id: 'dialog.split.title'}),
      f({id: 'dialog.split.text'}),
      [
        {text: f({id: 'dialog.split.yes'}), onPress: () => _splitItem(itemUid)},
        {
          text: f({id: 'dialog.split.no'}),
          onPress: () => console.log('Cancel Pressed'),
        },
      ],
      {cancelable: false},
    );
  };

  const likeDislikeClick = async (
    itemUid: any,
    status: boolean,
    orderId: any,
  ) => {
    if (disable) {
      return;
    }
    toggleLikeDislike(itemUid, status);
    const formData = new FormData();
    formData.append(
      'data',
       items,
    );
    console.log(items)
    axios
    .post('http://biller2.teo-crm.com/api/user/load', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Access-Control-Allow-Origin': '*',
      },
    }).then(res => {
    });
    storeLikes();
  };

  const renderBottomRow = () => {
    if (simple) {
      return null;
    }
    return (
      <View style={styles.row}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {renderUsers(item.uid, item.orderId)}
        </ScrollView>
        <View style={{flex: 1}} />
        {item.count > 1 && !disable && (
          <TouchableOpacity onPress={() => splitItemHandler(item.uid)}>
            <Image style={styles.layerIcon} source={layerIcon} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={{marginRight: 8}}
          onPress={() =>
            likeDislikeClick(
              item.uid,
              true,
              item.orderId || undefined,
            )
          }>
          <Image source={likeIcon} style={styles.likeIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            likeDislikeClick(
              item.uid,
              false,
              item.orderId || undefined,
            )
          }>
          <Image source={dislikeIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  const changePrice = (itemUid: string, text: string) => {
    if (!isNaN(parseFloat(text))) {
      const price = parseFloat(text);
      setPrice(itemUid, price);
      storeItems();
    }
  };

  const findIfSplitByUsers = (): boolean => {
    for (const _item of usersItemsList) {
      if (_item.itemUid === item.uid) {
        return true;
      }
    }
    return false;
  };

  const changePriceHandler = (itemUid: string, val: number) => {
    if (Platform.OS === 'android') {
      prompt(
        '',
        f({id: 'dialog.price.placeholder'}),
        [
          {
            text: f({id: 'crop.cancel'}),
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {text: 'OK', onPress: text => changePrice(itemUid, text)},
        ],
        {
          type: 'numeric',
          placeholder: val.toFixed(2),
        },
      );
    } else {
      Alert.prompt(
        f({id: 'dialog.price.placeholder'}),
        '',
        text => changePrice(itemUid, text),
        'plain-text',
        val.toFixed(2),
        'numeric',
      );
    }
  };

  return (
    <View
      style={[
        styles.item,
        {backgroundColor: !findIfSplitByUsers() ? 'white' : '#CCC'},
      ]}>
      <View style={styles.row}>
        <Text numberOfLines={1} style={styles.itemTitle}>
          {item.text}
        </Text>
        <Text style={styles.countTitle}>x{item.count}</Text>
        <View
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            minWidth: 55,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginLeft: 5,
          }}>
          <TouchableOpacity
            style={styles.sumContainer}
            onPress={() => changePriceHandler(item.uid, item.price)}>
            <Text numberOfLines={1} style={styles.sumTitle}>
              {item.price.toFixed(2)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {renderBottomRow()}
    </View>
  );
};

export default CheckItem;

const styles = StyleSheet.create({
  item: {
    marginHorizontal: 6,
    paddingHorizontal: 16,
    paddingBottom: 16,
    elevation: 1,
    borderRadius: 10,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 3,
    shadowColor: 'black',
    shadowOpacity: 0.13,
  },
  row: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeIcon: {
    width: 24,
    height: 24,
  },
  itemTitle: {
    flex: 1,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.7)',
    fontSize: 16,
    lineHeight: 16,
    fontFamily: 'System',
  },
  countTitle: {
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 16,
    marginLeft: 5,
    color: 'rgba(0, 0, 0, 0.7)',
  },
  sumArea: {
    minWidth: 55,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginLeft: 5,
  },
  sumContainer: {
    backgroundColor: '#e1e6fc',
    borderRadius: 4,
    padding: 4,
  },
  sumTitle: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: 'bold',
    color: '#4464EC',
  },
  deleteIcon: {
    width: 24,
    height: 24,
  },
  layerIcon: {
    width: 24,
    height: 24,
    marginRight: 13,
  },
});
