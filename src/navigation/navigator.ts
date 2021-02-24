import {createStackNavigator} from 'react-navigation-stack';
import SignedIn from '../screen/auth/SignedIn';
import {Routes} from './routes';
import Check from '../screen/Check';
import Camera from '../screen/Camera';
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import AuthLoading from '../screen/auth/AuthLoading';
import {createDrawerNavigator} from 'react-navigation-drawer';
import Drawer from '../components/drawer/Drawer';
import History from '../screen/History';
import Settings from '../screen/Settings';
import HistoryCheck from '../screen/HistoryCheck';
import Preview from '../screen/Preview';
import About from '../screen/About';
import ResetPassword from '../screen/auth/ResetPassword';

const AuthStack = createStackNavigator({
  SignedIn,
  ResetPassword,
});

const AppStack = createStackNavigator({
  [Routes.Check]: {screen: Check},
  [Routes.Camera]: {screen: Camera},
  [Routes.History]: {screen: History},
  [Routes.Settings]: {screen: Settings},
  [Routes.HistoryCheck]: {screen: HistoryCheck},
  [Routes.Preview]: {screen: Preview},
  [Routes.About]: {screen: About},
});

const mainStack = createSwitchNavigator(
  {
    AuthLoading: AuthLoading,
    Auth: AuthStack,
  },
  {initialRouteName: 'AuthLoading'},
);

const drawer = createDrawerNavigator(
  {
    AuthLoading: AuthLoading,
    App: AppStack,
  },
  {
    drawerWidth: 290,
    initialRouteName: 'AuthLoading',
    contentComponent: Drawer,
  },
);

const Navigator = createAppContainer(drawer);

export default Navigator;
