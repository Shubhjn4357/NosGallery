package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.util.Locale

/**
 * NOSSoundControlWidget
 * Design: Ringer mode mixer — like a vertical audio board.
 * TOP: Current mode shown as a large icon glyph (🔔 / 📳 / 🔕)
 * MIDDLE: 3 mode selector tiles side-by-side (RING / VIBRATE / SILENT)
 *         with filled/unfilled state
 * BOTTOM: Volume level indicator (notch bars) + "MEDIA VOL" label
 * Unique: Only widget with an inline 3-mode sound profile selector tiles.
 */
class NOSSoundControlWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "smart_home_sound_control"

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
        val profile = dynamicState.optString("soundProfile", "vibrate").lowercase(Locale.getDefault())

        val modeIcon = when (profile) {
            "ring"    -> "🔔"
            "silent"  -> "🔕"
            else      -> "📳"
        }
        val modeLabel = profile.uppercase(Locale.getDefault())

        val btnBg = if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0")
                    else android.graphics.Color.parseColor("#ff1c1c1e")

        val root = createRootView(context, theme, customs)
        val col = createColumnView(context)

        // ── HEADER ──
        col.addView(R.id.dynamic_view_container,
            createHeader(context, "SOUND CONTROL", "volume", accentColor, subtextColor))

        // ── CURRENT MODE ICON ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, modeIcon, 36f, textColor, marginTop = 2f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, modeLabel, 10f, accentColor, marginTop = 0f, isBold = true))

        // ── 3 MODE SELECTOR TILES ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 4f))
        val modeRow = createRowView(context)
        listOf("ring" to "🔔 RING", "vibrate" to "📳 VIB", "silent" to "🔕 SILL").forEach { (key, lbl) ->
            modeRow.addView(R.id.dynamic_view_container,
                createButtonView(context,
                    if (profile == key) "◉ ${lbl.split(" ")[1]}" else "○ ${lbl.split(" ")[1]}",
                    "set_sound_$key", appWidgetId,
                    if (profile == key) accentColor else subtextColor,
                    btnBg))
        }
        col.addView(R.id.dynamic_view_container, modeRow)

        // ── VOLUME NOTCH BARS ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 4f))
        val volLevel = if (profile == "ring") 7 else if (profile == "vibrate") 0 else 0
        val volRow = createRowView(context)
        for (i in 1..10) {
            volRow.addView(R.id.dynamic_view_container,
                createTextView(context, if (i <= volLevel) "▐" else "│",
                    (6 + i).toFloat(),
                    if (i <= volLevel) accentColor else subtextColor,
                    marginTop = 0f))
        }
        col.addView(R.id.dynamic_view_container, volRow)
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "MEDIA VOLUME", 7f, subtextColor, marginTop = 1f))

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • SOUND", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
