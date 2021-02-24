import React, {useState} from 'react';
import {
	Text,
	View,
	Alert,
	KeyboardAvoidingView,
	ActivityIndicator, StyleSheet,
	TextInput
} from 'react-native';

// import firebase from 'react-native-firebase';
import auth from "@react-native-firebase/auth";
import {Image, TouchableOpacity} from "react-native";
import {AccessToken, LoginManager} from 'react-native-fbsdk';
import {logoIcon} from "../../constants/images";
import {useActions} from "../../hooks/actions";
import useTranslation from "../../hooks/useTranslation";
import {useNavigation} from "react-navigation-hooks";

const SignIn = () => {

	const navigation = useNavigation();

	const {storeAuth} = useActions();
	const {formatMessage: f} = useTranslation();
	const [password, setPassword] = useState('');
	const [email, setEmail] = useState('');

	const login = async () => {
		if (email.length === 0) {
			return Alert.alert(f({id: ""}), f({id: "alert.needEmail"}));
		}
		if (password.length === 0) {
			return Alert.alert(f({id: "alert.error"}), f({id: "alert.needPassword"}));
		}
		try {
			const userCredential = await auth().signInWithEmailAndPassword(email, password);
			storeAuth(userCredential.user.toJSON());
			setEmail("");
			setPassword("");
		} catch (err) {
			const error = err as any;
			if (error.code === "auth/user-not-found") {
				await register();
			} else {
				Alert.alert(error.code);
			}
		}
	};

	const register = async () => {

		try {
			const userCredential = await auth().createUserWithEmailAndPassword(email, password);
			storeAuth(userCredential.user.toJSON());
		} catch (err) {
			const error = err as any;
			if (error.code === "auth/weak-password") {
				Alert.alert(f({id: "alert.needStrongPassword"}));
			} else {
				Alert.alert(err.message);
			}
		}
	};
	// Calling the following function will open the FB login dialogue:
	const facebookLogin = async () => {
		try {
			const result = await LoginManager.logInWithPermissions([
				'public_profile',
				'email',
			]);
			if (result.isCancelled) return;
			const data = await AccessToken.getCurrentAccessToken();
			if (!data) {
				return Alert.alert('Something went wrong obtaining the users access token');
			}
			const credential = auth.FacebookAuthProvider.credential(data.accessToken);
			const firebaseUserCredential = await auth().signInWithCredential(credential);
			storeAuth(firebaseUserCredential.user.toJSON());
		} catch (err) {
			Alert.alert(err.message);
		}
	};

	const anonymousLogin = async () => {
		const credential = await auth().signInAnonymously();
		console.log("credential", credential);
	}

	const resetPassword = () => {
		navigation.navigate('ResetPassword');
	}
	return (
		<KeyboardAvoidingView style={styles.containerView} behavior="padding">
			<View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
				<Image source={logoIcon}/>
				<View style={{marginTop: 20}}>
					<Text style={styles.text1}>{f({id: "splitCheck"})}</Text>
					<Text style={styles.text1}>
						<Text style={styles.text2}>{f({id: "fast"})}</Text> {f({id: "and"})} <Text
						style={styles.text3}>{f({id: "simple"})}</Text>
					</Text>
				</View>
				<View style={styles.textInputs}>
					<View style={styles.inputRow}>
						<TextInput placeholder={f({id: "auth.email*"})} placeholderTextColor="#787993"
						           value={email}
						           style={styles.textInput}
						           keyboardType={"email-address"}
						           onChangeText={text => setEmail(text)}/>
					</View>
					<View style={[styles.inputRow, {marginTop: 40}]}>
						<TextInput placeholder={f({id: "auth.password*"})} placeholderTextColor="#787993"
						           value={password}
						           style={styles.textInput}
						           secureTextEntry={true}
						           onChangeText={text => setPassword(text)}/>
					</View>
				</View>
				<View style={{marginTop: 40}}>
					<TouchableOpacity style={[styles.button, styles.emailColor]} onPress={login}>
						<Text style={styles.emailText}>{f({id: "auth.logInEmail"})}</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.button, styles.emailColor]} onPress={anonymousLogin}>
						<Text style={styles.emailText}>{f({id: "auth.no-account"})}</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.forgetPassword} onPress={resetPassword}>
						<Text style={{color: "#2F61D5"}}>Forget your password?</Text>
					</TouchableOpacity>
				</View>
			</View>
		</KeyboardAvoidingView>
	);
};
SignIn.navigationOptions = {
	header: null,
};

export default SignIn;

export const styles = StyleSheet.create({
	containerView: {
		flex: 1,
	},
	text1: {
		fontWeight: "500",
		fontSize: 18,
		lineHeight: 24,
		color: "#787993",
		textAlign: "center"
	},
	text2: {
		fontWeight: "bold",
		fontSize: 18,
		lineHeight: 24,
		color: "#4464EC",
	},
	text3: {
		fontWeight: "bold",
		fontSize: 18,
		lineHeight: 24,
		color: "#01DDF4"
	},
	button: {
		marginBottom: 16,
		width: 311,
		height: 43,
		borderRadius: 23,
		alignItems: "center",
		justifyContent: "center"
	},
	emailColor: {
		backgroundColor: "#f0f0f1",
	},
	facebookColor: {
		backgroundColor: "#d5dff7",
	},
	emailText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#787993"
	},
	facebookText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#2F61D5"
	},
	textInputs: {
		marginTop: 64,
		marginHorizontal: 32
	},
	hintStyle: {
		fontWeight: "500",
		fontSize: 16,
		lineHeight: 19,
		color: "#787993"
	},
	inputRow: {
		flexDirection: "row",
	},
	textInput: {
		color: "#787993",
		width: "100%",
		borderBottomWidth: 1,
		borderColor: "#DFDFE4",
		paddingBottom: 10
	},
	forgetPassword: {
		height: 50,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center"
	}
});
