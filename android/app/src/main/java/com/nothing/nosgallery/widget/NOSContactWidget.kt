package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

/**
 * NOSContactWidget
 * Design: Personal contact card — like a business card on your home screen.
 * TOP: Large avatar initial circle + name + relationship tag
 * MIDDLE: 3 action buttons in a row (CALL / MSG / EMAIL)
 * BOTTOM: Last interaction time + mutual event reminder
 * Unique: Only widget designed as a single-contact personal card.
 */
class NOSContactWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "social_contact"

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

        val name = customs?.optString("valueText") ?: "Shubh"
        val initials = name.take(2).uppercase()
        val relation = customs?.optString("subValueText") ?: "Close Friend"
        val btnBg = if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0")
                    else android.graphics.Color.parseColor("#ff1c1c1e")

        val root = createRootView(context, theme, customs)
        val col = createColumnView(context)

        // ── HEADER ──
        col.addView(R.id.dynamic_view_container,
            createHeader(context, "FAV CONTACT", "person", accentColor, subtextColor))

        // ── AVATAR + NAME ──
        val cardRow = createRowView(context)
        val avatarCol = createColumnView(context)
        avatarCol.addView(R.id.dynamic_view_container,
            createTextView(context, "( $initials )", 22f, accentColor, marginTop = 0f, isBold = true))
        cardRow.addView(R.id.dynamic_view_container, avatarCol)

        val infoCol = createColumnView(context)
        infoCol.addView(R.id.dynamic_view_container,
            createTextView(context, name, 16f, textColor, marginTop = 4f, isBold = true))
        infoCol.addView(R.id.dynamic_view_container,
            createTextView(context, relation, 8f, accentColor, marginTop = 1f, isBold = true))
        infoCol.addView(R.id.dynamic_view_container,
            createTextView(context, "LAST SEEN: 2h ago", 7f, subtextColor, marginTop = 2f))
        cardRow.addView(R.id.dynamic_view_container, infoCol)
        col.addView(R.id.dynamic_view_container, cardRow)

        // ── 3 ACTION BUTTONS ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 6f))
        val actRow = createRowView(context)
        listOf("📞 CALL" to "call_contact",
               "💬 MSG"  to "msg_contact",
               "✉️ MAIL" to "mail_contact").forEach { (label, action) ->
            actRow.addView(R.id.dynamic_view_container,
                createButtonView(context, label, action, appWidgetId, textColor, btnBg))
        }
        col.addView(R.id.dynamic_view_container, actRow)

        // ── REMINDER ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "📅 Birthday in 3 days!", 8f, accentColor, marginTop = 4f, isBold = true))

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • CONTACTS", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
