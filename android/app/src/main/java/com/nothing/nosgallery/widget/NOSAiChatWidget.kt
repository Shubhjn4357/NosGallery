package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

/**
 * NOSAiChatWidget
 * Design: Floating chat bubble card — like iMessage on the home screen.
 * TOP: Model selector badge strip (Gemini / GPT / Claude)
 * MIDDLE: Last AI response in a rounded speech-bubble style block
 * BOTTOM: Input prompt hint + "ASK" CTA button
 * Unique: Only widget styled as a chat interface with message bubble.
 */
class NOSAiChatWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "ai_chat"

    private val quickPrompts = listOf(
        "Summarise my day",
        "What's next on my list?",
        "Give me a focus tip",
        "Translate this phrase"
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
            createHeader(context, "NOS AI CHAT", "sparkle", accentColor, subtextColor))

        // ── MODEL SELECTOR CHIPS ──
        val modelRow = createRowView(context)
        listOf("✦ GEMINI" to true, "◈ GPT-4" to false, "⊕ CLAUDE" to false).forEach { (name, active) ->
            modelRow.addView(R.id.dynamic_view_container,
                createTextView(context, name, 7f,
                    if (active) accentColor else subtextColor,
                    marginTop = 0f, isBold = active))
            modelRow.addView(R.id.dynamic_view_container,
                createTextView(context, "  ", 7f, subtextColor, marginTop = 0f))
        }
        col.addView(R.id.dynamic_view_container, modelRow)

        // ── SPEECH BUBBLE ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 4f))
        val lastMsg = customs?.optString("valueText")
            ?: "\"How can I help you today?\""
        col.addView(R.id.dynamic_view_container,
            createTextView(context, lastMsg, 11f, textColor, marginTop = 2f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 2f))

        // ── QUICK PROMPT CHIPS ──
        val chipRow = createRowView(context)
        quickPrompts.take(2).forEach { prompt ->
            val btnBg = if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0")
                        else android.graphics.Color.parseColor("#ff1c1c1e")
            chipRow.addView(R.id.dynamic_view_container,
                createButtonView(context, prompt.take(10) + "…", "ai_prompt_$prompt", appWidgetId, subtextColor, btnBg))
        }
        col.addView(R.id.dynamic_view_container, chipRow)

        // ── OPEN BUTTON ──
        val btnBg = if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0")
                    else android.graphics.Color.parseColor("#ff1c1c1e")
        col.addView(R.id.dynamic_view_container,
            createButtonView(context, "✦  OPEN FULL CHAT", "open_ai_chat", appWidgetId, textColor, btnBg))

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • AI ENGINE", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
