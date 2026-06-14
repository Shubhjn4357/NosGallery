package com.nothing.nosgallery.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import com.nothing.nosgallery.MainActivity
import org.json.JSONObject
import android.net.Uri

/**
 * Base class for all NOS Gallery native widget providers.
 *
 * Subclasses must implement:
 *   - [categoryPrefix]  e.g. "clock_", "weather_"
 *   - [populateViews]   fill a [RemoteViews] (R.layout.nos_widget_layout) from [JSONObject] config
 *
 * On every update the provider:
 *  1. Reads the latest config for this widgetId from SharedPreferences (no JS, no IPC)
 *  2. Inflates R.layout.nos_widget_layout
 *  3. Calls [populateViews] with the resolved config
 *  4. Applies the RemoteViews to AppWidgetManager
 */
abstract class NosBaseWidgetProvider : AppWidgetProvider() {

    /** The templateId prefix this provider handles, e.g. "clock_" */
    abstract val categoryPrefix: String
    open val defaultTemplateId: String? = null

    /**
     * Populate [views] (already inflated from R.layout.nos_widget_layout) using [config].
     * [config] is the JSONObject for the best matching saved widget, or null if none saved.
     * [theme] is the active global theme id string.
     */
    abstract fun populateViews(
        context: Context,
        views: RemoteViews,
        config: JSONObject?,
        theme: String,
        appWidgetId: Int
    )

    // ── AppWidgetProvider callbacks ───────────────────────────────────────────────

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == "com.nothing.nosgallery.WIDGET_CLICK") {
            val appWidgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID)
            val clickAction = intent.getStringExtra("clickAction")
            if (appWidgetId != AppWidgetManager.INVALID_APPWIDGET_ID && clickAction != null) {
                handleWidgetClick(context, appWidgetId, clickAction)
            }
        } else {
            super.onReceive(context, intent)
        }
    }

    private fun handleWidgetClick(context: Context, appWidgetId: Int, clickAction: String) {
        val config = NosWidgetPreferences.resolveWidgetConfig(context, appWidgetId, defaultTemplateId, categoryPrefix) ?: JSONObject()
        val templateId = config.optString("templateId", defaultTemplateId ?: "")

        when (clickAction) {
            "toggle_torch" -> {
                val current = config.optBoolean("torchEnabled", false)
                val next = !current
                config.put("torchEnabled", next)
                config.put("valueText", if (next) "ON" else "OFF")
                toggleNativeFlashlight(context, next)
            }
            "add_water" -> {
                var intake = config.optInt("waterIntake", 1000)
                intake += 250
                config.put("waterIntake", intake)
                config.put("valueText", "${intake} ml")
            }
            "reset_water" -> {
                config.put("waterIntake", 0)
                config.put("valueText", "0 ml")
            }
            "toggle_stopwatch" -> {
                val running = config.optBoolean("stopwatchRunning", false)
                val time = config.optInt("stopwatchTime", 0)
                config.put("stopwatchRunning", !running)
                if (!running) {
                    config.put("stopwatchTime", time + 10)
                }
            }
            "reset_stopwatch" -> {
                config.put("stopwatchRunning", false)
                config.put("stopwatchTime", 0)
            }
            "music_play" -> {
                val playing = config.optBoolean("musicPlaying", false)
                config.put("musicPlaying", !playing)
            }
            "music_skip" -> {
                var idx = config.optInt("currentTrackIndex", 0)
                idx = (idx + 1) % 3
                config.put("currentTrackIndex", idx)
                val tracks = listOf("Nothing Beat", "Antigravity Chill", "Glyph Ambient")
                config.put("valueText", tracks[idx])
            }
            "cycle_sound" -> {
                val current = config.optString("soundProfile", "vibrate")
                val next = when (current) {
                    "sound" -> "vibrate"
                    "vibrate" -> "silent"
                    else -> "sound"
                }
                config.put("soundProfile", next)
                config.put("valueText", next.uppercase())
            }
        }

        // Save updated config
        val category = NosWidgetPreferences.getWidgetCategory(context, appWidgetId)
        NosWidgetPreferences.saveWidgetConfig(context, appWidgetId, category, config.toString())
        syncWidgetBackToStore(context, appWidgetId, config)

        // Force widget redraw
        val appWidgetManager = AppWidgetManager.getInstance(context)
        updateWidget(context, appWidgetManager, appWidgetId)
    }

    private fun toggleNativeFlashlight(context: Context, enable: Boolean) {
        try {
            val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as android.hardware.camera2.CameraManager
            val cameraId = cameraManager.cameraIdList.firstOrNull()
            if (cameraId != null) {
                cameraManager.setTorchMode(cameraId, enable)
            }
        } catch (e: Exception) {
            android.util.Log.e("NosBaseWidgetProvider", "Failed to toggle native torch: ${e.message}")
        }
    }

    private fun syncWidgetBackToStore(context: Context, appWidgetId: Int, updatedWidget: JSONObject) {
        try {
            val widgets = NosWidgetPreferences.getWidgetsJson(context)
            val updatedId = updatedWidget.optString("id")
            if (!updatedId.isNullOrBlank()) {
                for (i in 0 until widgets.length()) {
                    val obj = widgets.optJSONObject(i) ?: continue
                    if (obj.optString("id") == updatedId) {
                        val keys = updatedWidget.keys()
                        while (keys.hasNext()) {
                            val key = keys.next()
                            obj.put(key, updatedWidget.get(key))
                        }
                        break
                    }
                }
                NosWidgetPreferences.getPrefs(context).edit()
                    .putString("widgets", widgets.toString())
                    .apply()
            }
        } catch (e: Exception) {
            // Non-fatal
        }
    }

    protected fun getClickPendingIntent(
        context: Context,
        appWidgetId: Int,
        clickAction: String
    ): PendingIntent {
        val intent = Intent("com.nothing.nosgallery.WIDGET_CLICK").apply {
            setPackage(context.packageName)
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
            putExtra("clickAction", clickAction)
        }
        val flags = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }
        return PendingIntent.getBroadcast(
            context,
            (appWidgetId.toString() + "_" + clickAction).hashCode(),
            intent,
            flags
        )
    }

    // ── Core update logic ─────────────────────────────────────────────────────────

    protected fun updateWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        val config = NosWidgetPreferences.resolveWidgetConfig(context, appWidgetId, defaultTemplateId, categoryPrefix)
        val theme = NosWidgetPreferences.getActiveTheme(context)

        val views = RemoteViews(context.packageName, R.layout.nos_widget_layout)

        // Apply background color from customizations or theme default
        val bgColor = resolveBackgroundColor(config, theme)
        views.setInt(R.id.nos_widget_root, "setBackgroundColor", bgColor)

        // Tap widget → open default OS app based on category with safe fallback to MainActivity
        val tapIntent = getLaunchIntentForCategory(context, categoryPrefix)
        val pendingIntent = PendingIntent.getActivity(
            context, appWidgetId, tapIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.nos_widget_root, pendingIntent)

        // Let each subclass fill in the content
        populateViews(context, views, config, theme, appWidgetId)

        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    private fun getLaunchIntentForCategory(context: Context, categoryPrefix: String): Intent {
        val intent = when {
            categoryPrefix.contains("clock") -> {
                Intent(android.provider.AlarmClock.ACTION_SHOW_ALARMS)
            }
            categoryPrefix.contains("calendar") -> {
                Intent(Intent.ACTION_MAIN).apply {
                    addCategory(Intent.CATEGORY_APP_CALENDAR)
                }
            }
            categoryPrefix.contains("weather") -> {
                Intent(Intent.ACTION_VIEW, Uri.parse("https://www.google.com/search?q=weather"))
            }
            categoryPrefix.contains("finance") -> {
                Intent(Intent.ACTION_MAIN).apply {
                    addCategory(Intent.CATEGORY_APP_CALCULATOR)
                }
            }
            categoryPrefix.contains("productivity") -> {
                Intent(Intent.ACTION_MAIN).apply {
                    addCategory(Intent.CATEGORY_APP_CALENDAR)
                }
            }
            else -> {
                Intent(context, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
            }
        }
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

        // Safe fallback check
        try {
            if (intent.resolveActivity(context.packageManager) == null) {
                return Intent(context, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
            }
        } catch (e: Exception) {
            return Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
        }
        return intent
    }

    // ── Color resolution ──────────────────────────────────────────────────────────

    private fun resolveBackgroundColor(config: JSONObject?, theme: String): Int {
        val custom = config?.optJSONObject("customizations")
        val hex = custom?.optString("backgroundColor", null)
        if (!hex.isNullOrBlank()) {
            return NosWidgetPreferences.parseColor(hex, themeBackground(theme))
        }
        return themeBackground(theme)
    }

    protected fun resolveAccentColor(config: JSONObject?, theme: String): Int {
        val custom = config?.optJSONObject("customizations")
        val hex = custom?.optString("accentColor", null)
        if (!hex.isNullOrBlank()) {
            return NosWidgetPreferences.parseColor(hex, themeAccent(theme))
        }
        return themeAccent(theme)
    }

    protected fun resolveTextColor(config: JSONObject?, theme: String): Int {
        val custom = config?.optJSONObject("customizations")
        val hex = custom?.optString("textColor", null)
        if (!hex.isNullOrBlank()) {
            return NosWidgetPreferences.parseColor(hex, themeText(theme))
        }
        return themeText(theme)
    }

    // ── Theme defaults ────────────────────────────────────────────────────────────

    protected fun themeBackground(theme: String): Int = when (theme) {
        "glassmorphism" -> Color.parseColor("#CC0d1117")
        "liquidglass"   -> Color.parseColor("#990B1E24")
        "luxury"        -> Color.parseColor("#FF1c1a17")
        "cyberpunk"     -> Color.parseColor("#FF0d0f1a")
        "minimal"       -> Color.parseColor("#FFF5F5F5")
        "warm"          -> Color.parseColor("#FF1a1209")
        else            -> Color.parseColor("#FF000000") // nos default
    }

    protected fun themeAccent(theme: String): Int = when (theme) {
        "glassmorphism" -> Color.parseColor("#FF39ff14")
        "liquidglass"   -> Color.parseColor("#FF00F0FF")
        "luxury"        -> Color.parseColor("#FFdfba6b")
        "cyberpunk"     -> Color.parseColor("#FFff003c")
        "minimal"       -> Color.parseColor("#FF333333")
        "warm"          -> Color.parseColor("#FFe8824b")
        else            -> Color.parseColor("#FFff0000") // nos red
    }

    protected fun themeText(theme: String): Int = when (theme) {
        "minimal" -> Color.parseColor("#FF111111")
        else      -> Color.parseColor("#FFFFFFFF")
    }

    protected fun themeSubtext(theme: String): Int = when (theme) {
        "minimal" -> Color.parseColor("#FF666666")
        else      -> Color.parseColor("#FF888888")
    }
}
