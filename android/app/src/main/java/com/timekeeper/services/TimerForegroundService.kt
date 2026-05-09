package com.timekeeper.services

import android.app.*
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import com.timekeeper.R
import org.json.JSONArray
import org.json.JSONObject

/**
 * Polls UsageStatsManager every 5s, increments counters, and triggers
 * 10%-warning + expiry actions. Timer state is sourced from SharedPreferences
 * key "timers" (JSON array). The JS side keeps this pref in sync.
 */
class TimerForegroundService : Service() {

  companion object {
    const val CHANNEL_ID = "timekeeper_timers"
    const val WARN_CHANNEL_ID = "timekeeper_warnings"
    const val NOTIF_ID = 4242
    const val ACTION_UPDATE = "com.timekeeper.UPDATE"
    const val PREFS = "timekeeper_prefs"
    private const val POLL_MS = 5_000L
  }

  private val handler = Handler(Looper.getMainLooper())
  private var lastPoll = 0L
  private lateinit var prefs: SharedPreferences

  private val tick = object : Runnable {
    override fun run() {
      try { pollAndEnforce() } catch (_: Throwable) {}
      handler.postDelayed(this, POLL_MS)
    }
  }

  override fun onCreate() {
    super.onCreate()
    prefs = getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    createChannels()
    startForeground(NOTIF_ID, buildOngoing("Tracking app usage"))
    lastPoll = System.currentTimeMillis()
    handler.post(tick)
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    intent?.getStringExtra("timers")?.let { prefs.edit().putString("timers", it).apply() }
    return START_STICKY
  }

  override fun onDestroy() { handler.removeCallbacks(tick); super.onDestroy() }
  override fun onBind(intent: Intent?): IBinder? = null

  private fun createChannels() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val nm = getSystemService(NotificationManager::class.java)
    nm.createNotificationChannel(NotificationChannel(CHANNEL_ID, "Timers", NotificationManager.IMPORTANCE_LOW))
    nm.createNotificationChannel(NotificationChannel(WARN_CHANNEL_ID, "Warnings", NotificationManager.IMPORTANCE_HIGH))
  }

  private fun buildOngoing(text: String): Notification =
    NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("TimeKeeper")
      .setContentText(text)
      .setSmallIcon(android.R.drawable.ic_menu_recent_history)
      .setOngoing(true)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .build()

  private fun pollAndEnforce() {
    val now = System.currentTimeMillis()
    val raw = prefs.getString("timers", null) ?: return
    val arr = JSONArray(raw)
    if (arr.length() == 0) { lastPoll = now; return }

    val usm = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    val perPkg = HashMap<String, Long>()
    val events = usm.queryEvents(lastPoll, now)
    val resume = HashMap<String, Long>()
    val ev = UsageEvents.Event()
    while (events.hasNextEvent()) {
      events.getNextEvent(ev)
      when (ev.eventType) {
        UsageEvents.Event.MOVE_TO_FOREGROUND -> resume[ev.packageName] = ev.timeStamp
        UsageEvents.Event.MOVE_TO_BACKGROUND -> {
          val r = resume.remove(ev.packageName) ?: continue
          perPkg[ev.packageName] = (perPkg[ev.packageName] ?: 0L) + (ev.timeStamp - r)
        }
      }
    }
    for ((p, r) in resume) perPkg[p] = (perPkg[p] ?: 0L) + (now - r)
    lastPoll = now

    var changed = false
    for (i in 0 until arr.length()) {
      val t = arr.getJSONObject(i)
      val pkg = t.getString("packageName")
      val delta = perPkg[pkg] ?: 0L
      if (delta == 0L && !shouldRollover(t, now)) continue

      if (shouldRollover(t, now)) { t.put("usedMs", 0); t.put("periodStart", now); t.put("warned", false); t.put("expired", false); resetExtension(t); changed = true }

      val used = t.optLong("usedMs", 0L) + delta
      t.put("usedMs", used); changed = true
      val budget = effectiveBudget(t)

      if (!t.optBoolean("warned", false) && used >= budget * 0.9 && used < budget) {
        t.put("warned", true)
        notifyWarning(t.getString("id"), t.getString("appLabel"), budget - used)
      }
      if (!t.optBoolean("expired", false) && used >= budget) {
        t.put("expired", true)
        triggerExpiry(t)
      }
    }
    if (changed) prefs.edit().putString("timers", arr.toString()).apply()
  }

  private fun shouldRollover(t: JSONObject, now: Long): Boolean {
    if (t.optString("resetCron") != "daily-midnight") return false
    val start = t.optLong("periodStart", 0L)
    if (start == 0L) return true
    val cal = java.util.Calendar.getInstance().apply { timeInMillis = start; set(java.util.Calendar.HOUR_OF_DAY, 0); set(java.util.Calendar.MINUTE, 0); set(java.util.Calendar.SECOND, 0); set(java.util.Calendar.MILLISECOND, 0); add(java.util.Calendar.DAY_OF_YEAR, 1) }
    return now >= cal.timeInMillis
  }

  private fun resetExtension(t: JSONObject) {
    val ext = t.optJSONObject("extension") ?: JSONObject()
    ext.put("used", false); ext.remove("addedMs"); ext.remove("extendedAt")
    t.put("extension", ext)
  }

  private fun effectiveBudget(t: JSONObject): Long {
    val base = t.optLong("budgetMs", 0L)
    val ext = t.optJSONObject("extension")
    val added = if (ext?.optBoolean("used") == true) ext.optLong("addedMs", 0L) else 0L
    return base + added
  }

  private fun notifyWarning(id: String, label: String, msLeft: Long) {
    val mins = (msLeft / 60_000L).coerceAtLeast(1)
    val extendIntent = Intent(this, TimerActionReceiver::class.java).setAction(TimerActionReceiver.ACTION_EXTEND).putExtra("id", id)
    val pi = PendingIntent.getBroadcast(this, id.hashCode(), extendIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    val n = NotificationCompat.Builder(this, WARN_CHANNEL_ID)
      .setContentTitle("$label — $mins min left")
      .setContentText("Wrap up. Tap Extend to add up to 60 min (one time).")
      .setSmallIcon(android.R.drawable.ic_dialog_alert)
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .addAction(android.R.drawable.ic_menu_add, "Extend 30 min", pi)
      .setAutoCancel(true)
      .build()
    (getSystemService(NotificationManager::class.java)).notify(id.hashCode(), n)
  }

  private fun triggerExpiry(t: JSONObject) {
    val actions = t.optJSONObject("expiryActions") ?: return
    val pkg = t.getString("packageName")
    val label = t.getString("appLabel")

    if (actions.optBoolean("overlay", true)) {
      val i = Intent(this, BlockerAccessibilityService::class.java)
        .setAction(BlockerAccessibilityService.ACTION_BLOCK)
        .putExtra("packageName", pkg).putExtra("label", label)
      sendBroadcast(Intent(BlockerAccessibilityService.ACTION_BLOCK).putExtra("packageName", pkg).putExtra("label", label))
    }
    if (actions.optBoolean("lockScreen", false)) sendBroadcast(Intent("com.timekeeper.LOCK_NOW"))
    if (actions.optBoolean("rootShutdown", false)) sendBroadcast(Intent("com.timekeeper.ROOT_SHUTDOWN"))
  }
}
