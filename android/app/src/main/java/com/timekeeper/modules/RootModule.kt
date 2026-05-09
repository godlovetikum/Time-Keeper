package com.timekeeper.modules

import com.facebook.react.bridge.*
import java.io.DataOutputStream
import java.io.File

class RootModule(ctx: ReactApplicationContext) : ReactContextBaseJavaModule(ctx) {
  override fun getName() = "Root"

  @ReactMethod
  fun isRooted(promise: Promise) {
    val paths = arrayOf(
      "/system/app/Superuser.apk", "/sbin/su", "/system/bin/su", "/system/xbin/su",
      "/data/local/xbin/su", "/data/local/bin/su", "/system/sd/xbin/su",
      "/system/bin/failsafe/su", "/data/local/su", "/su/bin/su"
    )
    promise.resolve(paths.any { File(it).exists() })
  }

  /** Attempts `su -c reboot -p`. Resolves true on success, rejects otherwise. */
  @ReactMethod
  fun powerOff(promise: Promise) {
    try {
      val p = Runtime.getRuntime().exec("su")
      val os = DataOutputStream(p.outputStream)
      os.writeBytes("reboot -p\n")
      os.writeBytes("exit\n")
      os.flush()
      val code = p.waitFor()
      if (code == 0) promise.resolve(true)
      else promise.reject("SU_FAILED", "Exit code $code")
    } catch (e: Exception) { promise.reject("NO_ROOT", e) }
  }

  @ReactMethod
  fun reboot(promise: Promise) {
    try {
      val p = Runtime.getRuntime().exec("su")
      val os = DataOutputStream(p.outputStream)
      os.writeBytes("reboot\n"); os.writeBytes("exit\n"); os.flush()
      promise.resolve(p.waitFor() == 0)
    } catch (e: Exception) { promise.reject("NO_ROOT", e) }
  }
}
