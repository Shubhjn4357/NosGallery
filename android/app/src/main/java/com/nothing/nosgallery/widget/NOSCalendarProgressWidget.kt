package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.util.Calendar

/**
 * NOSCalendarProgressWidget
 * Design: Year/Month/Week progress dashboard — 3 rings in one card.
 * TOP: Year % + Day of year / 365 fraction
 * MIDDLE: 3 progress bars — YEAR | MONTH | WEEK — side by side
 * BOTTOM: Remaining days to Dec 31 + days this week
 * Unique: Only widget showing 3 concurrent time-horizon progress bars.
 */
class NOSCalendarProgressWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "calendar_progress"

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

        val cal = Calendar.getInstance()
        val dayOfYear = cal.get(Calendar.DAY_OF_YEAR)
        val totalDays = if (cal.getActualMaximum(Calendar.DAY_OF_YEAR) > 365) 366 else 365
        val yearPct  = (dayOfYear * 100) / totalDays

        val dayOfMonth = cal.get(Calendar.DAY_OF_MONTH)
        val totalInMonth = cal.getActualMaximum(Calendar.DAY_OF_MONTH)
        val monthPct = (dayOfMonth * 100) / totalInMonth

        val dayOfWeek = cal.get(Calendar.DAY_OF_WEEK)
        val weekPct  = ((dayOfWeek - 1) * 100) / 7

        val root = createRootView(context, theme, customs)
        val col = createColumnView(context)

        // ── HEADER ──
        col.addView(R.id.dynamic_view_container,
            createHeader(context, "TIME PROGRESS", "hourglass", accentColor, subtextColor))

        // ── YEAR FRACTION ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "DAY $dayOfYear / $totalDays  —  $yearPct% OF ${ cal.get(Calendar.YEAR)}", 9f, accentColor, marginTop = 2f, isBold = true))

        // ── 3 PROGRESS BARS ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 4f))
        listOf(
            Triple("YEAR",  yearPct,  100),
            Triple("MONTH", monthPct, 100),
            Triple("WEEK",  weekPct,  100)
        ).forEach { (label, pct, _) ->
            val filled = (pct / 10).coerceIn(0, 10)
            val barStr = buildString {
                repeat(filled) { append("▓") }
                repeat(10 - filled) { append("░") }
            }
            val barRow = createRowView(context)
            barRow.addView(R.id.dynamic_view_container,
                createTextView(context, label, 7f, subtextColor, marginTop = 2f, isBold = true))
            barRow.addView(R.id.dynamic_view_container,
                createTextView(context, "  $barStr", 7f, accentColor, marginTop = 2f))
            barRow.addView(R.id.dynamic_view_container,
                createTextView(context, "  $pct%", 7f, textColor, marginTop = 2f))
            col.addView(R.id.dynamic_view_container, barRow)
        }

        // ── REMAINING ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 4f))
        val remaining = totalDays - dayOfYear
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "$remaining DAYS UNTIL DEC 31", 8f, subtextColor, marginTop = 1f))

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • TIME", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}

