package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

/**
 * NOSGoogleSearchWidget
 * Design: Material You search bar — full branded Nothing x Google panel.
 * TOP: Google G logo (text art) + "NOS SEARCH" label
 * MIDDLE: Search bar pill mockup (rounded, with mic icon)
 * BOTTOM: 4 quick-search chip suggestions row
 * Unique: Only widget styled as a full branded search bar panel.
 */
class NOSGoogleSearchWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "productivity_google_search"

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

        val btnBg = if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0")
                    else android.graphics.Color.parseColor("#ff1c1c1e")

        val root = createRootView(context, theme, customs)
        val col = createColumnView(context)

        // ── HEADER ──
        col.addView(R.id.dynamic_view_container,
            createHeader(context, "NOS  ×  GOOGLE", "search", accentColor, subtextColor))

        // ── SEARCH BAR MOCKUP ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────────────────────────", 5f, subtextColor, marginTop = 4f))
        val barRow = createRowView(context)
        barRow.addView(R.id.dynamic_view_container,
            createTextView(context, "🔍  ${customs?.optString("valueText") ?: "Search anything…"}", 11f, subtextColor, marginTop = 0f))
        barRow.addView(R.id.dynamic_view_container,
            createTextView(context, "  🎤", 11f, accentColor, marginTop = 0f))
        col.addView(R.id.dynamic_view_container, barRow)
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────────────────────────", 5f, subtextColor, marginTop = 0f))

        // ── SEARCH BUTTON ──
        col.addView(R.id.dynamic_view_container,
            createButtonView(context, "🔍  OPEN GOOGLE", "trigger_search", appWidgetId, textColor, btnBg))

        // ── QUICK CHIP ROW ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "QUICK SEARCH", 7f, subtextColor, marginTop = 6f, isBold = true))
        val chipRow = createRowView(context)
        listOf("Weather", "Translate", "Stocks", "Maps").forEach { chip ->
            chipRow.addView(R.id.dynamic_view_container,
                createButtonView(context, chip, "search_$chip", appWidgetId, subtextColor, btnBg))
        }
        col.addView(R.id.dynamic_view_container, chipRow)

        // ── TRENDING ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 4f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "🔥 Trending: Nothing Phone 3", 8f, subtextColor, marginTop = 1f))

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • SEARCH", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
