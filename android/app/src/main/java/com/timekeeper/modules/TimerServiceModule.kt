package com.timekeeper.modules

import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.*
import com.timekeeper.services.TimerForegroundService

class TimerServiceModule(private val ctx: ReactApplicationContext) : ReactContextBaseJavaModule(ctx) {
  override fun getName() = "TimerService"

  @ReactMethod
  fun start(timersJson: String, promise: Promise) {
    try {
      val intent = Intent(ctx, TimerForegroundService::class.java)
      intent.putExtra("timers", timersJson)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) ctx.startForegroundService(intent)
      else ctx.startService(intent)
      promise.resolve(true)
    } catch (e: Exception) { promise.reject("START_FAILED", e) }
  }

  @ReactMethod
  fun update(timersJson: String, promise: Promise) {
    try {
      val intent = Intent(ctx, TimerForegroundService::class.java)
      intent.action = TimerForegroundService.ACTION_UPDATE
      intent.putExtra("timers", timersJson)
      ctx.startService(intent)
      promise.resolve(true)
    } catch (e: Exception) { promise.reject("UPDATE_FAILED", e) }
  }

  @ReactMethod
  fun stop(promise: Promise) {
    try {
      ctx.stopService(Intent(ctx, TimerForegroundService::class.java))
      promise.resolve(true)
    } catch (e: Exception) { promise.reject("STOP_FAILED", e) }
  }
}
