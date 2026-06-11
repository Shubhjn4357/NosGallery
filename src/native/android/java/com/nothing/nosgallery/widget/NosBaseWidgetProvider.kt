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
        theme: String
    )

    // ── AppWidgetProvider callbacks ───────────────────────────────────────────────

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        appWidgetIds.forEach { widgetId ->
            updateWidget(context, appWidgetManager, widgetId)
        }
    }

    override fun onDeleted(context: Context, appWidgetIds: IntArray) {
        appWidgetIds.forEach { NosWidgetPreferences.removeWidgetConfig(context, it) }
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

        // Tap widget → open app
        val tapIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            context, appWidgetId, tapIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.nos_widget_root, pendingIntent)

        // Let each subclass fill in the content
        populateViews(context, views, config, theme)

        appWidgetManager.updateAppWidget(appWidgetId, views)
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
        "luxury"        -> Color.parseColor("#FF1c1a17")
        "cyberpunk"     -> Color.parseColor("#FF0d0f1a")
        "minimal"       -> Color.parseColor("#FFF5F5F5")
        "warm"          -> Color.parseColor("#FF1a1209")
        else            -> Color.parseColor("#FF000000") // nos default
    }

    protected fun themeAccent(theme: String): Int = when (theme) {
        "glassmorphism" -> Color.parseColor("#FF39ff14")
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
