import React from "react";
import {Image, PixelRatio, StyleSheet, TouchableOpacity, View, Text, Switch, AsyncStorage} from "react-native";
import {arrowLeftIcon} from "../constants/images";
import {bgColor} from "../constants/colors";
import {useState} from "react";
import {useEffect} from "react";
import {Keys} from "../constants/keys";
import {useNavigation} from "react-navigation-hooks";
import {useActions} from "../hooks/actions";
import useTranslation from "../hooks/useTranslation";

const Settings = () => {

    const navigation = useNavigation();
    const [save, setSave] = useState(false);
    const [allowNotification, setAllowNotification] = useState(false);
    const {formatMessage: f} = useTranslation();

    const {storeAPNSToken, deleteAPNSToken} = useActions();
    const readLocalStorage = async () => {
        try {
            const saveLocal = await AsyncStorage.getItem(Keys.saveLocal);
            setSave(saveLocal === "true");
        } catch (error) {
            console.log(error);
        }
    };

    const readNotificationValue = async () => {
        try {
            const value = await AsyncStorage.getItem(Keys.allowNotification);
            setAllowNotification(value === "true");
        } catch (error) {
            console.log(error);
        }
    };

    const setSaveLocal = async (val: boolean) => {
        try {
            setSave(val);
            await AsyncStorage.setItem(Keys.saveLocal, String(val));
        } catch (error) {
            console.log(error);
        }
    };

    const setNotification = async (val: boolean) => {
        try {
            setAllowNotification(val);
            await AsyncStorage.setItem(Keys.allowNotification, String(val));
            if (val) {
                storeAPNSToken();
            } else {
                deleteAPNSToken();
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        readLocalStorage().then();
        readNotificationValue().then();
        navigation.setParams({
            headerTitle: f({id: "settings.title"}),
        });
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.item}>
                <Text style={styles.text}>{f({id: "settings.storePhoto"})}</Text>
                <Switch value={save} onValueChange={setSaveLocal}/>
            </View>
            <View style={styles.item}>
                <Text style={styles.text}>{f({id: "settings.notification"})}</Text>
                <Switch value={allowNotification} onValueChange={setNotification}/>
            </View>
        </View>
    );
};

Settings.navigationOptions = ({navigation}: { navigation: any }) => {
    return {
        title: navigation.getParam("headerTitle"),
        headerTitleStyle: {
            fontSize: 20,
        },
        headerStyle: {
            borderBottomWidth: 1 / PixelRatio.get(),
            borderBottomColor: "#ecf0f1"
        },
        headerLeft: (
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image style={{marginLeft: 24}} source={arrowLeftIcon}/>
            </TouchableOpacity>
        )
    }
};

export default Settings;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: bgColor,
        paddingHorizontal: 8
    },
    item: {
        height: 52,
        marginTop: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 10,
        backgroundColor: "white",
        paddingHorizontal: 16,
        shadowOffset: {width: 0, height: 2,},
        shadowRadius: 3,
        shadowColor: 'black',
        shadowOpacity: 0.13,
        elevation: 2
    },
    text: {
        fontSize: 16,
        color: "rgba(0, 0, 0, 0.7)",
        fontWeight: "500",
        lineHeight: 19
    }
});
