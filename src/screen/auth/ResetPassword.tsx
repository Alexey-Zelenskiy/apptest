import React, {useState} from 'react';
import {Image, KeyboardAvoidingView, Text, TextInput, TouchableOpacity, View, Alert} from "react-native";
import {logoIcon} from "../../constants/images";
import {styles} from "./SignedIn";
import useTranslation from "../../hooks/useTranslation";
import auth from "@react-native-firebase/auth";

const ResetPassword = () => {

	const {formatMessage: f} = useTranslation();
	const [email, setEmail] = useState('');

	const sendEmail = async () => {
		if (email.length === 0) {
			Alert.alert(f({id: "alert.needEmail"}))
			return
		}
		try {
			await auth().sendPasswordResetEmail(email)
			Alert.alert(f({id: "auth.sendReset"}))
		} catch (err) {
			Alert.alert("Reset password problem")
			console.log(err)
		}
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
				</View>
				<View style={{marginTop: 40}}>
					<TouchableOpacity style={[styles.button, styles.emailColor]} onPress={sendEmail}>
						<Text style={styles.emailText}>{f({id: "auth.resetPassword"})}</Text>
					</TouchableOpacity>
				</View>
			</View>
		</KeyboardAvoidingView>
	)
}

export default ResetPassword;
