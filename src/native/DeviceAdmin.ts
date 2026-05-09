import { NativeModules } from 'react-native';
const { DeviceAdmin } = NativeModules;
export default {
  isActive: (): Promise<boolean> => DeviceAdmin.isActive(),
  requestActivation: (reason: string): Promise<boolean> => DeviceAdmin.requestActivation(reason),
  lockNow: (): Promise<boolean> => DeviceAdmin.lockNow(),
};
