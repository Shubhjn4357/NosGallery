package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

/**
 * NOSTextUsernameWidget
 * Design: Developer identity card — like a README author block.
 * TOP: @username in large monospace style + avatar initial glyph
 * MIDDLE: 3-line bio/stats grid (repos / followers / stars)
 * BOTTOM: Currently working on + active languages
 * Unique: The only "developer profile card" widget in the set.
 */
class NOSTextUsernameWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "productivity_text_username"

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
        val username = dynamicState.optString("githubUsername", "Shubhjn4357")
        val initial = username.take(1).uppercase()

        val root = createRootView(context, theme, customs)
        val col = createColumnView(context)

        // ── HEADER ──
        col.addView(R.id.dynamic_view_container,
            createHeader(context, "DEV PROFILE", "code", accentColor, subtextColor))

        // ── AVATAR + USERNAME ROW ──
        val idRow = createRowView(context)
        idRow.addView(R.id.dynamic_view_container,
            createTextView(context, "( $initial )", 20f, accentColor, marginTop = 0f, isBold = true))
        val nameCol = createColumnView(context)
        nameCol.addView(R.id.dynamic_view_container,
            createTextView(context, "@$username", 13f, textColor, marginTop = 4f, isBold = true))
        nameCol.addView(R.id.dynamic_view_container,
            createTextView(context, customs?.optString("subValueText") ?: "Full-Stack Dev", 8f, subtextColor, marginTop = 1f))
        idRow.addView(R.id.dynamic_view_container, nameCol)
        col.addView(R.id.dynamic_view_container, idRow)

        // ── STATS GRID ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 4f))
        val statsRow = createRowView(context)
        listOf("⚙ 42" to "REPOS", "👥 128" to "FOLLOW", "★ 891" to "STARS").forEach { (val_, lbl) ->
            val statCol = createColumnView(context)
            statCol.addView(R.id.dynamic_view_container,
                createTextView(context, val_, 10f, accentColor, marginTop = 0f, isBold = true))
            statCol.addView(R.id.dynamic_view_container,
                createTextView(context, lbl, 6f, subtextColor, marginTop = 0f))
            statsRow.addView(R.id.dynamic_view_container, statCol)
            statsRow.addView(R.id.dynamic_view_container,
                createTextView(context, "  │  ", 6f, subtextColor, marginTop = 0f))
        }
        col.addView(R.id.dynamic_view_container, statsRow)

        // ── CURRENT PROJECT ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 4f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "▸ NosGallery · Kotlin / Compose", 8f, subtextColor, marginTop = 1f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "▸ Streak: 47 days 🔥", 8f, accentColor, marginTop = 1f, isBold = true))

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • STUDIO", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
