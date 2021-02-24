import {Image, StyleSheet, Text, TouchableOpacity} from "react-native";
import React from "react";
import {
    bgSelectColor,
    bgUnSelectColor,
    iconSelectColor,
    iconUnselectColor,
    selectedText,
    unSelectedText
} from "../../constants/colors";

interface Props {
    icon: any
    text: string,
    selected: boolean,
    onPress: () => void
}

const DrawerItem = ({icon, text, selected, onPress}: Props) => {
    const bgColor = selected ? bgSelectColor : bgUnSelectColor;
    const iconColor = selected ? iconSelectColor : iconUnselectColor;
    const textColor = selected ? selectedText : unSelectedText;
    return (
        <TouchableOpacity style={[styles.item, {backgroundColor: bgColor}]} onPress={onPress}>
            <Image source={icon} style={{tintColor: iconColor}}/>
            <Text style={[styles.itemText, {color: textColor}]}>{text}</Text>
        </TouchableOpacity>
    )
};

export default DrawerItem

const styles = StyleSheet.create({
    item: {
        flexDirection: "row",
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
    }
});
