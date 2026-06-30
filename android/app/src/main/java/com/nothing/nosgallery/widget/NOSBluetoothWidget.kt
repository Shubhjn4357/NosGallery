package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import         android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

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

        val root = createRootView(context, theme, customs)
        val container = createColumnView(context)

        val title = customs?.optString("titleText") ?: "BLUETOOTH"
        container.addView(R.id.dynamic_view_container, createHeader(context, title, "home", accentColor, subtextColor))
        
        val valTxt = customs?.optString("valueText") ?: "CONNECTED"
        container.addView(R.id.dynamic_view_container, createTextView(context, valTxt, 18f, textColor, marginTop = 6f))
        
        val sub = customs?.optString("subValueText") ?: "NOTHING EAR (2)"
        container.addView(R.id.dynamic_view_container, createTextView(context, sub, 8f, subtextColor, marginTop = 4f))
        
        val footer = customs?.optString("footerText") ?: "NOS • HOME"
        container.addView(R.id.dynamic_view_container, createFooter(context, footer, accentColor))

        root.addView(R.id.nos_widget_root, container)
        return root
    }
}
