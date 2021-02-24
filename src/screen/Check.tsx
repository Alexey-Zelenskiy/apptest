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
import { v4 } from "react-native-uuid";
import { Item } from "../types/interfaces";
import { Routes } from "../navigation/routes";
import { useSelector } from "react-redux";
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

const {width} = Dimensions.get('window');

interface Props {
	data?: { val: string }
}

const Check = ({data}: Props) => {

	const navigation = useNavigation();
	const {addUser, deleteItem, deleteLastUser, storeUsers, storeAPNSToken, newCheck, checkLastTime} = useActions();
	const {formatMessage: f} = useTranslation();

	const [scrollHeight, setScrollHeight] = useState(0);
	const [checkPanelDown, setCheckPanelDown] = useState<string | never>();

	const users = useSelector((state: RootState) => state.check.users);
	const items = useSelector((state: RootState) => state.check.items);
	const splitByUser = useSelector((state: RootState) => state.check.splitByUser);
	const panelHeight = useSelector((state: RootState) => state.check.panelHeight);
	const openCamera = useSelector((state: RootState) => state.camera.openCamera);

	const history = navigation.getParam("history");

	const checkLastCheckTime = async () => {
		checkLastTime();
	};

	const stateChanged = async (nextAppState: string) => {
		if (nextAppState === "active") {
			await checkLastCheckTime();
		}
	};

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
		navigation.navigate(Routes.Camera);
		setCheckPanelDown(v4());
	}, [openCamera]);

	const cameraIconClickHandler = () => {
		navigation.navigate(Routes.Camera);
		setCheckPanelDown(v4());
	};

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

	const renderRightActions = (progress: Animated.AnimatedInterpolation, dragX: Animated.AnimatedInterpolation, itemUid: string) => {
		return (
			<View style={styles.swipeButton}>
				<TouchableOpacity onPress={() => deleteItem(itemUid)}
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
					renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item.uid)}
					containerStyle={{paddingBottom: 6, paddingTop: 3}}>
					<CheckItem item={item}/>
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
			<CheckPanel rootHeight={scrollHeight} swipeDownSeed={checkPanelDown}/>
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
