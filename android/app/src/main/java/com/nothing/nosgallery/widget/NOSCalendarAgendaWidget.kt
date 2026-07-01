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
 * NOSCalendarAgendaWidget
 * Design: Google Calendar-style agenda strip for the day.
 * TOP: Bold day + date header with event count badge
 * MIDDLE: 3 agenda event rows — each with time pill + event title + color dot
 * BOTTOM: Next event countdown + "OPEN CALENDAR" button
 * Unique: Only widget with a time-stamped event list with color-coded dots.
 */
class NOSCalendarAgendaWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "calendar_agenda"

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
        val today = SimpleDateFormat("EEEE, d MMMM", Locale.getDefault()).format(Date()).uppercase()
        val btnBg = if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0")
                    else android.graphics.Color.parseColor("#ff1c1c1e")

        val root = createRootView(context, theme, customs)
        val col = createColumnView(context)

        // ── HEADER ──
        col.addView(R.id.dynamic_view_container,
            createHeader(context, "TODAY'S AGENDA", "calendar", accentColor, subtextColor))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, today, 9f, accentColor, marginTop = 0f, isBold = true))

        // ── EVENT LIST ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 4f))

        val events = listOf(
            Triple("09:00", customs?.optString("valueText") ?: "Design Review", "●"),
            Triple("12:00", "Team Standup", "◆"),
            Triple("15:30", "Deploy v2.4", "★")
        )
        val eventColors = listOf(accentColor,
            android.graphics.Color.parseColor("#ff30d158"),
            android.graphics.Color.parseColor("#ffffd60a"))

        events.forEachIndexed { i, (time, title, shape) ->
            val evRow = createRowView(context)
            evRow.addView(R.id.dynamic_view_container,
                createTextView(context, time, 8f, subtextColor, marginTop = 0f, isBold = true))
            evRow.addView(R.id.dynamic_view_container,
                createTextView(context, "  $shape", 8f, eventColors[i], marginTop = 0f))
            evRow.addView(R.id.dynamic_view_container,
                createTextView(context, " $title", 9f, textColor, marginTop = 0f))
            col.addView(R.id.dynamic_view_container, evRow)
        }

        // ── NEXT EVENT COUNTDOWN ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 4f))
        val currentHour = cal.get(Calendar.HOUR_OF_DAY)
        val nextEvt = events.firstOrNull { (t, _, _) -> t.split(":")[0].toInt() > currentHour }
        val nextLabel = nextEvt?.let { (t, ev, _) -> "NEXT: $ev @ $t" } ?: "ALL DONE TODAY 🎉"
        col.addView(R.id.dynamic_view_container,
            createTextView(context, nextLabel, 8f, accentColor, marginTop = 1f, isBold = true))

        col.addView(R.id.dynamic_view_container,
            createButtonView(context, "📅  OPEN CALENDAR", "open_calendar", appWidgetId, textColor, btnBg))

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • CALENDAR", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
