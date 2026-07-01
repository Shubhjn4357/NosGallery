package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

/**
 * NOSAiBarWidget
 * Design: Model switcher bar — like a full-width segmented control.
 * TOP: Active model name (large) + response latency badge
 * MIDDLE: Segmented switcher: [GEMINI] [GPT-4] [CLAUDE] — active highlighted
 * BOTTOM: Last query snippet + token count + "NEW QUERY" button
 * Unique: Only widget with an inline model-switcher segmented control layout.
 */
class NOSAiBarWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "ai_bar"

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
        val activeModel = dynamicState.optString("activeAiModel", "gemini")

        val btnBg = if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0")
                    else android.graphics.Color.parseColor("#ff1c1c1e")

        val root = createRootView(context, theme, customs)
        val col = createColumnView(context)

        // ── HEADER ──
        col.addView(R.id.dynamic_view_container,
            createHeader(context, "AI MODEL ROUTER", "router", accentColor, subtextColor))

        // ── ACTIVE MODEL NAME ──
        val modelDisplayName = when (activeModel) {
            "gpt"    -> "GPT-4o"
            "claude" -> "CLAUDE 3.5"
            else     -> "GEMINI 1.5"
        }
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "✦ $modelDisplayName", 20f, textColor, marginTop = 2f, isBold = true))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "≈ 0.8s LATENCY  ·  128K CTX", 8f, subtextColor, marginTop = 0f))

        // ── SEGMENTED MODEL SWITCHER ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────────────────────────", 5f, subtextColor, marginTop = 6f))
        val switcherRow = createRowView(context)
        listOf("GEMINI" to "gemini", "GPT-4" to "gpt", "CLAUDE" to "claude").forEach { (label, key) ->
            val isActive = activeModel == key
            switcherRow.addView(R.id.dynamic_view_container,
                createButtonView(context,
                    if (isActive) "◉ $label" else "○ $label",
                    "select_$key", appWidgetId,
                    if (isActive) accentColor else subtextColor,
                    btnBg))
        }
        col.addView(R.id.dynamic_view_container, switcherRow)

        // ── LAST QUERY ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────────────────────────", 5f, subtextColor, marginTop = 2f))
        val lastQ = customs?.optString("valueText") ?: "\"Summarise my last 5 tasks…\""
        col.addView(R.id.dynamic_view_container,
            createTextView(context, lastQ, 9f, subtextColor, marginTop = 2f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "142 tokens used · cost: free", 7f, subtextColor, marginTop = 1f))

        // ── NEW QUERY BUTTON ──
        col.addView(R.id.dynamic_view_container,
            createButtonView(context, "✦  NEW AI QUERY", "open_ai_router", appWidgetId, textColor, btnBg))

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • AI ENGINE", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
