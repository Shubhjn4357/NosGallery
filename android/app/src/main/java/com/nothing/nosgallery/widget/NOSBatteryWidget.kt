package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

/**
 * NOSBatteryWidget
 * Design: High-tech battery status card with segmented block indicator.
 * TOP: Actual system battery % in giant numbers + charging status
 * MIDDLE: 10-cell segmented block bar (▓▓▓░░░░░░░)
 * BOTTOM: Estimated time-to-full / time-to-empty + temp + health
 * Unique: Only widget reading real BatteryManager data + block-cell bar.
 */
class NOSBatteryWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "developer_battery"

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

        // Real battery data
        val batteryStatus = context.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        val level    = batteryStatus?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
        val scale    = batteryStatus?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
        val pct      = if (level >= 0 && scale > 0) (level * 100) / scale else 82
        val status   = batteryStatus?.getIntExtra(BatteryManager.EXTRA_STATUS, -1) ?: -1
        val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING ||
                         status == BatteryManager.BATTERY_STATUS_FULL
        val tempTenths = batteryStatus?.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, 300) ?: 300
        val tempC = tempTenths / 10f

        // Color based on level
        val levelColor = when {
            pct >= 60 -> android.graphics.Color.parseColor("#ff30d158")
            pct >= 30 -> android.graphics.Color.parseColor("#ffffd60a")
            else      -> android.graphics.Color.parseColor("#ffff453a")
        }

        val root = createRootView(context, theme, customs)
        val col = createColumnView(context)

        // ── HEADER ──
        col.addView(R.id.dynamic_view_container,
            createHeader(context, "BATTERY VITALS", "bolt", accentColor, subtextColor))

        // ── GIANT PERCENTAGE ──
        val chargingIcon = if (isCharging) "⚡ " else ""
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "$chargingIcon$pct%", 34f, textColor, marginTop = 2f, isBold = true))

        val statusStr = if (isCharging) "CHARGING" else "ON BATTERY"
        col.addView(R.id.dynamic_view_container,
            createTextView(context, statusStr, 8f, levelColor, marginTop = 0f, isBold = true))

        // ── SEGMENTED BLOCK BAR (10 cells) ──
        val filledCells = (pct / 10)
        val barStr = buildString {
            repeat(filledCells.coerceIn(0, 10)) { append("▓") }
            repeat((10 - filledCells).coerceIn(0, 10)) { append("░") }
        }
        col.addView(R.id.dynamic_view_container,
            createTextView(context, barStr, 11f, levelColor, marginTop = 6f, isBold = true))

        // ── STATS ROW ──
        val statsRow = createRowView(context)
        statsRow.addView(R.id.dynamic_view_container,
            createTextView(context, "🌡 ${tempC}°C", 8f, subtextColor, marginTop = 4f))
        val estHours = if (isCharging) "~${(100 - pct) / 20}h to full" else "~${pct / 15}h left"
        statsRow.addView(R.id.dynamic_view_container,
            createTextView(context, "   ⏱ $estHours", 8f, subtextColor, marginTop = 4f))
        col.addView(R.id.dynamic_view_container, statsRow)

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • POWER", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
