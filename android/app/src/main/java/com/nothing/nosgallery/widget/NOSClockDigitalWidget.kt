package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

/**
 * NOSClockDigitalWidget
 * Design: Newspaper-style digital clock — bold typographic layout.
 * TOP: Day/Date in editorial caps style
 * MIDDLE: Giant HH:MM in 2-color split (hours = accent, minutes = text)
 * BOTTOM: Seconds dot pulse row + Timezone
 * Unique: Only clock with 2-color split hour/minute typography.
 */
class NOSClockDigitalWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "clock_digital"

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
        val hour = SimpleDateFormat("hh", Locale.getDefault()).format(cal.time)
        val min  = SimpleDateFormat("mm", Locale.getDefault()).format(cal.time)
        val sec  = cal.get(Calendar.SECOND)
        val ampm = SimpleDateFormat("a", Locale.getDefault()).format(cal.time).uppercase()
        val day  = SimpleDateFormat("EEEE", Locale.getDefault()).format(cal.time).uppercase()
        val date = SimpleDateFormat("d MMMM", Locale.getDefault()).format(cal.time).uppercase()
        val tz   = SimpleDateFormat("zzz", Locale.getDefault()).format(cal.time)

        val root = createRootView(context, theme, customs)
        val col = createColumnView(context)

        // ── DAY + DATE ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, day, 9f, subtextColor, marginTop = 0f, isBold = true))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, date, 9f, accentColor, marginTop = 0f, isBold = true))

        // ── LARGE TIME (hours in accent, minutes in textColor) ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────", 6f, subtextColor, marginTop = 4f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, hour, 44f, accentColor, marginTop = 0f, isBold = true))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, ":$min  $ampm", 28f, textColor, marginTop = -8f, isBold = true))

        // ── SECONDS DOT STRIP ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────", 6f, subtextColor, marginTop = 2f))
        val secsRow = createRowView(context)
        val secStep = sec / 5   // 0-11 filled out of 12
        for (i in 0 until 12) {
            secsRow.addView(R.id.dynamic_view_container,
                createTextView(context, if (i < secStep) "●" else "·",
                    7f, if (i < secStep) accentColor else subtextColor, marginTop = 0f))
        }
        col.addView(R.id.dynamic_view_container, secsRow)

        // ── TZ ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "$tz · ${customs?.optString("subValueText") ?: "WORLD TIME"}", 7f, subtextColor, marginTop = 2f))

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • DIGITAL CLOCK", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
