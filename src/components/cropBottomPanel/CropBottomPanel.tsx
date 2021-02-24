import React from 'react';
import {View, TouchableOpacity, Text, Platform, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-navigation';
import useTranslation from '../../hooks/useTranslation';

interface Props {
  onDone?: () => void;
  onRotate?: () => void;
  onCancel?: () => void;
}

const CropBottomPanel = (props: Props) => {
  const {formatMessage: f} = useTranslation();

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={props.onCancel} style={styles.touchable}>
          <Text style={styles.text}>{f({id: 'crop.cancel'})}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={props.onDone} style={styles.touchable}>
          <Text style={styles.text}>{f({id: 'crop.done'})}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CropBottomPanel;

const styles = StyleSheet.create({
  buttonsContainer: {
    position: 'absolute',
    bottom: 50,
    paddingHorizontal: 50,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center', // 'flex-start'
    justifyContent: 'space-between',
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
  touchable: {
    padding: 10,
  },
  rotateIcon: {
    color: 'white',
    fontSize: 26,
    ...Platform.select({
      android: {
        textShadowOffset: {width: 1, height: 1},
        textShadowColor: '#000000',
        textShadowRadius: 3,
        shadowOpacity: 0.9,
        elevation: 1,
      },
      ios: {
        shadowOffset: {width: 1, height: 1},
        shadowColor: '#000000',
        shadowRadius: 3,
        shadowOpacity: 0.9,
      },
    }),
  },
});
