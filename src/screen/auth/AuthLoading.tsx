import React, {useEffect} from 'react';
// import firebase from 'react-native-firebase';
import auth from "@react-native-firebase/auth";
import {useNavigation} from "react-navigation-hooks";
import {useDispatch} from "react-redux";
import {openCameraAction} from "../../actions/camera";

const AuthLoading = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const openCamera = () => dispatch(openCameraAction());

    useEffect(() => {
        auth().signInAnonymously();
    }, [])

    useEffect(() => {
        auth().onAuthStateChanged(user => {
            if (user) {
                navigation.navigate('App');
                openCamera();
            } else {
                navigation.navigate('Auth');
            }
        });
    }, []);
    return null;
};
export default AuthLoading;
