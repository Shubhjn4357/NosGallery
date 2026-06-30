package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

class NOSClockDotWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "clock_dot"

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

        val title = customs?.optString("titleText") ?: "NOTHING CLOCK"
        container.addView(R.id.dynamic_view_container, createHeader(context, title, "clock", accentColor, subtextColor))
        container.addView(R.id.dynamic_view_container, createClockView(context, "HH:mm", 28f, textColor, marginTop = 6f))
        
        val sub = customs?.optString("subValueText") ?: "TAP TO OPEN"
        container.addView(R.id.dynamic_view_container, createTextView(context, sub, 8f, subtextColor, marginTop = 4f))
        
        val footer = customs?.optString("footerText") ?: "NOS • CLOCK"
        container.addView(R.id.dynamic_view_container, createFooter(context, footer, accentColor))

        root.addView(R.id.nos_widget_root, container)
        return root
    }
}
