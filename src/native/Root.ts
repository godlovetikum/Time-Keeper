import { NativeModules } from 'react-native';
const { Root } = NativeModules;
export default {
  isRooted: (): Promise<boolean> => Root.isRooted(),
  powerOff: (): Promise<boolean> => Root.powerOff(),
  reboot: (): Promise<boolean> => Root.reboot(),
};
