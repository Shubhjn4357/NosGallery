package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * NOSSocialFeedWidget
 * Design: DM/Notification feed card — like a minimalist notification drawer.
 * TOP: Unread badge count + platform indicators (WA / IG / TG)
 * MIDDLE: 3 preview rows — avatar initial circle + sender + snippet + time
 * BOTTOM: "OPEN ALL" CTA
 * Unique: The only widget laid out as a notification preview list.
 */
class NOSSocialFeedWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "social_feed"

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
            createHeader(context, "SOCIAL FEED", "inbox", accentColor, subtextColor))

        // ── PLATFORM BADGES ──
        val time = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
        val platformRow = createRowView(context)
        listOf("📱 WA ·5" to 0xff25d366.toInt(),
               "📸 IG ·2" to 0xffe1306c.toInt(),
               "✈️ TG ·3" to 0xff0088cc.toInt()).forEach { (lbl, clr) ->
            platformRow.addView(R.id.dynamic_view_container,
                createTextView(context, lbl, 7f, clr, marginTop = 0f, isBold = true))
            platformRow.addView(R.id.dynamic_view_container,
                createTextView(context, "  ", 7f, subtextColor, marginTop = 0f))
        }
        col.addView(R.id.dynamic_view_container, platformRow)

        // ── SEPARATOR ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 4f))

        // ── NOTIFICATION PREVIEW ROWS ──
        val msgs = listOf(
            Triple("A", customs?.optString("valueText") ?: "Alice: Hey! You free tonight?", "2m"),
            Triple("B", "Bob: Ship it 🚀", "18m"),
            Triple("K", "Kai: Check the PR bro", "1h")
        )
        msgs.forEach { (initial, msg, ago) ->
            val row = createRowView(context)
            row.addView(R.id.dynamic_view_container,
                createTextView(context, "[$initial]", 9f, accentColor, marginTop = 0f, isBold = true))
            row.addView(R.id.dynamic_view_container,
                createTextView(context, " ${msg.take(22)}${if (msg.length > 22) "…" else ""}", 8f, textColor, marginTop = 0f))
            row.addView(R.id.dynamic_view_container,
                createTextView(context, " $ago", 7f, subtextColor, marginTop = 0f))
            col.addView(R.id.dynamic_view_container, row)
        }

        // ── OPEN CTA ──
        val btnBg = if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0")
                    else android.graphics.Color.parseColor("#ff1c1c1e")
        col.addView(R.id.dynamic_view_container,
            createButtonView(context, "OPEN ALL CHATS", "open_social", appWidgetId, textColor, btnBg))

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • SOCIAL", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
