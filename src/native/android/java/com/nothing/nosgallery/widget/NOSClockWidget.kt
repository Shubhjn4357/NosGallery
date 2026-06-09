package com.nothing.nosgallery.widget

import android.content.Context
import android.view.View
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class NOSClockWidget : NosBaseWidgetProvider() {

    override val categoryPrefix = "clock_"

    override fun populateViews(
        context: Context,
        views: RemoteViews,
        config: JSONObject?,
        theme: String
    ) {
        val customizations = config?.optJSONObject("customizations")
        val templateId = config?.optString("templateId", "clock_dot") ?: "clock_dot"

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

        val timeStr = customizations?.optString("valueText", null)?.takeIf { it.isNotBlank() }
            ?: timeFormat.format(now)

        val subStr = when {
            templateId.contains("stopwatch") || templateId.contains("countdown") -> "00:00.0  STOPWATCH"
            templateId.contains("analog") -> "ANALOG CLOCK"
            else -> dateFormat.format(now).uppercase(Locale.getDefault())
        }

        val label = (customizations?.optString("titleText", null) ?: "NOTHING CLOCK")
            .uppercase(Locale.getDefault())

        views.setTextViewText(R.id.nos_widget_label, label)
        views.setTextColor(R.id.nos_widget_label, subtextColor)

        views.setTextViewText(R.id.nos_widget_value, timeStr)
        views.setTextColor(R.id.nos_widget_value, textColor)

        views.setTextViewText(R.id.nos_widget_sub_value, subStr)
        views.setTextColor(R.id.nos_widget_sub_value, subtextColor)

        views.setViewVisibility(R.id.nos_widget_progress, View.GONE)

        views.setTextViewText(R.id.nos_widget_footer, "NOS • CLOCK")
        views.setTextColor(R.id.nos_widget_footer, accentColor)
    }
}
