package com.timekeeper.modules

import android.content.Intent
import android.net.Uri
import android.provider.Settings
import com.facebook.react.bridge.*

class PermissionsModule(private val ctx: ReactApplicationContext) : ReactContextBaseJavaModule(ctx) {
  override fun getName() = "PermissionsBridge"

  private fun launch(intent: Intent, promise: Promise) {
    try {
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      ctx.startActivity(intent)
      promise.resolve(true)
    } catch (e: Exception) { promise.reject("LAUNCH_FAILED", e) }
  }

  @ReactMethod fun openUsageAccessSettings(promise: Promise) =
    launch(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS), promise)

  @ReactMethod fun openOverlaySettings(promise: Promise) =
    launch(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:${ctx.packageName}")), promise)

  @ReactMethod fun openAccessibilitySettings(promise: Promise) =
    launch(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS), promise)

  @ReactMethod fun openBatteryOptimizationSettings(promise: Promise) =
    launch(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS), promise)
}
