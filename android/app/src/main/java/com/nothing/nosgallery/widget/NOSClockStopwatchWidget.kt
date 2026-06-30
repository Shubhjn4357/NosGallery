package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

class NOSClockStopwatchWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "clock_stopwatch"

    override fun onUpdateWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        config: JSONObject?,
        theme: String
    ): RemoteViews {
        val customs = config?.optJSONObject("customizations")
        val accentColor = parseColorOr(customs?.optString("accentColor"), themeAccent(theme))
        val textColor = parseColorOr(customs?.optString("textColor"), themeText(theme))
        val subtextColor = parseColorOr(customs?.optString("subValueColor"), themeSubtext(theme))

        val root = createRootView(context, theme, customs)
        val container = createColumnView(context)

        val title = customs?.optString("titleText") ?: "STOPWATCH"
        container.addView(R.id.dynamic_view_container, createHeader(context, title, "timer", accentColor, subtextColor))

        val dynamicState = NosWidgetPreferences.getDynamicStateJson(context)
        val stopwatchRunning = dynamicState.optBoolean("stopwatchRunning", false)
        val stopwatchTime = dynamicState.optLong("stopwatchTime", 0L)

        if (stopwatchRunning) {
            val baseTime = android.os.SystemClock.elapsedRealtime() - (stopwatchTime * 100)
            container.addView(R.id.dynamic_view_container, createChronometerView(context, 24f, textColor, baseTime, true))
        } else {
            val mins = stopwatchTime / 600
            val secs = (stopwatchTime % 600) / 10
            val deci = stopwatchTime % 10
            val textStr = String.format("%02d:%02d.%d", mins, secs, deci)
            container.addView(R.id.dynamic_view_container, createTextView(context, textStr, 24f, textColor, marginTop = 6f))
        }

        // Action Buttons Row
        val row = createRowView(context)
        val colors = mapOf(
            "bg" to themeBackground(theme),
            "text" to themeText(theme),
            "subtext" to themeSubtext(theme),
            "accent" to themeAccent(theme),
            "btnBg" to if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0") else android.graphics.Color.parseColor("#ff1c1c1e")
        )
        val startLabel = if (stopwatchRunning) "PAUSE" else "START"
        row.addView(R.id.dynamic_view_container, createButtonView(context, startLabel, "toggle_stopwatch", appWidgetId, textColor, colors["btnBg"]!!))
        row.addView(R.id.dynamic_view_container, createButtonView(context, "RESET", "reset_stopwatch", appWidgetId, textColor, colors["btnBg"]!!))
        
        container.addView(R.id.dynamic_view_container, row)

        val footer = customs?.optString("footerText") ?: "NOS • CHRONOMETER"
        container.addView(R.id.dynamic_view_container, createFooter(context, footer, accentColor))

        root.addView(R.id.nos_widget_root, container)
        return root
    }
}
