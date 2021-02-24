	import React from "react";
import { StyleSheet, View, Text, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from "react-navigation";
import { cameraNewIcon, historyIcon, infoIcon, logOutIcon, settingsIcon } from "../../constants/images";
import DrawerItem from "./DrawerItem";
import { useNavigation } from "react-navigation-hooks";
import messaging from "@react-native-firebase/messaging";
import auth from "@react-native-firebase/auth";
import { useDispatch } from "react-redux";
import { Routes } from "../../navigation/routes";
import { openCameraAction } from "../../actions/camera";
import { newCheckAction } from "../../actions/storage";
import useTranslation from "../../hooks/useTranslation";

const Drawer = () => {

	const {formatMessage} = useTranslation();

	const navigation = useNavigation();
	const dispatch = useDispatch();
	const openCamera = () => dispatch(openCameraAction());
	const newCheck = () => dispatch(newCheckAction());

	const checkPage = () => {
		newCheck();
		openCamera();
		navigation.closeDrawer();
	};

	const historyPage = () => {
		navigation.navigate(Routes.History);
		navigation.closeDrawer();
	};

	const settingsPage = () => {
		navigation.navigate(Routes.Settings);
		navigation.closeDrawer();
	};

	const aboutPage = () => {
		navigation.navigate(Routes.About);
		navigation.closeDrawer();
	};

	const logOut = async () => {
		await auth().signOut();
	};

	const showToken = async () => {
		const allow: boolean = await messaging().requestPermission();
		if (!allow) return;
		const token = await messaging().getToken();
		if (token === null) return;
		//const content: ShareContent = {message: token};
		//await Share.share(content);
	};

	const email = auth().currentUser?.email;

	return (
		<SafeAreaView style={styles.container}>
			<View style={{marginTop: 22, alignItems: "center"}}>
				<DrawerItem onPress={checkPage} selected={false} icon={cameraNewIcon}
				            text={formatMessage({id: "drawer.newCheck"})}/>
				<DrawerItem onPress={historyPage} selected={false} icon={historyIcon}
				            text={formatMessage({id: "drawer.history"})}/>
				<DrawerItem onPress={settingsPage} selected={false} icon={settingsIcon}
				            text={formatMessage({id: "drawer.settings"})}/>
				<DrawerItem onPress={aboutPage} selected={false} icon={infoIcon}
				            text={formatMessage({id: "drawer.about"})}/>
			</View>
		</SafeAreaView>
	);
};

export default Drawer;

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	email: {
		marginTop: 42,
		marginLeft: 24,
		fontSize: 14,
		fontWeight: "bold",
		color: "black",
		textTransform: "uppercase"
	},
	item: {
		flexDirection: "row",
		backgroundColor: "#f0f0f1",
		height: 52,
		width: 274,
		borderRadius: 10,
		justifyContent: "flex-start",
		alignItems: "center",
		paddingLeft: 16,
		marginBottom: 8
	},
	itemText: {
		marginLeft: 15,
		fontSize: 16,
		fontWeight: "500",
		color: "rgba(0, 0, 0, 0.7)"
	}
});
