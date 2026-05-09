import { NativeModules } from 'react-native';
const { PermissionsBridge } = NativeModules;
export default {
  openUsageAccessSettings: (): Promise<boolean> => PermissionsBridge.openUsageAccessSettings(),
  openOverlaySettings: (): Promise<boolean> => PermissionsBridge.openOverlaySettings(),
  openAccessibilitySettings: (): Promise<boolean> => PermissionsBridge.openAccessibilitySettings(),
  openBatteryOptimizationSettings: (): Promise<boolean> => PermissionsBridge.openBatteryOptimizationSettings(),
};
