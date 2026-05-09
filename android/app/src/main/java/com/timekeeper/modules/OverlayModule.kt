package com.timekeeper.modules

import android.content.Context
import android.os.Bundle
import android.graphics.PixelFormat
import android.os.Build
import android.provider.Settings
import android.view.Gravity
import android.view.WindowManager
import android.widget.FrameLayout
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceManager
import com.facebook.react.ReactRootView
import com.facebook.react.bridge.*

class OverlayModule(private val ctx: ReactApplicationContext) : ReactContextBaseJavaModule(ctx) {
  private var rootView: ReactRootView? = null

  override fun getName() = "Overlay"

  @ReactMethod
  fun canDrawOverlays(promise: Promise) {
    promise.resolve(Settings.canDrawOverlays(ctx))
  }

  @ReactMethod
  fun show(packageName: String, message: String, promise: Promise) {
    try {
      if (!Settings.canDrawOverlays(ctx)) { promise.reject("NO_PERM", "SYSTEM_ALERT_WINDOW not granted"); return }
      ctx.runOnUiQueueThread {
        if (rootView != null) { promise.resolve(true); return@runOnUiQueueThread }
        val app = ctx.applicationContext as ReactApplication
        val rim: ReactInstanceManager = app.reactNativeHost.reactInstanceManager
        val rv = ReactRootView(ctx)
        val bundle = Bundle().apply { putString("packageName", packageName); putString("message", message) }
        rv.startReactApplication(rim, "BlockedOverlay", bundle)
        val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
          WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        else @Suppress("DEPRECATION") WindowManager.LayoutParams.TYPE_PHONE
        val params = WindowManager.LayoutParams(
          WindowManager.LayoutParams.MATCH_PARENT,
          WindowManager.LayoutParams.MATCH_PARENT,
          type,
          WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON,
          PixelFormat.TRANSLUCENT
        )
        params.gravity = Gravity.CENTER
        val wm = ctx.getSystemService(Context.WINDOW_SERVICE) as WindowManager
        wm.addView(rv, params)
        rootView = rv
        promise.resolve(true)
      }
    } catch (e: Exception) { promise.reject("OVERLAY_FAILED", e) }
  }

  @ReactMethod
  fun hide(promise: Promise) {
    ctx.runOnUiQueueThread {
      try {
        rootView?.let {
          val wm = ctx.getSystemService(Context.WINDOW_SERVICE) as WindowManager
          wm.removeView(it)
          it.unmountReactApplication()
        }
      } catch (_: Exception) {}
      rootView = null
      promise.resolve(true)
    }
  }
}
