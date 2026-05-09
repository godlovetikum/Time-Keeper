package com.timekeeper.modules

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Process
import com.facebook.react.bridge.*

class UsageStatsModule(private val ctx: ReactApplicationContext) : ReactContextBaseJavaModule(ctx) {
  override fun getName() = "UsageStats"

  @ReactMethod
  fun hasPermission(promise: Promise) {
    val ops = ctx.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = ops.checkOpNoThrow(
      AppOpsManager.OPSTR_GET_USAGE_STATS,
      Process.myUid(),
      ctx.packageName
    )
    promise.resolve(mode == AppOpsManager.MODE_ALLOWED)
  }

  @ReactMethod
  fun listInstalledApps(includeSystem: Boolean, promise: Promise) {
    try {
      val pm = ctx.packageManager
      val flags = PackageManager.GET_META_DATA
      val apps = pm.getInstalledApplications(flags)
      val arr = Arguments.createArray()
      for (a in apps) {
        val isSystem = (a.flags and ApplicationInfo.FLAG_SYSTEM) != 0
        if (!includeSystem && isSystem) continue
        val launch = pm.getLaunchIntentForPackage(a.packageName) ?: continue
        val map = Arguments.createMap()
        map.putString("packageName", a.packageName)
        map.putString("label", pm.getApplicationLabel(a).toString())
        map.putBoolean("isSystem", isSystem)
        arr.pushMap(map)
      }
      promise.resolve(arr)
    } catch (e: Exception) { promise.reject("LIST_FAILED", e) }
  }

  /** Returns map { packageName: foregroundMs } between [startMs, endMs]. */
  @ReactMethod
  fun queryForegroundMs(startMs: Double, endMs: Double, promise: Promise) {
    try {
      val usm = ctx.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
      val events = usm.queryEvents(startMs.toLong(), endMs.toLong())
      val totals = HashMap<String, Long>()
      val lastResume = HashMap<String, Long>()
      val ev = UsageEvents.Event()
      while (events.hasNextEvent()) {
        events.getNextEvent(ev)
        when (ev.eventType) {
          UsageEvents.Event.MOVE_TO_FOREGROUND -> lastResume[ev.packageName] = ev.timeStamp
          UsageEvents.Event.MOVE_TO_BACKGROUND -> {
            val r = lastResume.remove(ev.packageName) ?: continue
            totals[ev.packageName] = (totals[ev.packageName] ?: 0L) + (ev.timeStamp - r)
          }
        }
      }
      // still-foreground tail
      for ((pkg, r) in lastResume) {
        totals[pkg] = (totals[pkg] ?: 0L) + (endMs.toLong() - r)
      }
      val out = Arguments.createMap()
      for ((k, v) in totals) out.putDouble(k, v.toDouble())
      promise.resolve(out)
    } catch (e: Exception) { promise.reject("QUERY_FAILED", e) }
  }

  /** Currently foreground package using last 10s of events. */
  @ReactMethod
  fun currentForegroundPackage(promise: Promise) {
    try {
      val usm = ctx.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
      val now = System.currentTimeMillis()
      val events = usm.queryEvents(now - 10_000, now)
      var pkg: String? = null
      val ev = UsageEvents.Event()
      while (events.hasNextEvent()) {
        events.getNextEvent(ev)
        if (ev.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) pkg = ev.packageName
      }
      promise.resolve(pkg)
    } catch (e: Exception) { promise.reject("FG_FAILED", e) }
  }
}
