package com.timekeeper.services

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import org.json.JSONArray

/**
 * Receives the "Extend" notification action and adds 30 min (capped at 60 min)
 * to the matching timer if the user hasn't extended yet this period.
 */
class TimerActionReceiver : BroadcastReceiver() {
  companion object { const val ACTION_EXTEND = "com.timekeeper.EXTEND" }

  override fun onReceive(ctx: Context, intent: Intent) {
    if (intent.action != ACTION_EXTEND) return
    val id = intent.getStringExtra("id") ?: return
    val prefs: SharedPreferences = ctx.getSharedPreferences(TimerForegroundService.PREFS, Context.MODE_PRIVATE)
    val raw = prefs.getString("timers", null) ?: return
    val arr = JSONArray(raw)
    for (i in 0 until arr.length()) {
      val t = arr.getJSONObject(i)
      if (t.optString("id") != id) continue
      val ext = t.optJSONObject("extension") ?: org.json.JSONObject()
      if (ext.optBoolean("used", false)) return
      val added = (30L * 60_000L)
      ext.put("used", true); ext.put("addedMs", added); ext.put("extendedAt", System.currentTimeMillis())
      t.put("extension", ext); t.put("warned", false); t.put("expired", false)
      arr.put(i, t)
      prefs.edit().putString("timers", arr.toString()).apply()
      return
    }
  }
}
