package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

/**
 * NOSSocialShortcutsWidget
 * Design: Contact avatar grid — like a speed-dial screen.
 * TOP: "DIRECT MESSAGE" header
 * MIDDLE: 2x2 grid of avatar initial circles with app icon badge
 * BOTTOM: "MESSAGE" button per contact
 * Unique: Only widget laid out as a 2x2 avatar grid speed-dial.
 */
class NOSSocialShortcutsWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "social_shortcuts"

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

        val btnBg = if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0")
                    else android.graphics.Color.parseColor("#ff1c1c1e")

        val root = createRootView(context, theme, customs)
        val col = createColumnView(context)

        // ── HEADER ──
        col.addView(R.id.dynamic_view_container,
            createHeader(context, "SPEED DIAL", "contacts", accentColor, subtextColor))

        // ── CONTACT GRID (2 rows of 2) ──
        val contacts = listOf(
            Triple("A", customs?.optString("valueText") ?: "Alice", "📱"),
            Triple("B", "Bob", "✈️"),
            Triple("K", "Kai", "📱"),
            Triple("M", "Maya", "📸")
        )

        contacts.chunked(2).forEach { row ->
            val rowView = createRowView(context)
            row.forEach { (initial, name, icon) ->
                val contactCol = createColumnView(context)
                contactCol.addView(R.id.dynamic_view_container,
                    createTextView(context, "( $initial )", 14f, accentColor, marginTop = 0f, isBold = true))
                contactCol.addView(R.id.dynamic_view_container,
                    createTextView(context, name.take(8), 7f, textColor, marginTop = 1f, isBold = true))
                contactCol.addView(R.id.dynamic_view_container,
                    createButtonView(context, "$icon MSG", "chat_$name", appWidgetId, subtextColor, btnBg))
                rowView.addView(R.id.dynamic_view_container, contactCol)

                // spacer
                rowView.addView(R.id.dynamic_view_container,
                    createTextView(context, "  │  ", 8f, subtextColor, marginTop = 0f))
            }
            col.addView(R.id.dynamic_view_container, rowView)
        }

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • SOCIAL", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
