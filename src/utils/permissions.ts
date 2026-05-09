import UsageStats from '../native/UsageStats';
import Overlay from '../native/Overlay';
import DeviceAdmin from '../native/DeviceAdmin';
import PermissionsBridge from '../native/PermissionsBridge';

export type PermissionStatus = {
  usageAccess: boolean;
  overlay: boolean;
  deviceAdmin: boolean;
};

export async function checkAll(): Promise<PermissionStatus> {
  const [usageAccess, overlay, deviceAdmin] = await Promise.all([
    UsageStats.hasPermission(),
    Overlay.canDrawOverlays(),
    DeviceAdmin.isActive(),
  ]);
  return { usageAccess, overlay, deviceAdmin };
}

export const open = PermissionsBridge;
