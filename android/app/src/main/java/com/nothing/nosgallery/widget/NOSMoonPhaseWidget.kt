package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.util.Calendar

/**
 * NOSMoonPhaseWidget
 * Design: Lunar cycle timeline with 8 phase symbols as a scrollable dot tape.
 * TOP: Moon glyph (○●◑◐ etc.) sized 28sp + phase name
 * MIDDLE: 8-cell lunar calendar strip — current phase highlighted
 * BOTTOM: Illumination % and rise/set time
 * Unique: Only widget using a horizontal 8-step lunar icon tape.
 */
class NOSMoonPhaseWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "weather_moon_phase"

    private val phases = listOf(
        "🌑" to "NEW",
        "🌒" to "WAX CRESCENT",
        "🌓" to "FIRST QUARTER",
        "🌔" to "WAX GIBBOUS",
        "🌕" to "FULL",
        "🌖" to "WANE GIBBOUS",
        "🌗" to "LAST QUARTER",
        "🌘" to "WANE CRESCENT"
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
            createHeader(context, "MOON PHASE", "moon", accentColor, subtextColor))

        // Determine current phase index from day-of-month
        val dayOfMonth = Calendar.getInstance().get(Calendar.DAY_OF_MONTH)
        val phaseIdx = ((dayOfMonth - 1) / 3.75).toInt().coerceIn(0, 7)
        val (phaseEmoji, phaseName) = phases[phaseIdx]

        // ── LARGE MOON GLYPH + NAME ──
        val centerRow = createRowView(context)
        val moonCol = createColumnView(context)
        moonCol.addView(R.id.dynamic_view_container,
            createTextView(context, phaseEmoji, 36f, textColor, marginTop = 0f, isBold = false))
        centerRow.addView(R.id.dynamic_view_container, moonCol)

        val infoCol = createColumnView(context)
        infoCol.addView(R.id.dynamic_view_container,
            createTextView(context, phaseName, 10f, accentColor, marginTop = 4f, isBold = true))
        val illum = customs?.optString("valueText") ?: "85% ILLUMINATED"
        infoCol.addView(R.id.dynamic_view_container,
            createTextView(context, illum, 8f, subtextColor, marginTop = 3f))
        infoCol.addView(R.id.dynamic_view_container,
            createTextView(context, "RISE: 18:42  SET: 06:12", 7f, subtextColor, marginTop = 3f))
        centerRow.addView(R.id.dynamic_view_container, infoCol)
        col.addView(R.id.dynamic_view_container, centerRow)

        // ── 8-CELL LUNAR PHASE TAPE ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "── LUNAR CYCLE ──", 7f, subtextColor, marginTop = 6f))
        val tapeRow = createRowView(context)
        phases.forEachIndexed { i, (em, _) ->
            val isActive = i == phaseIdx
            tapeRow.addView(R.id.dynamic_view_container,
                createTextView(context, em, if (isActive) 14f else 9f,
                    if (isActive) accentColor else subtextColor,
                    marginTop = 0f))
        }
        col.addView(R.id.dynamic_view_container, tapeRow)

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • LUNAR ENGINE", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
