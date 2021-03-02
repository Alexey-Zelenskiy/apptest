import React from 'react';
import {StyleSheet, Image, TouchableOpacity} from 'react-native';
import {usersColor} from '../../constants/colors';
import {useDispatch, useSelector} from 'react-redux';
import {toggleUserAction} from '../../actions/users';
import {RootState} from '../../reducers';
import {checkIcon, userIcon} from '../../constants/images';
import {storeRelationsAction} from '../../actions/storage';
import {getUniqueId} from 'react-native-device-info';
import {loadData} from '../../api';
import axios from 'axios';

interface Props {
  orderId: any;
  userUid: string;
  itemUid: any;
  value: number;
  disable?: boolean;
  fcmToken: any;
  items: any;
  geo: any;
  users: any;
  usersItemsList: any;
}

const CircleUser = ({
  userUid,
  itemUid,
  value,
  disable = false,
  orderId,
  fcmToken,
  geo,
  items,
  users,
}: Props) => {
  const dispatch = useDispatch();
  const toggleUser = () => dispatch(toggleUserAction(userUid, itemUid));
  const storeRelations = () => dispatch(storeRelationsAction());
  const usersItemsList = useSelector(
    (state: RootState) => state.check.usersItemsList,
  );

  const exists = usersItemsList.find(
    el => el.userUid === userUid && el.itemUid === itemUid,
  );
  const content = exists ? (
    <Image source={checkIcon} />
  ) : (
    <Image source={userIcon} />
  );

  const circlePress = () => {
    if (disable) return;
    toggleUser();
    storeRelations();
    const formData = new FormData();
    formData.append('data', items);
    console.log(items);
    axios
      .post('http://biller2.teo-crm.com/api/user/load', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Access-Control-Allow-Origin': '*',
        },
      })
      .then(res => {});
  };

  return (
    <TouchableOpacity
      style={[styles.circle, {backgroundColor: usersColor.getColor(value)}]}
      onPress={circlePress}>
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  circle: {
    backgroundColor: '#FFBF00',
    minWidth: 28,
    height: 28,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    padding: 4,
  },
  circleText: {
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CircleUser;
