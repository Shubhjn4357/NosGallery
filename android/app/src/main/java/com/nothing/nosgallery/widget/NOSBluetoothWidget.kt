package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothProfile
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

/**
 * NOSBluetoothWidget
 * Design: Wireless hub card — like an iOS Control Centre Bluetooth panel.
 * TOP: BT Status (ON/OFF) + connected device name
 * MIDDLE: Signal strength dots (▪▪▪▪▪) + device type icon + battery
 * BOTTOM: Device list row (recent devices) + CONNECT/DISCONNECT button
 * Unique: Only widget with signal-strength dots and recent device list.
 */
class NOSBluetoothWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "smart_home_bluetooth"

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

        // Real BT state
        val adapter = BluetoothAdapter.getDefaultAdapter()
        val btOn = adapter?.isEnabled == true

        val green = android.graphics.Color.parseColor("#ff30d158")
        val gray  = subtextColor

        val btnBg = if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0")
                    else android.graphics.Color.parseColor("#ff1c1c1e")

        val root = createRootView(context, theme, customs)
        val col = createColumnView(context)

        // ── HEADER ──
        col.addView(R.id.dynamic_view_container,
            createHeader(context, "BLUETOOTH HUB", "bluetooth", accentColor, subtextColor))

        // ── STATUS + DEVICE ──
        val deviceName = customs?.optString("subValueText") ?: "Nothing Ear (2)"
        val statusStr  = if (btOn) "◉ CONNECTED" else "○ BLUETOOTH OFF"
        col.addView(R.id.dynamic_view_container,
            createTextView(context, statusStr, 12f, if (btOn) green else subtextColor, marginTop = 2f, isBold = true))
        if (btOn) {
            col.addView(R.id.dynamic_view_container,
                createTextView(context, "🎧  $deviceName", 10f, textColor, marginTop = 1f, isBold = true))
        }

        // ── SIGNAL STRENGTH BAR ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 4f))
        val signalRow = createRowView(context)
        val signalLevel = if (btOn) 4 else 0  // 0-5 bars
        for (i in 1..5) {
            signalRow.addView(R.id.dynamic_view_container,
                createTextView(context, if (i <= signalLevel) "▪" else "▫",
                    (8 + i * 2).toFloat(),
                    if (i <= signalLevel) accentColor else subtextColor,
                    marginTop = 0f))
        }
        signalRow.addView(R.id.dynamic_view_container,
            createTextView(context, "  🔋 72%", 8f, subtextColor, marginTop = 0f))
        col.addView(R.id.dynamic_view_container, signalRow)

        // ── RECENT DEVICES ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 4f))
        listOf("Nothing Ear (2)", "MacBook Air M2").forEach { device ->
            col.addView(R.id.dynamic_view_container,
                createTextView(context, "· $device", 8f, subtextColor, marginTop = 2f))
        }

        // ── TOGGLE BUTTON ──
        col.addView(R.id.dynamic_view_container,
            createButtonView(context,
                if (btOn) "⚡ DISCONNECT" else "⚡ ENABLE BT",
                "toggle_bluetooth", appWidgetId, textColor, btnBg))

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • BT HUB", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
