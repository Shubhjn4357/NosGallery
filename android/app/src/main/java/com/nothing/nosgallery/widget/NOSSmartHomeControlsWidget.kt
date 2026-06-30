package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

class NOSSmartHomeControlsWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "smart_home_controls"

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

        val title = customs?.optString("titleText") ?: "SMART ROOM"
        container.addView(R.id.dynamic_view_container, createHeader(context, title, "home", accentColor, subtextColor))
        
        val valTxt = customs?.optString("valueText") ?: "3 Devices On"
        container.addView(R.id.dynamic_view_container, createTextView(context, valTxt, 16f, textColor, marginTop = 6f))

        // Device toggles row
        val row = createRowView(context)
        val colors = mapOf(
            "btnBg" to if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0") else android.graphics.Color.parseColor("#ff1c1c1e")
        )
        row.addView(R.id.dynamic_view_container, createButtonView(context, "LIGHTS", "toggle_lights", appWidgetId, textColor, colors["btnBg"]!!))
        row.addView(R.id.dynamic_view_container, createButtonView(context, "AC", "toggle_ac", appWidgetId, textColor, colors["btnBg"]!!))
        
        container.addView(R.id.dynamic_view_container, row)

        val footer = customs?.optString("footerText") ?: "NOS • HOME"
        container.addView(R.id.dynamic_view_container, createFooter(context, footer, accentColor))

        root.addView(R.id.nos_widget_root, container)
        return root
    }
}
