import React, {useEffect} from 'react';
import {
  Image,
  StyleSheet,
  View,
  Text,
  ShareContent,
  Share,
  PixelRatio,
  TouchableOpacity,
} from 'react-native';
import {arrowLeftIcon, logo2Icon} from '../constants/images';
import Rate from 'react-native-rate';
import DeviceInfo from 'react-native-device-info';
import {Linking} from 'react-native';
import {useNavigation} from 'react-navigation-hooks';
import useTranslation from '../hooks/useTranslation';

const About = () => {
  const navigation = useNavigation();
  const {formatMessage: f} = useTranslation();

  useEffect(() => {
    navigation.setParams({
      headerTitle: f({id: 'about.title'}),
    });
  }, []);

  const goRate = () => {
    const options = {
      AppleAppID: '1541144004',
      preferInApp: false,
      openAppStoreIfInAppFails: true,
    };
    Rate.rate(options, success => {
      console.log(success);
    });
  };

  const share = async () => {
    const content: ShareContent = {
      title: f({id: 'share.title'}),
      message: 'https:/apps.apple.com/ru/app/id1541144004',
    };
    await Share.share(content);
  };

  const openSuggestEmail = async () => {
    const subject = f({id: 'about.suggest'});
    await Linking.openURL(`mailto:biller.bar@gmail.com?subject=${subject}`);
  };

  const openReportEmail = async () => {
    const subject = f({id: 'about.report'});
    await Linking.openURL(`mailto:biller.bar@gmail.com?subject=${subject}`);
  };

  return (
    <View style={styles.container}>
      <Image source={logo2Icon} />
      <Text style={styles.versionText}>
        {f({id: 'about.version'})} {DeviceInfo.getVersion()}
      </Text>
      <View style={{marginTop: 24, alignItems: 'center'}}>
        <TouchableOpacity style={styles.button} onPress={goRate}>
          <Text style={styles.buttonText}>{f({id: 'about.estimate'})}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={share}>
          <Text style={styles.buttonText}>{f({id: 'about.share'})}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={openSuggestEmail}>
          <Text style={styles.buttonText}>{f({id: 'about.suggest'})}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={openReportEmail}>
          <Text style={styles.buttonText}>{f({id: 'about.report'})}</Text>
        </TouchableOpacity>
        <Text
          style={styles.politics}
          onPress={() => Linking.openURL('https://www.biller.bar')}>
          {f({id: 'about.privacy'})}
        </Text>
        <Text style={styles.tag}>@Biller</Text>
      </View>
    </View>
  );
};

export default About;

About.navigationOptions = ({navigation}: {navigation: any}) => {
  return {
    title: navigation.getParam('headerTitle'),
    headerTitleStyle: {
      flex: 1,
      fontSize: 20,
    },
    headerStyle: {
      borderBottomWidth: 1 / PixelRatio.get(),
      borderBottomColor: '#ecf0f1',
    },
    headerLeft: (
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Image style={{marginLeft: 24}} source={arrowLeftIcon} />
      </TouchableOpacity>
    ),
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  versionText: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 24,
    marginTop: 17,
    color: '#787993',
  },
  button: {
    marginTop: 16,
    width: 311,
    height: 43,
    backgroundColor: '#F0F0F1',
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#787993',
    fontWeight: 'bold',
  },
  politics: {
    marginTop: 100,
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 24,
    color: '#4464EC',
  },
  bottom: {
    position: 'absolute',
    bottom: 29,
  },
  tag: {
    fontSize: 18,
    color: '#787993',
    lineHeight: 24,
    marginTop: 7,
  },
});
