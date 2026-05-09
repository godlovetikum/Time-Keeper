import { AppRegistry } from 'react-native';
import App from './src/App';
import BlockedOverlay from './src/screens/BlockedOverlayScreen';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
// Headless component used by native OverlayModule
AppRegistry.registerComponent('BlockedOverlay', () => BlockedOverlay);
