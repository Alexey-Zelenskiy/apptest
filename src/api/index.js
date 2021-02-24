// @flow

// import firebase from 'react-native-firebase';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import axios from 'axios';

export const upsert = (ref, value) => {
  console.log('upsert', ref, value);

  firestore()
    .runTransaction(async transaction => {
      const doc = await transaction.get(ref);

      if (!doc.exists) {
        transaction.set(ref, value);
        return value;
      }

      transaction.update(ref, value);

      return value;
    })
    .then(user => {
      console.log(`Transaction successfully committed '${value}'.`);
    })
    .catch(error => {
      console.log('Transaction failed: ', error);
    });
};

export const createEvent = async title => {
  try {
    const uid = auth().currentUser?._user?.uid;
    const ref = await firestore().collection('events');
    // console.log('ref:', ref);
    const result = await ref.add({
      userUid: uid,
      title,
      friends: [],
      date: firestore.FieldValue.serverTimestamp(),
    });
    // console.log(result);
    return result;
  } catch (err) {
    console.log(err);
  }
};
/**
 * add friend to event
 * @param uid event
 * @param friends array of friend
 * @param name friend's name
 * @returns {Promise<void>}
 */
export const addFriendToEvent = async ({uid, friends, name}) => {
  try {
    const ref = firestore()
      .collection('events')
      .doc(uid);
    await ref.set(
      {
        friends: [...friends, {name, spend: 0, uid: new Date().getTime()}],
      },
      {merge: true},
    );
  } catch (err) {
    console.log(err);
  }
};

export const addCheckToEvent = async ({uid, check}) => {
  try {
    const ref = firestore()
      .collection('events')
      .doc(uid);
    await ref.set(
      {
        check: [...check],
      },
      {merge: true},
    );
  } catch (err) {
    console.log(err);
  }
};

export const uploadImage = async ({imageBase64, eventUid}) => {
  try {
    // console.log('uploadImage');
    // console.log(eventUid);
    // console.log(imageBase64);
    const ref = firestore()
      .collection('images')
      .doc(eventUid);
    await ref.set({image: imageBase64});
  } catch (err) {
    // console.log('uploadImage:err', err);
  }
};

export const loadData = data => {
  axios
    .post('http://biller2.teo-crm.com/api/user/load', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Access-Control-Allow-Origin': '*',
      },
    })
    .then(res => res);
};

// export const saveFcmToken = ()
