package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

/**
 * NOSProductivityFocusWidget
 * Design: Deep-work mode dashboard — inspired by Forest app.
 * TOP: FOCUS MODE label + DND status indicator
 * MIDDLE: Giant elapsed time + horizontal "focus intensity" waveform
 * BOTTOM: Today's total deep-work time + START/STOP button
 * Unique: Only widget with a focus-mode DND/distraction shield aesthetic.
 */
class NOSProductivityFocusWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "productivity_focus"

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
        val focusActive = dynamicState.optBoolean("focusActive", false)
        val focusTotalMin = dynamicState.optInt("focusTotalMin", 0)

        val btnBg = if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0")
                    else android.graphics.Color.parseColor("#ff1c1c1e")

        val root = createRootView(context, theme, customs)
        val col = createColumnView(context)

        // ── HEADER ──
        col.addView(R.id.dynamic_view_container,
            createHeader(context, "DEEP FOCUS", "shield", accentColor, subtextColor))

        // ── STATUS BADGE ──
        val statusLabel = if (focusActive) "● ACTIVE — DND ON" else "○ IDLE — STANDBY"
        col.addView(R.id.dynamic_view_container,
            createTextView(context, statusLabel, 8f,
                if (focusActive) android.graphics.Color.parseColor("#ff30d158") else subtextColor,
                marginTop = 0f, isBold = focusActive))

        // ── ELAPSED TIME ──
        val timeStr = customs?.optString("valueText") ?: "00:00"
        col.addView(R.id.dynamic_view_container,
            createTextView(context, timeStr, 36f, textColor, marginTop = 2f, isBold = true))

        // ── WAVEFORM INTENSITY (static for idle, peaks for active) ──
        val waveform = if (focusActive) "▁▂▄▆█▆▄▂▁▂▄▆█▆▄▂▁"
                       else            "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁"
        col.addView(R.id.dynamic_view_container,
            createTextView(context, waveform, 8f,
                if (focusActive) accentColor else subtextColor, marginTop = 4f))

        // ── DAILY STATS ──
        val totalStr = "%dh %02dm".format(focusTotalMin / 60, focusTotalMin % 60)
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "TODAY: $totalStr DEEP WORK", 8f, subtextColor, marginTop = 2f))

        // ── CTA BUTTON ──
        col.addView(R.id.dynamic_view_container,
            createButtonView(context,
                if (focusActive) "■  STOP FOCUS" else "▶  START FOCUS",
                "toggle_focus", appWidgetId, textColor, btnBg))

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • FOCUS", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
