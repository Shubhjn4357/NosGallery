package com.nothing.nosgallery.widget

import android.content.Context
import android.view.View
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

open class NOSClockWidget : NosBaseWidgetProvider() {

    override val categoryPrefix = "clock_"
    open override val defaultTemplateId = "clock_dot"

    open override fun populateViews(
        context: Context,
        views: RemoteViews,
        config: JSONObject?,
        theme: String,
        appWidgetId: Int
    ) {
        val customizations = config?.optJSONObject("customizations")
        val templateId = config?.optString("templateId", defaultTemplateId) ?: defaultTemplateId

        val accentColor = resolveAccentColor(config, theme)
        val textColor = resolveTextColor(config, theme)
        val subtextColor = themeSubtext(theme)

        // Accent dot color
        views.setInt(R.id.nos_widget_dot, "setBackgroundColor", accentColor)

        // Choose display format by template
        val timeFormat = when {
            templateId.contains("24") -> SimpleDateFormat("HH:mm", Locale.getDefault())
            templateId.contains("flip") -> SimpleDateFormat("HH:mm", Locale.getDefault())
            else -> SimpleDateFormat("hh:mm a", Locale.getDefault())
        }
        val dateFormat = SimpleDateFormat("EEE, MMM d", Locale.getDefault())
        val now = Date()

        val label = (customizations?.optString("titleText")?.takeIf { it.isNotEmpty() } ?: "NOTHING CLOCK")
            .uppercase(Locale.getDefault())
        views.setTextViewText(R.id.nos_widget_label, label)
        views.setTextColor(R.id.nos_widget_label, subtextColor)

        if (templateId.contains("stopwatch") || templateId.contains("countdown")) {
            val running = config?.optBoolean("stopwatchRunning", false) ?: false
            val time = config?.optInt("stopwatchTime", 0) ?: 0
            val mins = time / 600
            val secs = (time % 600) / 10
            val deci = time % 10
            val timeFormatted = String.format(Locale.getDefault(), "%02d:%02d.%d", mins, secs, deci)

            views.setTextViewText(R.id.nos_widget_value, timeFormatted)
            views.setTextColor(R.id.nos_widget_value, textColor)
            views.setTextViewText(R.id.nos_widget_sub_value, "STOPWATCH")
            views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
            views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
            views.setTextViewText(R.id.nos_widget_footer, "NOS • CHRONOMETER")

            // Bind action buttons
            views.setViewVisibility(R.id.nos_widget_buttons_row, View.VISIBLE)
            views.setViewVisibility(R.id.nos_widget_btn_left, View.VISIBLE)
            views.setViewVisibility(R.id.nos_widget_btn_right, View.VISIBLE)
            views.setViewVisibility(R.id.nos_widget_btn_divider, View.VISIBLE)
            views.setTextViewText(R.id.nos_widget_btn_left, if (running) "PAUSE" else "START")
            views.setOnClickPendingIntent(R.id.nos_widget_btn_left, getClickPendingIntent(context, appWidgetId, "toggle_stopwatch"))
            views.setTextViewText(R.id.nos_widget_btn_right, "RESET")
            views.setOnClickPendingIntent(R.id.nos_widget_btn_right, getClickPendingIntent(context, appWidgetId, "reset_stopwatch"))
        } else {
            val timeStr = customizations?.optString("valueText")?.takeIf { it.isNotBlank() }
                ?: timeFormat.format(now)

            val subStr = when {
                templateId.contains("analog") -> "ANALOG CLOCK"
                else -> dateFormat.format(now).uppercase(Locale.getDefault())
            }

            views.setTextViewText(R.id.nos_widget_value, timeStr)
            views.setTextColor(R.id.nos_widget_value, textColor)
            views.setTextViewText(R.id.nos_widget_sub_value, subStr)
            views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
            views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
            views.setTextViewText(R.id.nos_widget_footer, "NOS • CLOCK")

            // Hide action buttons
            views.setViewVisibility(R.id.nos_widget_buttons_row, View.GONE)
        }

        views.setTextColor(R.id.nos_widget_footer, accentColor)
    }
}
