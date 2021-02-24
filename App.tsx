/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState} from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import messaging from '@react-native-firebase/messaging';
import {configureStore} from './src/reducers/configure';
import {Provider, useDispatch} from 'react-redux';
import Geolocation from 'react-native-geolocation-service';
import {PERMISSIONS, request} from 'react-native-permissions';
import {Keys} from './src/constants/keys';
import {useEffect} from 'react';
import I18n from 'react-native-i18n';
import {Alert, Platform, PermissionsAndroid} from 'react-native';
import {requestNotifications} from 'react-native-permissions';
import 'react-native-gesture-handler';
import {AsyncStorage} from 'react-native';

import ruLocale from './src/locales/ru';
import enLocale from './src/locales/en';
import itLocale from './src/locales/it';
import Navigator from './src/navigation/navigator';
import {loadData} from './src/api';

import {getUniqueId, getManufacturer} from 'react-native-device-info';
import {setCameraProcessingAction, setFcm} from './src/actions/camera';

requestNotifications(['alert', 'sound']).then(({status, settings}) => {
  console.log(status);
});

async function bootstrap() {
  // @ts-ignore
}

bootstrap().then();
// if (Platform.OS === 'ios') {
//   messaging().registerForRemoteNotifications();
// }
// messaging().ios.registerForRemoteNotifications().then();

Icon.loadFont('AntDesign.ttf');
Icon.loadFont('Entypo.ttf');
Icon.loadFont('EvilIcons.ttf');
Icon.loadFont('Feather.ttf');
Icon.loadFont('FontAwesome.ttf');
Icon.loadFont('FontAwesome5_Brands.ttf');
Icon.loadFont('FontAwesome5_Regular.ttf');
Icon.loadFont('FontAwesome5_Solid.ttf');
Icon.loadFont('Foundation.ttf');
Icon.loadFont('Ionicons.ttf');
Icon.loadFont('MaterialIcons.ttf');
Icon.loadFont('MaterialCommunityIcons.ttf');
Icon.loadFont('SimpleLineIcons.ttf');
Icon.loadFont('Octicons.ttf');
Icon.loadFont('Zocial.ttf');

const store = configureStore();

const [locale] = I18n.currentLocale().split('-') as string[];
let messages: {[key: string]: string} = enLocale;

if (locale === 'ru') {
  messages = ruLocale;
}
if (locale === 'en') {
  messages = enLocale;
}
if (locale === 'it') {
  messages = itLocale;
}

// if (Platform.OS === 'android') {
//   request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
//     .then(result => {
//       console.log('PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION', result);
//     })
//     .catch(error => {
//       console.log(error);
//     });
// }

export const MessagesContext = React.createContext(messages);

const App = () => {
  const [fcm, setFcmToken] = useState<any>(undefined);
  const [permission, setPermission] = useState<boolean>(false);
  const initLocalStorage = async () => {
    if (!(await AsyncStorage.getItem(Keys.saveLocal))) {
      await AsyncStorage.setItem(Keys.saveLocal, 'true');
    }
    if (!(await AsyncStorage.getItem(Keys.allowNotification))) {
      await AsyncStorage.setItem(Keys.allowNotification, 'true');
    }
  };

  const getFcmToken = async () => {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
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

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setPermission(true);
        await Geolocation.getCurrentPosition(
          position => {
            const formData = new FormData();
            formData.append(
              'data',
              `{\"uid\":"${getUniqueId()}" , \"fcm\" :"${fcm}", \"positions\" : [],  \"coords\" : "${
                position.coords
              }"}`,
            );
            loadData(formData);
          },
          error => {
            // See error code charts below.
            console.log(error.code, error.message);
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
      } else {
        Alert.alert(
          'Denied',
          'The application needs access to your location.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
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
    if (Platform.OS === 'android') {
      if (!permission) {
        requestLocationPermission().then();
      }
    }
  }, [permission]);

  // useEffect(() => {
  //   if (Platform.OS === 'android') {
  //     request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
  //       .then(result => {
  //         console.log('PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION', result);
  //       })
  //       .catch(error => {
  //         console.log(error);
  //       });
  //   }
  // }, []);

  useEffect(() => {
    initLocalStorage().then();
  }, []);

  if (!permission) {
    return null;
  }

  return (
    <MessagesContext.Provider value={messages}>
      <Provider store={store}>
        <Navigator />
      </Provider>
    </MessagesContext.Provider>
  );
};

export default App;
