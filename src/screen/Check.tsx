import React, { useEffect, useState } from 'react';
import {
	FlatList,
	Image,
	ListRenderItemInfo, PixelRatio,
	StyleSheet,
	TouchableOpacity,
	View, Share,
	LayoutChangeEvent, Platform, Alert, AsyncStorage,
} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {
	acceptIcon,
	addUserIcon,
	arrowLeftIcon,
	cameraIcon,
	delUserIcon,
	frameIcon,
	menuIcon,
	shareIcon,
	trashIcon
} from "../constants/images";
import Geolocation from 'react-native-geolocation-service';
import { v4 } from "react-native-uuid";
import { Item } from "../types/interfaces";
import { Routes } from "../navigation/routes";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from 'react-navigation-hooks';
import { RootState } from "../reducers";
import CheckItem from "../components/checkItem/CheckItem";
import CheckPanel from "../components/checkPanel/CheckPanel";
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Animated } from 'react-native';
import { Dimensions } from 'react-native';
import { useActions } from "../hooks/actions";
import { ShareContent } from 'react-native';
import { TextStyle } from 'react-native';
import useTranslation from "../hooks/useTranslation";
import moment from "moment";
import { AppState, Text } from 'react-native';
import { Keys } from "../constants/keys";
import { CameraState } from '../reducers/camera';
import { getUniqueId } from 'react-native-device-info';
import { loadData } from '../api';
import { useCallback } from 'react';
import axios from 'axios';
import { setOrder } from '../actions/check';

const {width} = Dimensions.get('window');

interface Props {
	data?: { val: string }
}

const Check = ({data}: Props) => {

	const navigation = useNavigation();
	const {addUser, deleteItem, deleteLastUser, storeUsers, storeAPNSToken, newCheck, checkLastTime} = useActions();
	const {formatMessage: f} = useTranslation();
  const likeDislike = useSelector(
    (state: RootState) => state.check.likeDislike,
  );
	const dispatch = useDispatch();
	const [scrollHeight, setScrollHeight] = useState(0);
	const [checkPanelDown, setCheckPanelDown] = useState<string | never>();
	const hist = useSelector((state: RootState) => state.check.history);
	const users = useSelector((state: RootState) => state.check.users);
	const fcmToken = useSelector((state: CameraState) => state.fcm);
	const geo = useSelector((state: CameraState) => state.geo);
	const priceAmount = useSelector((state: CameraState) => state.price);
	const items = useSelector((state: RootState) => state.check.items);
	const splitByUser = useSelector((state: RootState) => state.check.splitByUser);
	const panelHeight = useSelector((state: RootState) => state.check.panelHeight);
	const openCamera = useSelector((state: RootState) => state.camera.openCamera);
	const dataCheck = useSelector((state: RootState) => state.check.history);
	const history = navigation.getParam("history");
	const checkLastCheckTime = async () => {
		checkLastTime();
	};
	const usersItemsList = useSelector(
    (state: RootState) => state.check.usersItemsList,
  );
	const stateChanged = async (nextAppState: string) => {
		if (nextAppState === "active") {
			await checkLastCheckTime();
		}
	};

	 const [cheks, setCheks] = useState<any>();


	useEffect(() => {
		AppState.addEventListener('change', stateChanged);
		return () => AppState.removeEventListener('change', stateChanged);
	}, []);

	useEffect(() => {
		//setItems(data.items);
		storeAPNSToken();
		checkLastCheckTime().then();
	}, []);

	useEffect(() => {
		navigation.setParams({
			headerTitle: f({id: "check.header"}),
			addUserHandler: () => {
				addUser();
				storeUsers();
			},
			deleteUserHandler: () => {
				deleteLastUser();
				storeUsers();
			},
			cameraHandler: cameraIconClickHandler
		});
	}, []);

	useEffect(() => {
		navigation.setParams({
			shareHandler: shareResult
		});
	}, [items, users, splitByUser]);

	useEffect(() => {
		if (history) return;
		// navigation.navigate(Routes.Camera);
		setCheckPanelDown(v4());
	}, [openCamera]);

	const cameraIconClickHandler = () => {
		navigation.navigate(Routes.Camera);
		setCheckPanelDown(v4());
	};


	const [fcm, setFcmToken] = useState<any>(undefined);
	const [geoloc, setGeoloc] = useState<any>(undefined);

  const [checks, setChecks] = useState<any>();

	useEffect(()=>{
		if(items){
			setChecks(`{\"uid\":"${getUniqueId()}" , \"fcm\" :"${fcm}", \"amount\":"${items?.reduce((a, b) => a + b.price, 0)}" , \"coords\" : ${JSON.stringify(`${geoloc?.lat}, ${geoloc?.lon}`)}, \"positions\" : ${JSON.stringify(items.map((check) => JSON.stringify({name: check.text, amount: check.price, count: check.count, friends: `${JSON.stringify(users?.map((item, index) => {
				const exists = usersItemsList.find(
					el => el.userUid === item.uid && el.itemUid === check.uid,
				);
				if(exists){
					return index
				} else {
					return null;
				}
			}))}`, like: check.like || 0}).replace(/\[|\]/g, ''))).replace(/\\/g, '')}}`);
		}
	},[items, users, usersItemsList])

	const getFcmToken = async () => {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      setFcmToken(fcmToken);
    }
  };

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      await getFcmToken();
      console.log('Authorization status:', authStatus);
    }
  };

  const requestLocationPermission = async () => {
		await Geolocation.getCurrentPosition(
			async position => {
				setGeoloc({lat: position.coords.latitude, lon: position.coords.longitude})
			},
			error => {
				// See error code charts below.
				console.log(error.code, error.message);
			},
			{enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
		);
  };

  useEffect(()=>{
		requestUserPermission().then();
		requestLocationPermission().then();
	},[])

	const deleteItemHandler = (itemUid: string) => {
		if (Platform.OS === 'ios') {
			Alert.alert(
				f({id: "dialog.deleteItem.title"}),
				f({id: "dialog.deleteItem.text"}),
				[
					{text: f({id: "dialog.deleteItem.yes"}), onPress: () => deleteItem(itemUid)},
					{text: f({id: "dialog.deleteItem.no"}), onPress: () => console.log('Cancel Pressed')}
				],
				{cancelable: false},
			);
		}
	};

	const renderRightActions = (progress: Animated.AnimatedInterpolation, dragX: Animated.AnimatedInterpolation, itemUid: string, orderId: any) => {
		return (
			<View style={styles.swipeButton}>
				<TouchableOpacity onPress={() => {
					 deleteItem(itemUid);
					 const formData = new FormData();
					 const data = 	`{\"uid\":"${getUniqueId()}" , \"fcm\" :"${fcm}", \"amount\":"${items.reduce((a, b) => a + b.price, 0)}" , \"order_id\" : "${orderId}", \"coords\" : ${JSON.stringify(`${geoloc?.lat}, ${geoloc?.lon}`)}, \"positions\" : ${JSON.stringify(items.map((check) => JSON.stringify({name: check.text, amount: check.price, count: check.count, friends: `${JSON.stringify(users?.map((item, index) => {
						 const exists = usersItemsList.find(
							 el => el.userUid === item.uid && el.itemUid === check.uid,
						 );
						 if(exists){
							 return index
						 } else {
							 return null;
						 }
					 }))}`, like: check.like || 0}).replace(/\[|\]/g, ''))).replace(/\\/g, '')}}`
					 formData.append(
						 'data',
						 data
					 );
					 axios
					 .post('http://biller2.teo-crm.com/api/user/load', formData, {
						 headers: {
							 'Content-Type': 'multipart/form-data',
							 'Access-Control-Allow-Origin': '*',
						 },
					 }).then(res => {
					 });
				}}
				                  hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
					<Image style={styles.deleteIcon} source={trashIcon}/>
				</TouchableOpacity>
			</View>
		);
	};

	const renderListItem = ({item}: ListRenderItemInfo<Item>) => {
		return (
			<View>
				<View style={styles.substrate}/>
				<Swipeable
					renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item.uid, item.orderId)}
					containerStyle={{paddingBottom: 6, paddingTop: 3}}>
					<CheckItem item={item} geo={geoloc} history={hist} fcmToken={fcm} items={checks} users={users} usersItemsList={usersItemsList}/>
				</Swipeable>
			</View>
		)
	};

	
	const renderListHeader = () => <View style={{height: 8}}/>;
	const renderListFooter = () => <View style={{height: panelHeight + 8}}/>;

	const onLayout = ({nativeEvent: {layout: {height}}}: LayoutChangeEvent) => {
		setScrollHeight(height);
	};

	const shareResult = async () => {

		let text = "";
		items.forEach(item => {
			text = text + `${item.text} (x${item.count}) ${item.price}\n`;
		});
		const total = items.reduce((total, item) => total + item.price, 0);
		text = text + "\n";
		text = text + `${f({id: "share.total"})}: ${total.toFixed(2)}\n`;
		users.forEach(user => {
			const _items = splitByUser.get(user.uid)!;
			if (_items.count() === 0) return;
			const price = _items.reduce((price, item) => price + item.price, 0);
			text = text + "\n";
			text = text + `${f({id: "share.user"})} ${user.index + 1} — ${price.toFixed(2)} :\n`;
			_items.forEach(el => {
				text = text + `${el.text} (x${el.count}) ${el.price}\n`;
			});
		});
		const content: ShareContent = {title: f({id: "share.title"}), message: text};
		await Share.share(content);
	};

	const renderEmptyComponent = () => {
		return (
			<View style={{
				flex: 1,
				height: scrollHeight - 110,
				justifyContent: "center",
				alignItems: "center"
			}}>
				<View style={{
					width: 200, justifyContent: "center",
					alignItems: "center"
				}}>
					<Image style={{width: 125, height: 120}} source={frameIcon}/>
					<Text style={{fontSize: 18, fontWeight: "500", marginTop: 15}}>{f({id: "empty.title"})}</Text>
					<Text
						style={{
							fontSize: 16,
							fontWeight: "500",
							marginTop: 8,
							color: "#787993",
							textAlign: "center"
						}}>{f({id: "empty.description"})}</Text>
					<TouchableOpacity
						onPress={cameraIconClickHandler}
						style={{
							backgroundColor: "#D1D8EF",
							borderRadius: 23,
							width: 311,
							height: 43,
							marginTop: 16,
							justifyContent: "center",
							alignItems: "center"
						}}>
						<Text style={{
							color: "#2F61D5",
							fontSize: 16,
							fontWeight: "bold"
						}}>{f({id: "empty.button"})}</Text>
					</TouchableOpacity>
				</View>
			</View>
		)
	};

	return (
		<View style={styles.container} onLayout={onLayout}>
			<FlatList
				ListHeaderComponent={renderListHeader}
				ListFooterComponent={renderListFooter}
				ListEmptyComponent={renderEmptyComponent}
				style={{marginHorizontal: 3}}
				data={items.toArray()}
				keyExtractor={item => item.uid}
				renderItem={renderListItem}
			/>
				<CheckPanel rootHeight={scrollHeight} swipeDownSeed={checkPanelDown} fcmToken={fcmToken} items={items} users={users} usersItemsList={usersItemsList}/>
		</View>
	);
};

Check.navigationOptions = ({navigation}: { navigation: any }) => {
	const isHistory = navigation.getParam("history") || false;
	return {
		headerTitleStyle: {
			flex: 1,
			textAlign: "left",
			fontSize: 20,
		} as TextStyle,
		headerStyle: {
			borderBottomWidth: 1 / PixelRatio.get(),
			borderBottomColor: "#ecf0f1"
		},
		headerLeft: (
			<TouchableOpacity onPress={() => isHistory ? navigation.goBack() : navigation.openDrawer()}>
				<Image style={{marginLeft: 24, marginTop: 15}} source={isHistory ? arrowLeftIcon : menuIcon}/>
			</TouchableOpacity>
		),
		headerRight: (
			<View style={{flexDirection: "row", alignItems: "center", marginTop: 12.5}}>
				<TouchableOpacity style={{padding: 12}} onPress={() => {
					const handler = navigation.getParam("deleteUserHandler");
					handler && handler();
				}}>
					<Image source={delUserIcon}/>
				</TouchableOpacity>
				<TouchableOpacity style={{padding: 12}} onPress={() => {
					const handler = navigation.getParam("addUserHandler");
					handler && handler();
				}}>
					<Image source={addUserIcon}/>
				</TouchableOpacity>
				<TouchableOpacity style={{padding: 12}}
				                  onPress={() => navigation.getParam("shareHandler")?.()}>
					<Image source={shareIcon}/>
				</TouchableOpacity>
				{!isHistory &&
				<TouchableOpacity style={{padding: 12, marginRight: 12}}
				                  onPress={() => navigation.getParam("cameraHandler")?.()}>
					<Image source={cameraIcon}/>
				</TouchableOpacity>}

			</View>
		),
	}
};
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F8F6F8",
	},
	heading: {
		height: 60,
		backgroundColor: '#03A9F4',
		alignItems: 'center',
		justifyContent: 'center',
	},
	headingTest: {
		fontSize: 20,
		color: 'white',
		fontWeight: 'bold',
	},
	swipeButton: {
		width: 70,
		paddingRight: 15,
		justifyContent: "center",
		alignItems: "center"
	},
	deleteIcon: {
		width: 24,
		height: 24,
		tintColor: "white"
	},
	substrate: {
		width: width - 20,
		height: 99,
		left: 7,
		top: 3,
		position: "absolute",
		backgroundColor: "#FF473D",
		alignItems: "center",
		justifyContent: 'center',
		borderRadius: 10,
	}
});
export default Check;
