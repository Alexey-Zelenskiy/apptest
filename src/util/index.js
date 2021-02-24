// import firebase from 'react-native-firebase';
// import {Alert} from 'react-native';
//
// export const validateEmail = email => {
//   const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//   return re.test(email);
// };
//
// const register = async ({email, password}) => {
//   try {
//     const response = await firebase
//       .auth()
//       .createUserWithEmailAndPassword(email, password);
//   } catch (err) {
//     Alert.alert(err.message);
//   }
// };
