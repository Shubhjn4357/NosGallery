package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

/**
 * NOSFinanceCryptoWidget
 * Design: Live crypto ticker tape — exactly like a Bloomberg terminal.
 * TOP: BTC price in giant numbers + 24h delta badge (green/red)
 * MIDDLE: 3-coin mini ticker row (BTC / ETH / SOL) with arrows
 * BOTTOM: 12-bar ASCII sparkline for price movement
 * Unique: Only widget with a multi-coin mini-ticker + ASCII sparkline.
 */
class NOSFinanceCryptoWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "finance_crypto"

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

        val green = android.graphics.Color.parseColor("#ff30d158")
        val red   = android.graphics.Color.parseColor("#ffff453a")

        val root = createRootView(context, theme, customs)
        val col = createColumnView(context)

        // ── HEADER ──
        col.addView(R.id.dynamic_view_container,
            createHeader(context, "CRYPTO MARKET", "chart", accentColor, subtextColor))

        // BTC price + delta
        val priceStr = customs?.optString("valueText") ?: "$64,250"
        val deltaStr = customs?.optString("subValueText") ?: "+4.25%"
        val isPositive = !deltaStr.startsWith("-")
        val deltaColor = if (isPositive) green else red
        val deltaArrow = if (isPositive) "▲" else "▼"

        col.addView(R.id.dynamic_view_container,
            createTextView(context, "₿  $priceStr", 26f, textColor, marginTop = 2f, isBold = true))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "$deltaArrow $deltaStr (24H)", 9f, deltaColor, marginTop = 0f, isBold = true))

        // ── MULTI-COIN TICKER ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 4f))
        val tickerRow = createRowView(context)
        listOf(
            Triple("BTC", "$64.2k", true),
            Triple("ETH", "$3,410", true),
            Triple("SOL", "$142",  false)
        ).forEach { (coin, price, up) ->
            val coinCol = createColumnView(context)
            coinCol.addView(R.id.dynamic_view_container,
                createTextView(context, coin, 7f, subtextColor, marginTop = 0f, isBold = true))
            coinCol.addView(R.id.dynamic_view_container,
                createTextView(context, price, 9f, textColor, marginTop = 1f, isBold = true))
            coinCol.addView(R.id.dynamic_view_container,
                createTextView(context, if (up) "▲" else "▼", 7f, if (up) green else red, marginTop = 0f))
            tickerRow.addView(R.id.dynamic_view_container, coinCol)
            // spacer
            tickerRow.addView(R.id.dynamic_view_container,
                createTextView(context, "  │  ", 7f, subtextColor, marginTop = 0f))
        }
        col.addView(R.id.dynamic_view_container, tickerRow)

        // ── ASCII SPARKLINE ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 4f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "▁▂▃▄▃▅▆▇▆▇████▆▅▄▃▅▇", 8f, if (isPositive) green else red, marginTop = 2f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "7D PRICE MOVEMENT", 6f, subtextColor, marginTop = 1f))

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • MARKET TAPE", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
