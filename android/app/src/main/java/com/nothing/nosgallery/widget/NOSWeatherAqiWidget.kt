package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

/**
 * NOSWeatherAqiWidget
 * Design: Radial-inspired AQI scale widget with 5 level bands.
 * TOP: AQI category badge + numeric value (giant)
 * MIDDLE: 5-step segmented scale bar (color coded)
 * BOTTOM: Dominant pollutant + health tip
 * Unique: The only widget using a segmented bar with 5 colour transitions.
 */
class NOSWeatherAqiWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "weather_aqi"

    // AQI thresholds
    private val aqiScale = listOf(
        50  to 0xff30d158.toInt(),  // Good – green
        100 to 0xffffd60a.toInt(),  // Moderate – yellow
        150 to 0xffff9f0a.toInt(),  // Unhealthy for sensitive – orange
        200 to 0xffff453a.toInt(),  // Unhealthy – red
        300 to 0xff9b59b6.toInt()   // Very unhealthy – purple
    )

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
        val col = createColumnView(context)

        // ── HEADER ──
        col.addView(R.id.dynamic_view_container,
            createHeader(context, "AIR QUALITY", "leaf", accentColor, subtextColor))

        // AQI value
        val aqiStr = customs?.optString("valueText") ?: "32 AQI"
        val aqiNum = aqiStr.filter { it.isDigit() }.toIntOrNull() ?: 32
        val (aqiLabel, aqiColor) = aqiCategoryOf(aqiNum)

        // ── GIANT AQI NUMBER with category badge ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, aqiNum.toString(), 36f, textColor, marginTop = 2f, isBold = true))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "● $aqiLabel", 9f, aqiColor, marginTop = 0f, isBold = true))

        // ── SEGMENTED SCALE BAR ──
        val barRow = createRowView(context)
        listOf("GOOD" to 0xff30d158.toInt(),
               "MOD"  to 0xffffd60a.toInt(),
               "SENS" to 0xffff9f0a.toInt(),
               "UNHL" to 0xffff453a.toInt(),
               "HZRD" to 0xff9b59b6.toInt()).forEach { (lbl, clr) ->
            val segCol = createColumnView(context)
            segCol.addView(R.id.dynamic_view_container,
                createTextView(context, "━━", 6f, clr, marginTop = 0f, isBold = true))
            segCol.addView(R.id.dynamic_view_container,
                createTextView(context, lbl, 5f, subtextColor, marginTop = 1f))
            barRow.addView(R.id.dynamic_view_container, segCol)
        }
        col.addView(R.id.dynamic_view_container, barRow)

        // ── POLLUTANT + TIP ──
        val sub = customs?.optString("subValueText") ?: "PM2.5 · BREATHE EASY"
        col.addView(R.id.dynamic_view_container,
            createTextView(context, sub, 8f, subtextColor, marginTop = 4f))

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • AQI MONITOR", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }

    private fun aqiCategoryOf(aqi: Int): Pair<String, Int> = when {
        aqi <= 50  -> "GOOD"           to 0xff30d158.toInt()
        aqi <= 100 -> "MODERATE"       to 0xffffd60a.toInt()
        aqi <= 150 -> "SENSITIVE"      to 0xffff9f0a.toInt()
        aqi <= 200 -> "UNHEALTHY"      to 0xffff453a.toInt()
        else       -> "VERY UNHEALTHY" to 0xff9b59b6.toInt()
    }
}
