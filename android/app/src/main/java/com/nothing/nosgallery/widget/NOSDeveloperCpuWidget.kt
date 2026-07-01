package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

/**
 * NOSDeveloperCpuWidget
 * Design: htop-inspired system monitor card.
 * TOP: CPU% (animated ASCII bar per core), RAM/DISK usage
 * MIDDLE: 4 CPU core bars (▓░ style, each labelled C0-C3) + usage %
 * BOTTOM: Device model + chip name + kernel version
 * Unique: Only widget with a per-core CPU bar layout.
 */
class NOSDeveloperCpuWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "developer_cpu"

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

        // Simulated CPU loads per core
        val corePcts = listOf(28, 42, 15, 63)
        val avgCpu = corePcts.average().toInt()

        val root = createRootView(context, theme, customs)
        val col = createColumnView(context)

        // ── HEADER ──
        col.addView(R.id.dynamic_view_container,
            createHeader(context, "SYSTEM MONITOR", "terminal", accentColor, subtextColor))

        // ── AGGREGATE STATS ROW ──
        val statsRow = createRowView(context)
        statsRow.addView(R.id.dynamic_view_container,
            createTextView(context, "CPU $avgCpu%", 12f, accentColor, marginTop = 0f, isBold = true))
        statsRow.addView(R.id.dynamic_view_container,
            createTextView(context, "  RAM 4.2/8GB", 9f, textColor, marginTop = 2f))
        statsRow.addView(R.id.dynamic_view_container,
            createTextView(context, "  DSK 45%", 9f, textColor, marginTop = 2f))
        col.addView(R.id.dynamic_view_container, statsRow)

        // ── PER-CORE BARS ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 4f))
        corePcts.forEachIndexed { idx, pct ->
            val coreRow = createRowView(context)
            val filled  = (pct / 10).coerceIn(0, 10)
            val bar = buildString {
                repeat(filled) { append("▓") }
                repeat(10 - filled) { append("░") }
            }
            val coreColor = when {
                pct >= 70 -> android.graphics.Color.parseColor("#ffff453a")
                pct >= 40 -> android.graphics.Color.parseColor("#ffffd60a")
                else      -> accentColor
            }
            coreRow.addView(R.id.dynamic_view_container,
                createTextView(context, "C$idx", 7f, subtextColor, marginTop = 2f, isBold = true))
            coreRow.addView(R.id.dynamic_view_container,
                createTextView(context, " $bar", 7f, coreColor, marginTop = 2f))
            coreRow.addView(R.id.dynamic_view_container,
                createTextView(context, " ${pct}%", 7f, subtextColor, marginTop = 2f))
            col.addView(R.id.dynamic_view_container, coreRow)
        }

        // ── CHIP INFO ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 2f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "Snapdragon 8 Gen 3  ·  8 CORES", 8f, subtextColor, marginTop = 1f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, customs?.optString("subValueText") ?: "Linux 6.1 · Android 15", 7f, subtextColor, marginTop = 1f))

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • SYSMON", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
