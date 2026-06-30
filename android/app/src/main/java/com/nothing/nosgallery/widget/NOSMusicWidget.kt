package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

class NOSMusicWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "productivity_music"

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
        val container = createColumnView(context)

        val title = customs?.optString("titleText") ?: "MUSIC PLAYER"
        container.addView(R.id.dynamic_view_container, createHeader(context, title, "music", accentColor, subtextColor))
        
        val valTxt = customs?.optString("valueText") ?: "Nothing (Spec)"
        container.addView(R.id.dynamic_view_container, createTextView(context, valTxt, 15f, textColor, marginTop = 6f))

        // Playback Controls Row
        val row = createRowView(context)
        val colors = mapOf(
            "btnBg" to if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0") else android.graphics.Color.parseColor("#ff1c1c1e")
        )
        row.addView(R.id.dynamic_view_container, createButtonView(context, "⏮", "prev_song", appWidgetId, textColor, colors["btnBg"]!!))
        row.addView(R.id.dynamic_view_container, createButtonView(context, "▶", "play_song", appWidgetId, textColor, colors["btnBg"]!!))
        row.addView(R.id.dynamic_view_container, createButtonView(context, "⏭", "next_song", appWidgetId, textColor, colors["btnBg"]!!))
        
        container.addView(R.id.dynamic_view_container, row)

        val footer = customs?.optString("footerText") ?: "NOS • MUSIC"
        container.addView(R.id.dynamic_view_container, createFooter(context, footer, accentColor))

        root.addView(R.id.nos_widget_root, container)
        return root
    }
}
