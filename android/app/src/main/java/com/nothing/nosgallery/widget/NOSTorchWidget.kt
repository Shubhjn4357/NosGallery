package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

/**
 * NOSTorchWidget
 * Design: Flashlight UI card — like a dedicated torch app.
 * TOP: Beam/ray radial glow text art (when ON: bright halo; when OFF: dim)
 * MIDDLE: ON / OFF state in large text + intensity slider mockup
 * BOTTOM: Usage timer (how long torch has been on) + TOGGLE button
 * Unique: Only widget with a visual torch beam glow effect (text art).
 */
class NOSTorchWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "smart_home_torch"

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
        val torchOn = dynamicState.optBoolean("torchEnabled", false)

        val onColor  = android.graphics.Color.parseColor("#ffffd60a")  // warm yellow
        val offColor = subtextColor

        val btnBg = if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0")
                    else android.graphics.Color.parseColor("#ff1c1c1e")

        val root = createRootView(context, theme, customs)
        val col = createColumnView(context)

        // ── HEADER ──
        col.addView(R.id.dynamic_view_container,
            createHeader(context, "TORCH", "flashlight", accentColor, subtextColor))

        // ── BEAM ART ──
        if (torchOn) {
            col.addView(R.id.dynamic_view_container,
                createTextView(context, "·  ·  ·  ·  ·", 6f, onColor, marginTop = 0f))
            col.addView(R.id.dynamic_view_container,
                createTextView(context, "·  ·  ★  ·  ·", 14f, onColor, marginTop = -2f, isBold = true))
            col.addView(R.id.dynamic_view_container,
                createTextView(context, "·  ·  ·  ·  ·", 6f, onColor, marginTop = -2f))
        } else {
            col.addView(R.id.dynamic_view_container,
                createTextView(context, "☆", 34f, offColor, marginTop = 2f))
        }

        // ── STATUS ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context,
                if (torchOn) "● ON  —  BRIGHT" else "○ OFF",
                12f,
                if (torchOn) onColor else offColor,
                marginTop = 2f, isBold = true))

        // ── INTENSITY NOTCH STRIP ──
        if (torchOn) {
            col.addView(R.id.dynamic_view_container,
                createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 4f))
            val notchRow = createRowView(context)
            for (i in 1..8) {
                notchRow.addView(R.id.dynamic_view_container,
                    createTextView(context, "▐", (5 + i).toFloat(), onColor, marginTop = 0f))
            }
            col.addView(R.id.dynamic_view_container, notchRow)
            col.addView(R.id.dynamic_view_container,
                createTextView(context, "INTENSITY: FULL (100%)", 7f, subtextColor, marginTop = 1f))
        }

        // ── TOGGLE ──
        col.addView(R.id.dynamic_view_container,
            createButtonView(context,
                if (torchOn) "★  TURN OFF" else "☆  TURN ON",
                "toggle_torch", appWidgetId,
                if (torchOn) onColor else textColor,
                btnBg))

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • TORCH", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
