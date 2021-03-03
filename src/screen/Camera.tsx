import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
	StyleSheet,
	View,
	Image,
	Text,
	Alert,
	Modal,
	TouchableOpacity,
	Platform,
	Dimensions, PermissionsAndroid,
} from 'react-native';
import {RNCamera, FlashMode} from 'react-native-camera';
import {acceptIcon, backIcon, flashOffIcon, flashOnIcon, galleryIcon, takePhotoIcon} from "../constants/images";
import {useDispatch, useSelector} from 'react-redux';
import {
	sendPhotoAction,
	setCameraProcessingAction,
	setFcm,
	storeOriginPhotoAction,
	storePhotoAction,
	setGeo,
} from "../actions/camera";
import {RootState} from "../reducers";
import {ActivityIndicator, Dialog} from "react-native-paper";
import {useNavigation} from "react-navigation-hooks";
import {Routes} from "../navigation/routes";
import CameraRoll from "@react-native-community/cameraroll";
import AsyncStorage from "@react-native-community/async-storage";
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';

const {height, width} = Dimensions.get('window');

// @ts-ignore
import AmazingCropper from 'react-native-amazing-cropper';
import {readFile} from "react-native-fs";

import {Keys} from "../constants/keys";
import {SafeAreaView} from "react-navigation";
import CropBottomPanel from "../components/cropBottomPanel/CropBottomPanel";
import useTranslation from "../hooks/useTranslation";
import {storeGeoAction} from "../actions/storage";
import Geolocation from "react-native-geolocation-service";
import {PERMISSIONS, request, check} from "react-native-permissions";
import {getUniqueId} from "react-native-device-info";
import {loadData} from "../api";
import messaging from "@react-native-firebase/messaging";
import axios from 'axios';
import { setOrder } from '../actions/check';


interface ImageSize {
	width: number,
	height: number;
}

const Camera = () => {
	const buttonDisable = useRef<boolean>(false);

	const [step, setStep] = useState(0);
	const [flashMode, setFlashMode] = useState(RNCamera.Constants.FlashMode.off);
	const [showPreview, setShowPreview] = useState(false);
	const [previewUri, setPreviewUri] = useState<string | null>(null);
	const [showCropper, setShowCropper] = useState(false);
	const [photoUri, setPhotoUri] = useState<string | null>(null);
	const [imageSize, setImageSize] = useState<ImageSize | null>(null);

	const navigation = useNavigation();
	const dispatch = useDispatch();
	const startProcessing = () => dispatch(setCameraProcessingAction(true));
	const stopProcessing = () => dispatch(setCameraProcessingAction(false));
	const sendPhoto = (uri: string) => dispatch(sendPhotoAction(uri));
	const storePhoto = (base64: string) => dispatch(storePhotoAction(base64));
	const storeGeo = (data: Object) => dispatch(storeGeoAction(data));
	const users = useSelector((state: RootState) => state.check.users);
	const {formatMessage: f} = useTranslation();
	const items = useSelector((state: RootState) => state.check.items);
	const orderIdSet = (order_id: any) =>
	dispatch(setOrder(order_id));
  const usersItemsList = useSelector(
    (state: RootState) => state.check.usersItemsList,
  );
	const isProcessing = useSelector((state: RootState) => state.camera.isProcessing);
	const isUploading = useSelector((state: RootState) => state.camera.isUploading);

	const [permission, setPermission] = useState<boolean>(false);
	const [requestLoad, setRequest] = useState<boolean>(false);


	useEffect(() => {
		if (!isUploading) {
			setPhotoUri(null);
		}
	}, [isUploading]);

	useEffect(() => {
		if (!isUploading) {
			setStep(step + 1);
		} else if(isUploading && requestLoad) {
			setStep(step + 1)
		}
	}, [isUploading, requestLoad]);

	useEffect(() => {
		if (step === 3) {
			navigation.navigate(Routes.Check);
		}
	}, [step]);

	const toggleFlashMode = () => {
		setFlashMode(flashMode === RNCamera.Constants.FlashMode.on
			? RNCamera.Constants.FlashMode.off
			: RNCamera.Constants.FlashMode.on)
	};

	useEffect(() => {
		navigation.setParams({toggleFlashHandler: toggleFlashMode, flashMode})
	}, [flashMode]);


	useEffect(()=>{
		if(items.size && !requestLoad){
			const formData = new FormData();
			const data = 	`{\"uid\":"${getUniqueId()}" , \"fcm\" :"${fcm}", \"amount\":"${items.reduce((a, b) => a + b.price, 0)}" , \"coords\" : ${JSON.stringify(`${geoloc?.lat}, ${geoloc?.lon}`)}, \"positions\" : ${JSON.stringify(items.map((check) => JSON.stringify({name: check.text, amount: check.price, count: check.count, friends: `${JSON.stringify(users?.map((item, index) => {
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
				orderIdSet(res.data?.order_id)
			});
			setRequest(true);
		}
	},[items, users, usersItemsList, requestLoad])

	const [externalStorage, setExternalStorage] = useState<any>(undefined)

	const setToken = (token: any) => dispatch(setFcm(token));
	const setGeoloc = (geo: any) => dispatch(setGeo(geo));
	const [fcm, setFcmToken] = useState<any>(undefined);
	const [geoloc, setGeolocat] = useState<any>(undefined);

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

  const requestLocationsPermission = async () => {
		await Geolocation.getCurrentPosition(
			async position => {
				setGeolocat({lat: position.coords.latitude, lon: position.coords.longitude})
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
		requestLocationsPermission().then();
	},[])


	const camera = useRef<RNCamera | null>(null);

	const takePhoto = async () => {
		if (!camera.current || buttonDisable.current) return;
		buttonDisable.current = true;
		startProcessing();
		const options = {
			skipProcessing: true,
			forceUpOrientation: true
		};
	
		const {uri, width, height} = await camera.current.takePictureAsync(options);
		const newFile = await ImageResizer.createResizedImage(uri, 1000, 1000, 'JPEG', Platform.OS === "ios" ? 0.5 : 50);
		const ext = newFile.name?.split('.')?.pop()?.toLowerCase() || "jpg";
		const save = await AsyncStorage.getItem(Keys.saveLocal);
		if (save === "true") {
			if (Platform.OS === "android") {
				const res = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
				if (res === "granted") {
					await CameraRoll.save(uri);
				}
			} else {
				await CameraRoll.save(uri);
			}
		}
		stopProcessing();
		const base64 = await readFile(newFile.uri, "base64");
		setPreviewUri(uri);
		setImageSize({width: width, height: height});
		setShowCropper(true);
		storePhoto(`data:image/${ext};base64,${base64}`);
		buttonDisable.current = false;
	};

	const saveGeo = async () => {
		try {
			await Geolocation.getCurrentPosition(
				(position) => {
					console.log("position", position);
					storeGeo(position.coords);
					setGeoloc(`lat: ${
						position.coords.latitude
					}, long:${position.coords.longitude}`);
				},
				(error) => {
					console.log(error.code, error.message);
				},
				{enableHighAccuracy: true, timeout: 5000, maximumAge: 10000}
			);
		} catch (e) {
			console.log(e)
		}
	};

	const choiceFileFormGallery = () => {
		try {
			ImagePicker.launchImageLibrary({}, async (response) => {
				if (response.didCancel) return;
				const newFile = await ImageResizer.createResizedImage(response.uri, 5000, 5000, 'JPEG', Platform.OS === "ios" ? 0.5 : 50);
				const base64 = await readFile(newFile.uri, "base64");
				const ext = newFile.name?.split('.')?.pop()?.toLowerCase() || "jpg";
				storePhoto(`data:image/${ext};base64,${base64}`);
				setPreviewUri(response.uri);
				setImageSize({width: response.width, height: response.height});
				setShowCropper(true);
			});
		} catch (error) {
			Alert.alert("Error", error.message);
		}
	};

	const acceptImage = async (uri: string) => {
		setPhotoUri(uri);
		const newFile = await ImageResizer.createResizedImage(uri, 5000, 5000, 'JPEG', Platform.OS === "ios" ? 0.7 : 70);
		setShowCropper(false);
		sendPhoto(newFile.uri);
		await saveGeo();
	}


	const renderCropModal = () => {
		if (imageSize === null) return;
		return (
			<Modal visible={showCropper} animationType="slide" presentationStyle="overFullScreen">
				<View style={{flex: 1, backgroundColor: "black"}}>
					<SafeAreaView style={{flex: 1}}>
						<AmazingCropper
							onDone={acceptImage}
							onCancel={() => setShowCropper(false)}
							footerComponent={<CropBottomPanel/>}
							imageUri={previewUri}
							imageWidth={imageSize?.width}
							imageHeight={imageSize?.height * 2}
							NOT_SELECTED_AREA_OPACITY={0.3}
							BORDER_WIDTH={20}
						/>
					</SafeAreaView>
				</View>
			</Modal>
		)
	};

	const renderPreviewModal = () => {
		return (
			<Modal visible={showPreview} animationType="slide" presentationStyle="fullScreen">
				<View style={{flex: 1, backgroundColor: "black"}}>
					<SafeAreaView style={{flex: 1}}>
						<View style={{flex: 1, position: "absolute", width: "100%", height: "100%"}}>
							{previewUri && <Image style={{flex: 1, width: "100%", height: "100%"}}
                                                  source={{uri: previewUri}} resizeMode="contain"/>}
						</View>
						<View style={styles.controlButtonsRow}>
							<View>
								<TouchableOpacity onPress={() => setShowPreview(false)}>
									<Image source={backIcon}/>
								</TouchableOpacity>
							</View>
							<View>
								<TouchableOpacity onPress={() => {
									setShowPreview(false);
									setShowCropper(true);
								}}>
									<Image source={acceptIcon}/>
								</TouchableOpacity>
							</View>
						</View>
					</SafeAreaView>
				</View>
			</Modal>
		)
	};

	const renderHorizontalLine = (percent: number) => {
		return (
			<View
				style={{
					position: "absolute",
					height: StyleSheet.hairlineWidth,
					width: "100%",
					top: height / 100 * percent,
					backgroundColor: '#FAFAFA'
				}}/>
		)
	};

	const renderVerticalLine = (percent: number) => {
		return (
			<View
				style={{
					position: "absolute",
					width: StyleSheet.hairlineWidth,
					height: height,
					left: width / 100 * percent,
					backgroundColor: '#FAFAFA'
				}}/>
		)
	};

	const renderLines = () => {
		return (
			<View>
				{renderHorizontalLine(25)}
				{renderHorizontalLine(50)}
				{renderHorizontalLine(75)}
				{renderVerticalLine(33)}
				{renderVerticalLine(66)}
			</View>
		)
	};

	const renderCameraOrPhoto = () => {
		if (photoUri !== null) {
			return (
				<View style={{flex: 1}}>
					<View style={{flex: 1, backgroundColor: "black"}}>
						{photoUri && <Image style={{flex: 1}} source={{uri: photoUri}} resizeMode="contain"/>}
					</View>
				</View>
			)
		}
		return (
			<RNCamera
				ref={camera}
				style={styles.preview}
				type={RNCamera.Constants.Type.back}
				flashMode={flashMode}
				captureAudio={false}
				androidCameraPermissionOptions={{
					title: 'Permission to use Camera',
					message: 'We need your permission to use your camera',
					buttonPositive: 'Ok',
					buttonNegative: 'Cancel',
				}}
				androidRecordAudioPermissionOptions={{
					title: 'Permission to use audio recording',
					message: 'We need your permission to use your audio',
					buttonPositive: 'Ok',
					buttonNegative: 'Cancel',
				}}>
				{renderLines()}
				<View style={styles.bottomRow}>
					<View style={{flex: 1}}/>
					<View style={{flex: 1}}>
						<TouchableOpacity onPress={takePhoto} style={styles.button} disabled={isProcessing}>
							<Image source={takePhotoIcon}/>
							{loading}
						</TouchableOpacity>
					</View>
					 <View style={{flex: 1, justifyContent: "center", alignItems: 'center'}}>
						<TouchableOpacity onPress={choiceFileFormGallery}>
							<Image source={galleryIcon}/>
						</TouchableOpacity>
					</View>
				</View>
			</RNCamera>
		)
	};

	const loading = isProcessing ? <ActivityIndicator style={{position: "absolute"}}/> : null;
	return (
		<View style={styles.container}>
			{renderPreviewModal()}
			{renderCameraOrPhoto()}
			{renderCropModal()}
			<Dialog
				visible={isUploading}>
				<Dialog.Content>
					<View style={{flexDirection: "row", alignItems: "center"}}>
						<ActivityIndicator/><Text
						style={styles.alertProcessingText}>{f({id: "modal.recognition"})}</Text></View>
				</Dialog.Content>
			</Dialog>
		</View>
	);
};

export default Camera;

Camera.navigationOptions = ({navigation}: { navigation: any }) => {
	const flashMode = (navigation.getParam("flashMode") as FlashMode) ?? RNCamera.Constants.FlashMode.on;
	const flashIcon = flashMode === RNCamera.Constants.FlashMode.on ? flashOnIcon : flashOffIcon;
	return {
		headerTransparent: true,
		headerLeft: (
			<TouchableOpacity onPress={() => navigation.goBack()}>
				<Image style={{marginLeft: 24, marginTop: 15}} source={backIcon}/>
			</TouchableOpacity>
		),
		headerRight: (
			<TouchableOpacity onPress={() => navigation.getParam("toggleFlashHandler")?.()}>
				<Image style={{marginRight: 24, marginTop: 10}} source={flashIcon}/>
			</TouchableOpacity>
		)
	}
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: 'black',
	},
	uiContainer: {
		flex: 0,
		flexDirection: 'column',
		justifyContent: 'center',
	},
	preview: {
		flex: 1,
	},
	info: {
		flex: 1,
		padding: 24,
		fontSize: 48,
		flexDirection: 'row',
		justifyContent: 'center',
	},
	capture: {
		flex: 0,
		borderRadius: 5,
		padding: 15,
		paddingHorizontal: 20,
		alignSelf: 'center',
		margin: 20,
	},
	bottomRow: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-between",
		position: "absolute",
		bottom: 50
	},
	button: {
		justifyContent: "center",
		alignItems: "center"
	},
	alertProcessingText: {
		marginLeft: 20,
		fontWeight: "bold"
	},
	controlButtonsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginHorizontal: 24,
		marginTop: 4
	}
});
