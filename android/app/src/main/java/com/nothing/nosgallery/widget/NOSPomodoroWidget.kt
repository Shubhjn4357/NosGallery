package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.util.Calendar

/**
 * NOSPomodoroWidget
 * Design: Tomato session tracker — circular session dots + countdown.
 * TOP: Session type badge (WORK / SHORT BREAK / LONG BREAK) + session #
 * MIDDLE: Large MM:SS countdown + 4-dot session progress row (🍅 = done)
 * BOTTOM: Daily tomato count + START / SKIP buttons
 * Unique: The only widget using 🍅 tomato session state indicators.
 */
class NOSPomodoroWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "productivity_pomodoro"

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

        val dynamicState = NosWidgetPreferences.getDynamicStateJson(context)
        val session = dynamicState.optInt("pomodoroSession", 1).coerceIn(1, 4)
        val isBreak = session % 4 == 0
        val sessionLabel = when {
            isBreak  -> "☕ LONG BREAK"
            session % 2 == 0 -> "⏸ SHORT BREAK"
            else     -> "⚡ WORK SESSION"
        }

        val btnBg = if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0")
                    else android.graphics.Color.parseColor("#ff1c1c1e")

        val root = createRootView(context, theme, customs)
        val col = createColumnView(context)

        // ── HEADER ──
        col.addView(R.id.dynamic_view_container,
            createHeader(context, "POMODORO", "tomato", accentColor, subtextColor))

        // ── SESSION TYPE BADGE ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, sessionLabel, 9f, accentColor, marginTop = 0f, isBold = true))

        // ── LARGE COUNTDOWN ──
        val timeStr = customs?.optString("valueText") ?: "25:00"
        col.addView(R.id.dynamic_view_container,
            createTextView(context, timeStr, 34f, textColor, marginTop = 2f, isBold = true))

        // ── 4-SESSION TOMATO DOTS ──
        val dotsRow = createRowView(context)
        for (i in 1..4) {
            dotsRow.addView(R.id.dynamic_view_container,
                createTextView(context,
                    if (i < session) "🍅" else "○",
                    if (i == session) 14f else 10f,
                    if (i == session) accentColor else subtextColor,
                    marginTop = 0f))
        }
        col.addView(R.id.dynamic_view_container, dotsRow)
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "SESSION $session OF 4", 7f, subtextColor, marginTop = 1f))

        // ── BUTTONS ──
        val row = createRowView(context)
        row.addView(R.id.dynamic_view_container,
            createButtonView(context, "▶  START", "start_pomo", appWidgetId, textColor, btnBg))
        row.addView(R.id.dynamic_view_container,
            createButtonView(context, "⏭ SKIP", "skip_pomo", appWidgetId, textColor, btnBg))
        col.addView(R.id.dynamic_view_container, row)

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • POMO ENGINE", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
