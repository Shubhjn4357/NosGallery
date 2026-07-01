package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

class NOSHealthStepsWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "health_steps"

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
            createHeader(context, "STEP COUNTER", "footprint", accentColor, subtextColor))

        // Compute steps data
        val stepsRaw = customs?.optString("valueText") ?: "5,420 STEPS"
        val stepsNum = stepsRaw.filter { it.isDigit() }.toIntOrNull() ?: 5420
        val goalNum = 10000
        val progress = (stepsNum.toFloat() / goalNum).coerceIn(0f, 1f)

        // ── STEPS NUMBER ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "%,d".format(stepsNum), 30f, textColor, marginTop = 2f, isBold = true))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "GOAL: ${"%,d".format(goalNum)}", 8f, subtextColor, marginTop = 0f))

        // ── DOT GRID (20 dots = every 500 steps) ──
        val totalDots = 20
        val filledDots = (progress * totalDots).toInt()
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "── PROGRESS ──", 7f, subtextColor, marginTop = 6f))

        val dotRow = createRowView(context)
        for (i in 0 until totalDots) {
            val dotChar = if (i < filledDots) "●" else "○"
            val dotColor = if (i < filledDots) accentColor else subtextColor
            dotRow.addView(R.id.dynamic_view_container,
                createTextView(context, dotChar, 7f, dotColor, marginTop = 0f))
        }
        col.addView(R.id.dynamic_view_container, dotRow)

        // ── CALORIES + DISTANCE ──
        val calories = (stepsNum * 0.04).toInt()
        val distKm = "%.2f".format(stepsNum * 0.00075)
        val statsRow = createRowView(context)
        statsRow.addView(R.id.dynamic_view_container,
            createTextView(context, "🔥 ${calories} kcal", 8f, subtextColor, marginTop = 4f))
        statsRow.addView(R.id.dynamic_view_container,
            createTextView(context, "   📍 ${distKm} km", 8f, subtextColor, marginTop = 4f))
        col.addView(R.id.dynamic_view_container, statsRow)

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • HEALTH", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
