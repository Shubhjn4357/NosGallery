package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.graphics.Color
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

/**
 * NOSWeatherCurrentWidget
 * Design: Full-width split-panel layout.
 * LEFT: Giant temperature number + weather condition code badge
 * RIGHT: 3 micro-stat chips (UV, Humidity, Wind)
 * Unique: Weather condition mapped to emoji + color badge chip inline.
 */
class NOSWeatherCurrentWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "weather_current"

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
        val bgInt = themeBg(theme)

        val root = createRootView(context, theme, customs)
        val mainCol = createColumnView(context)

        // ── HEADER ──
        mainCol.addView(R.id.dynamic_view_container,
            createHeader(context, "WEATHER NOW", "cloud", accentColor, subtextColor))

        // ── MAIN TEMP + CONDITION ROW ──
        val tempRow = createRowView(context)

        // Temperature block
        val tempCol = createColumnView(context)
        val tempVal = customs?.optString("valueText") ?: "24°C"
        tempCol.addView(R.id.dynamic_view_container,
            createTextView(context, tempVal, 32f, textColor, marginTop = 2f, isBold = true))
        val condition = customs?.optString("subValueText") ?: "SUNNY"
        val condEmoji = mapConditionToEmoji(condition)
        tempCol.addView(R.id.dynamic_view_container,
            createTextView(context, "$condEmoji $condition", 9f, accentColor, marginTop = 2f, isBold = true))
        tempRow.addView(R.id.dynamic_view_container, tempCol)

        // Spacer
        tempRow.addView(R.id.dynamic_view_container,
            createTextView(context, "  ", 14f, textColor))

        // Stats mini-column
        val statsCol = createColumnView(context)
        statsCol.addView(R.id.dynamic_view_container,
            createTextView(context, "💧 62% HUM", 8f, subtextColor, marginTop = 2f))
        statsCol.addView(R.id.dynamic_view_container,
            createTextView(context, "🌬 14 km/h", 8f, subtextColor, marginTop = 3f))
        statsCol.addView(R.id.dynamic_view_container,
            createTextView(context, "🌡 Feels 22°", 8f, subtextColor, marginTop = 3f))
        tempRow.addView(R.id.dynamic_view_container, statsCol)

        mainCol.addView(R.id.dynamic_view_container, tempRow)

        // ── SEPARATOR ──
        mainCol.addView(R.id.dynamic_view_container,
            createTextView(context, "──────────────────", 7f, subtextColor, marginTop = 6f))

        // ── WEEKLY FORECAST TAPE (Mon–Fri) ──
        val forecastRow = createRowView(context)
        val days = listOf("M" to "26°", "T" to "22°", "W" to "19°", "T" to "23°", "F" to "27°")
        days.forEach { (d, t) ->
            val dayCol = createColumnView(context)
            dayCol.addView(R.id.dynamic_view_container,
                createTextView(context, d, 7f, subtextColor, marginTop = 0f, isBold = true))
            dayCol.addView(R.id.dynamic_view_container,
                createTextView(context, t, 8f, textColor, marginTop = 1f, isBold = true))
            forecastRow.addView(R.id.dynamic_view_container, dayCol)
        }
        mainCol.addView(R.id.dynamic_view_container, forecastRow)

        // ── FOOTER ──
        val loc = customs?.optString("footerText") ?: "NOS • WEATHER"
        mainCol.addView(R.id.dynamic_view_container,
            createFooter(context, loc, accentColor))

        root.addView(R.id.nos_widget_root, mainCol)
        return root
    }

    private fun mapConditionToEmoji(condition: String): String = when {
        condition.contains("RAIN", true) -> "🌧"
        condition.contains("CLOUD", true) -> "⛅"
        condition.contains("SNOW", true) -> "❄️"
        condition.contains("STORM", true) -> "⛈"
        condition.contains("MIST", true) || condition.contains("FOG", true) -> "🌫"
        condition.contains("NIGHT", true) || condition.contains("CLEAR", true) && condition.contains("N") -> "🌙"
        else -> "☀️"
    }
}
