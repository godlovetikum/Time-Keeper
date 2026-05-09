package com.timekeeper.services

import android.accessibilityservice.AccessibilityService
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.view.accessibility.AccessibilityEvent

/**
 * Watches foreground app changes. When a "blocked" package is foregrounded,
 * performs the GLOBAL_ACTION_HOME and triggers the OverlayModule via broadcast.
 */
class BlockerAccessibilityService : AccessibilityService() {

  companion object { const val ACTION_BLOCK = "com.timekeeper.BLOCK" }

  private val blocked = HashSet<String>()
  private var receiver: BroadcastReceiver? = null

  override fun onServiceConnected() {
    receiver = object : BroadcastReceiver() {
      override fun onReceive(context: Context, intent: Intent) {
        intent.getStringExtra("packageName")?.let { blocked.add(it) }
      }
    }
    registerReceiver(receiver, IntentFilter(ACTION_BLOCK), Context.RECEIVER_NOT_EXPORTED)
  }

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    val pkg = event?.packageName?.toString() ?: return
    if (event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
    if (blocked.contains(pkg)) {
      performGlobalAction(GLOBAL_ACTION_HOME)
    }
  }

  override fun onInterrupt() {}
  override fun onDestroy() { receiver?.let { runCatching { unregisterReceiver(it) } }; super.onDestroy() }
}
