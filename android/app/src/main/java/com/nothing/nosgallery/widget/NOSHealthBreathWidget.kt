package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

/**
 * NOSHealthBreathWidget
 * Design: Guided breathing card with 4-7-8 technique phases displayed.
 * TOP: Session type badge + current state (INHALE / HOLD / EXHALE)
 * MIDDLE: Concentric ring indicator (text art rings in 3 sizes)
 * BOTTOM: Breath count streak + START / PAUSE buttons
 * Unique: Only widget using ASCII concentric circles as a visual pacer.
 */
class NOSHealthBreathWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "health_breath"

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
        val breathCount = dynamicState.optInt("breathCount", 0)

        val root = createRootView(context, theme, customs)
        val col = createColumnView(context)

        // ── HEADER ──
        col.addView(R.id.dynamic_view_container,
            createHeader(context, "BREATHING PACER", "wind", accentColor, subtextColor))

        // ── TECHNIQUE BADGE ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "4 · 7 · 8  TECHNIQUE", 8f, accentColor, marginTop = 2f, isBold = true))

        // ── CONCENTRIC RING VISUALISER (text art) ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "◌", 8f, subtextColor, marginTop = 2f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "◎", 18f, subtextColor, marginTop = -2f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "●", 32f, accentColor, marginTop = -6f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "INHALE...", 9f, textColor, marginTop = -4f, isBold = true))

        // ── PHASE TIMELINE (4s – 7s – 8s) ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "IN:4s  HOLD:7s  OUT:8s", 8f, subtextColor, marginTop = 4f))

        // ── STREAK + BUTTON ──
        if (breathCount > 0) {
            col.addView(R.id.dynamic_view_container,
                createTextView(context, "🔥 $breathCount BREATHS TODAY", 8f, accentColor, marginTop = 2f, isBold = true))
        }

        val btnBg = if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0")
                    else android.graphics.Color.parseColor("#ff1c1c1e")
        col.addView(R.id.dynamic_view_container,
            createButtonView(context, "▶  START SESSION", "toggle_breath", appWidgetId, textColor, btnBg))

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • BREATH", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
