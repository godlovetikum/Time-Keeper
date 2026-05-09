import { NativeModules } from 'react-native';
const { Overlay } = NativeModules;
export default {
  canDrawOverlays: (): Promise<boolean> => Overlay.canDrawOverlays(),
  show: (packageName: string, message: string): Promise<boolean> => Overlay.show(packageName, message),
  hide: (): Promise<boolean> => Overlay.hide(),
};
