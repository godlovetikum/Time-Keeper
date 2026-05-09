package com.timekeeper.modules

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.*
import com.timekeeper.services.TimekeeperDeviceAdminReceiver

class DeviceAdminModule(private val ctx: ReactApplicationContext) : ReactContextBaseJavaModule(ctx) {
  override fun getName() = "DeviceAdmin"

  private fun dpm() = ctx.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
  private fun admin() = ComponentName(ctx, TimekeeperDeviceAdminReceiver::class.java)

  @ReactMethod
  fun isActive(promise: Promise) { promise.resolve(dpm().isAdminActive(admin())) }

  @ReactMethod
  fun requestActivation(reason: String, promise: Promise) {
    try {
      val i = Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN)
        .putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, admin())
        .putExtra(DevicePolicyManager.EXTRA_ADD_EXPLANATION, reason)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      ctx.startActivity(i)
      promise.resolve(true)
    } catch (e: Exception) { promise.reject("REQ_FAILED", e) }
  }

  @ReactMethod
  fun lockNow(promise: Promise) {
    try {
      if (!dpm().isAdminActive(admin())) { promise.reject("NOT_ADMIN", "Device admin not active"); return }
      dpm().lockNow(); promise.resolve(true)
    } catch (e: Exception) { promise.reject("LOCK_FAILED", e) }
  }
}
