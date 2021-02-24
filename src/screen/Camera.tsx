import React, {useEffect, useState, useRef} from 'react';
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
	storePhotoAction
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
import {PERMISSIONS, request} from "react-native-permissions";
import {getUniqueId} from "react-native-device-info";
import {loadData} from "../api";
import messaging from "@react-native-firebase/messaging";


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

	const {formatMessage: f} = useTranslation();

	const isProcessing = useSelector((state: RootState) => state.camera.isProcessing);
	const isUploading = useSelector((state: RootState) => state.camera.isUploading);

	const [permission, setPermission] = useState<boolean>(false);

	const requestLocationPermission = async () => {
		try {
			const granted = Platform.OS === 'android' ? await PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.CAMERA) : await request(
				PERMISSIONS.IOS.CAMERA)
			if (granted === 'granted' || granted === PermissionsAndroid.RESULTS.GRANTED) {
				setPermission(true);
			} else {
				Alert.alert(
					'Denied',
					'The application needs access to your camera.',
					[
						{
							text: 'OK',
							onPress: async () => {
								Platform.OS === 'android'  ?
								await request(PERMISSIONS.ANDROID.CAMERA)
									.then(result => {
										setPermission(true);
										console.log(
											'PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION',
											result,
										);
									})
									.catch(error => {
										console.log(error);
									}) : await request(PERMISSIONS.IOS.CAMERA)
										.then(result => {
											setPermission(true);
											console.log(
												'PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION',
												result,
											);
										})
										.catch(error => {
											console.log(error);
										});
							},
						},
					],
					{cancelable: false},
				);
			}
		} catch (err) {
			console.warn(err);
		}
	};

	useEffect(() => {
			if (!permission) {
				requestLocationPermission().then();
		}
	}, [permission, requestLocationPermission]);

	useEffect(() => {
		if (!isUploading) {
			setPhotoUri(null);
		}
	}, [isUploading]);

	useEffect(() => {
		if (!isUploading) {
			setStep(step + 1);
		} else setStep(step + 1);
	}, [isUploading]);

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

	// const requestLocationPermission = async () => {
	// 	try {
	// 		const granted = await PermissionsAndroid.request(
	// 			PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
	// 		);
	// 		if (granted === PermissionsAndroid.RESULTS.GRANTED) {
	// 			await Geolocation.getCurrentPosition(
	// 				position => {
	// 					const formData = new FormData();
	// 					formData.append(
	// 						'data',
	// 						`{\"uid\":"${getUniqueId()}" , \"fcm\" :"${fcm}", \"positions\" : [],  \"coords\" : "${
	// 							position.coords
	// 						}"}`,
	// 					);
	// 					loadData(formData);
	// 				},
	// 				error => {
	// 					// See error code charts below.
	// 					console.log(error.code, error.message);
	// 				},
	// 				{enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
	// 			);
	// 			await PermissionsAndroid.request(
	// 				PermissionsAndroid.PERMISSIONS.CAMERA,
	// 			);
	// 		} else {
	// 			Alert.alert(
	// 				'Denied',
	// 				'The application needs access to your location.',
	// 				[
	// 					{
	// 						text: 'OK',
	// 						onPress: async () => {
	// 							await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
	// 								.then(result => {
	// 									console.log(
	// 										'PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION',
	// 										result,
	// 									);
	// 								})
	// 								.catch(error => {
	// 									console.log(error);
	// 								});
	// 						},
	// 					},
	// 				],
	// 				{cancelable: false},
	// 			);
	// 		}
	// 	} catch (err) {
	// 		console.warn(err);
	// 	}
	// };
	//
	// useEffect(() => {
	// 	if(Platform.OS === 'android'){
	// 		requestLocationPermission().then();
	// 	}
	// }, []);


	const [externalStorage, setExternalStorage] = useState<any>(undefined)

	useEffect(()=>{
		Platform.OS === 'android' ?
			request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE)
				.then(result => {
					console.log('PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE', result);
					setExternalStorage(result)
				})
				.catch(error => {
					console.log(error);
				}) : request(PERMISSIONS.IOS.PHOTO_LIBRARY)
				.then(result => {
					console.log('PERMISSIONS.IOS.PHOTO_LIBRARY', result);
					setExternalStorage(result)
				})
				.catch(error => {
					console.log(error);
				})
	},[])

	const setToken = (token: any) => dispatch(setFcm(token));

	const [fcm, setFcmToken] = useState<any>(undefined);

	const getFcmToken = async () => {
		const fcmToken = await messaging().getToken();
		if (fcmToken) {
			console.log(fcmToken)
			setToken(fcmToken);
			setFcmToken(fcmToken);
			const formData = new FormData();
			formData.append(
				'data',
				`{\"uid\":"${getUniqueId()}" , \"fcm\" :"${fcmToken}", \"positions\" : []}`,
			);
			await loadData(formData);
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

	useEffect(() => {
		requestUserPermission().then();
	}, []);

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
					const formData = new FormData();
					formData.append("data", `{\"uid\":"${getUniqueId()}" , \"fcm\" :"", \"positions\" : [],  \"coords\" : "${position.coords}"}`);
					loadData(formData);
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
		if(externalStorage !== 'denied' || externalStorage !== 'blocked'){
			ImagePicker.launchImageLibrary({}, async (response) => {
				if (response.didCancel || response.error) return;
				const newFile = await ImageResizer.createResizedImage(response.uri, 1000, 1000, 'JPEG', Platform.OS === "ios" ? 0.5 : 50);
				const base64 = await readFile(newFile.uri, "base64");
				const ext = newFile.name?.split('.')?.pop()?.toLowerCase() || "jpg";
				storePhoto(`data:image/${ext};base64,${base64}`);
				setPreviewUri(response.uri);
				setImageSize({width: response.width, height: response.height});
				setShowCropper(true);
			});
		}
	}

	const acceptImage = async (uri: string) => {
		setPhotoUri(uri);
		const newFile = await ImageResizer.createResizedImage(uri, 5000, 5000, 'JPEG', Platform.OS === "ios" ? 0.7 : 70);
		setShowCropper(false);
		sendPhoto(newFile.uri);
		saveGeo();
	};

	const renderCropModal = () => {
		if (imageSize === null) return;
		return (
			<Modal visible={showCropper} animationType="slide" presentationStyle="fullScreen">
				<View style={{flex: 1, backgroundColor: "black"}}>
					<SafeAreaView style={{flex: 1}}>
						<AmazingCropper
							onDone={acceptImage}
							onCancel={() => setShowCropper(false)}
							footerComponent={<CropBottomPanel/>}
							imageUri={previewUri}
							imageWidth={imageSize?.width}
							imageHeight={imageSize?.height}
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
					message: 'We need your permission to user your camera',
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
					{externalStorage!== 'denied' && <View style={{flex: 1, justifyContent: "center", alignItems: 'center'}}>
						<TouchableOpacity onPress={choiceFileFormGallery}>
							<Image source={galleryIcon}/>
						</TouchableOpacity>
					</View>}
				</View>
			</RNCamera>
		)
	};

	const loading = isProcessing ? <ActivityIndicator style={{position: "absolute"}}/> : null;
	return (
		<View style={styles.container}>
			{renderPreviewModal()}
			{permission && renderCameraOrPhoto()}
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
