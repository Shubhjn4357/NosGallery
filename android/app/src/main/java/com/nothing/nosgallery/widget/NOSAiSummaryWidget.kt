package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * NOSAiSummaryWidget
 * Design: Daily intelligence brief card — like a newspaper front page.
 * TOP: "TODAY'S BRIEF" masthead + date/time timestamp
 * MIDDLE: 3 bullet briefing lines (each on its own row with ▸ bullets)
 * BOTTOM: Word count + "REGENERATE" button
 * Unique: Only widget designed as a newspaper/brief digest card.
 */
class NOSAiSummaryWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "ai_summary"

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

        val dateStr = SimpleDateFormat("EEE, d MMM yyyy", Locale.getDefault()).format(Date()).uppercase()
        val timeStr = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())

        val btnBg = if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0")
                    else android.graphics.Color.parseColor("#ff1c1c1e")

        val root = createRootView(context, theme, customs)
        val col = createColumnView(context)

        // ── MASTHEAD ──
        col.addView(R.id.dynamic_view_container,
            createHeader(context, "TODAY'S BRIEF", "newspaper", accentColor, subtextColor))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "$dateStr  $timeStr", 7f, subtextColor, marginTop = 0f, isBold = true))

        // ── DIVIDER ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "═══════════════════════════════════════", 5f, accentColor, marginTop = 2f))

        // ── BRIEF BULLETS ──
        val briefItems = listOf(
            customs?.optString("valueText") ?: "▸ 3 meetings scheduled today",
            "▸ BTC rallied +4.2% overnight",
            "▸ Weather: Sunny, 24°C in Tokyo"
        )
        briefItems.forEach { line ->
            col.addView(R.id.dynamic_view_container,
                createTextView(context, line, 9f, textColor, marginTop = 3f))
        }

        // ── WORD COUNT ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 5f, subtextColor, marginTop = 4f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "✦ 42 WORDS  ·  GEMINI 1.5 PRO", 7f, subtextColor, marginTop = 1f))

        // ── REGEN BUTTON ──
        col.addView(R.id.dynamic_view_container,
            createButtonView(context, "↻  REGENERATE BRIEF", "regen_summary", appWidgetId, textColor, btnBg))

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • AI BRIEF", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
