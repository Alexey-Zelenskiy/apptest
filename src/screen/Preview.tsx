import React from "react";
import {FlashMode} from "react-native-camera";
import {acceptIcon, backIcon} from "../constants/images";
import {Image} from "react-native";
import {View, TouchableOpacity} from "react-native";

const Preview = () => {
    return (
        <View style={{flex: 1}}>

        </View>
    );
};

Preview.navigationOptions = ({navigation}: { navigation: any }) => {
    return {
        headerTransparent: true,
        headerLeft: (
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image style={{marginLeft: 24}} source={backIcon}/>
            </TouchableOpacity>
        ),
        headerRight: (
            <TouchableOpacity onPress={() => navigation.getParam("toggleFlashHandler")?.()}>
                <Image style={{marginRight: 24}} source={acceptIcon}/>
            </TouchableOpacity>
        )
    }
};

export default Preview;
