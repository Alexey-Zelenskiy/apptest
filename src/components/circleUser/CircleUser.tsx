import React from 'react';
import {StyleSheet, Image, TouchableOpacity} from "react-native";
import {usersColor} from "../../constants/colors";
import {useDispatch, useSelector} from 'react-redux';
import {toggleUserAction} from "../../actions/users";
import {RootState} from "../../reducers";
import {checkIcon, userIcon} from "../../constants/images";
import {storeRelationsAction} from "../../actions/storage";

interface Props {
    userUid: string;
    itemUid: string;
    value: number;
    disable?: boolean
}

const CircleUser = ({userUid, itemUid, value, disable = false}: Props) => {

    const dispatch = useDispatch();
    const toggleUser = () => dispatch(toggleUserAction(userUid, itemUid));
    const storeRelations = () => dispatch(storeRelationsAction());
    const usersItemsList = useSelector((state: RootState) => state.check.usersItemsList);

    const exists = usersItemsList.find(el => el.userUid === userUid && el.itemUid === itemUid);
    const content = exists ? <Image source={checkIcon}/> : <Image source={userIcon}/>;

    const circlePress = () => {
        if (disable) return;
        toggleUser();
        storeRelations();
    };

    return (
        <TouchableOpacity style={[styles.circle, {backgroundColor: usersColor.getColor(value)}]} onPress={circlePress}>
            {content}
        </TouchableOpacity>)
};

const styles = StyleSheet.create({
    circle: {
        backgroundColor: "#FFBF00",
        minWidth: 28,
        height: 28,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
        padding: 4
    },
    circleText: {
        fontSize: 14,
        lineHeight: 17,
        fontWeight: "600",
        color: "#FFFFFF",
    },
});

export default CircleUser
