import {usersColor} from "../../constants/colors";
import React, { useEffect } from "react";
import {StyleSheet, View, Text, Image} from "react-native";
import {useSelector} from "react-redux";
import {RootState} from "../../reducers";
import {userIcon} from "../../constants/images";
import { CameraState } from "../../reducers/camera";
import { useCallback } from "react";
import { getUniqueId } from "react-native-device-info";
import { loadData } from "../../api";

interface Props {
    userUid: string;
    price: number | string | null
}

const CirclePrice = ({userUid, price}: Props) => {

    const users = useSelector((state: RootState) => state.check.users);
	const fcmToken = useSelector((state: CameraState) => state.fcm);
	const geo = useSelector((state: CameraState) => state.geo);
    const items = useSelector((state: RootState) => state.check.items);
    const content = price ? <Text style={styles.priceText}>{price}</Text> : <Image source={userIcon}/>;
    const user = users.find(user => user.uid === userUid);
    const history = useSelector((state: RootState) => state.check.history);


    if (!user) return null;
    const widthStyle: { width?: number } = {};
    if (price === null) widthStyle.width = 24;

    return (
        <View style={[styles.circle, {backgroundColor: usersColor.getColor(user.index)}, widthStyle]}>
            {content}
        </View>
    )
};

const styles = StyleSheet.create({
    circle: {
        height: 28,
        minWidth: 28,
        backgroundColor: "#FFBF00",
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
        paddingHorizontal: 8,
        paddingVertical: 4
    },
    circleText: {
        fontSize: 14,
        lineHeight: 17,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    priceText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
    }
});

export default CirclePrice;
