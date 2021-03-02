import React, { useCallback } from "react";
import {Image, PixelRatio, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {arrowLeftIcon, chevronDownIcon} from "../constants/images";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import {bgColor} from "../constants/colors";
import {useSelector} from "react-redux";
import {useEffect} from "react";
import {RootState} from "../reducers";
import {CheckStruct, CheckStructFirestore} from "../reducers/check";
import {Map, List} from "immutable";
import {Item} from "../types/interfaces";
import moment from "moment";
import {useNavigation} from "react-navigation-hooks";
import {Routes} from "../navigation/routes";
import {useActions} from "../hooks/actions";
import {useState} from "react";
import {ActivityIndicator} from "react-native-paper";
import useTranslation from "../hooks/useTranslation";
import {getUniqueId, getManufacturer} from 'react-native-device-info';
import { CameraState } from "../reducers/camera";
import { loadData } from "../api";

const History = () => {

    const navigation = useNavigation();
    const {setCheck, setHistory} = useActions();
    const history = useSelector((state: RootState) => state.check.history);
    const fcmToken = useSelector((state: CameraState) => state.fcm);
    const geo = useSelector((state: CameraState) => state.geo);
    const {formatMessage: f} = useTranslation();

    const [loading, setLoading] = useState(false);

    const getTotalPrice = (items: List<Item>): number => {
        return items.reduce((price, item) => price + item.price, 0);
    };

    const getHistory = async () => {
        const user = auth().currentUser;
        const checks: CheckStruct[] = [];
        setLoading(true);
        const result = await firestore().collection("users").doc(user?.uid)
            .collection("checks").orderBy("time", "desc").get();
        for (const check of result.docs) {
            const refId = check.ref.id;
            const data = check.data() as CheckStructFirestore;
            checks.push({
                id: refId,
                items: List(data.items),
                users: List(data.users),
                likeDislike: Map(data.likeDislike),
                usersItemsList: List(data.usersItemsList),
                time: data.time,
                total: getTotalPrice(List(data.items))
            });
            setHistory(checks);
        }
        setLoading(false);
    };

    useEffect(() => {
        getHistory().then();
        navigation.setParams({
            headerTitle: f({id: "history.title"}),
        });
    }, []);

    const goToHistory = (time: string) => {
        const check = history.find(check => check.time === time);
        if (!check) return;
        setCheck(check);
        navigation.navigate(Routes.HistoryCheck, {history: true});
    };

    const renderHistory = () => {
        return history.map(check => {
            return (
                <View style={{paddingHorizontal: 2}} key={check.time}>
                    <TouchableOpacity style={styles.item} onPress={() => goToHistory(check.time)}>
                        <Text style={styles.text}>{moment(check.time).format("DD/MM/YY HH:mm")}</Text>
                        <View style={{flex: 1}}/>
                        <Text style={styles.text}>{check.total.toFixed(2)}</Text>
                        <Image style={{marginLeft: 16}} source={chevronDownIcon}/>
                    </TouchableOpacity>
                </View>
            )
        })
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator/>
            </View>
        )
    }

    return (
        <ScrollView style={styles.container}>
            {renderHistory()}
        </ScrollView>
    )
};

History.navigationOptions = ({navigation}: { navigation: any }) => {
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

export default History;

const styles = StyleSheet.create({
    container: {
        backgroundColor: bgColor,
        paddingHorizontal: 8
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: bgColor,
    },
    item: {
        height: 52,
        marginTop: 8,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 10,
        backgroundColor: "white",
        paddingHorizontal: 14,
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
