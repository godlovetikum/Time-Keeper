package com.timekeeper.modules

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class TimekeeperPackage : ReactPackage {
  override fun createNativeModules(ctx: ReactApplicationContext): List<NativeModule> = listOf(
    UsageStatsModule(ctx),
    TimerServiceModule(ctx),
    OverlayModule(ctx),
    DeviceAdminModule(ctx),
    RootModule(ctx),
    PermissionsModule(ctx),
  )
  override fun createViewManagers(ctx: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}
