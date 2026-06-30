package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

class NOSDeveloperCpuWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "developer_cpu"

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

        val title = customs?.optString("titleText") ?: "CPU MONITOR"
        container.addView(R.id.dynamic_view_container, createHeader(context, title, "terminal", accentColor, subtextColor))
        
        val valTxt = customs?.optString("valueText") ?: "CPU: 28%"
        container.addView(R.id.dynamic_view_container, createTextView(context, valTxt, 20f, textColor, marginTop = 6f))
        
        container.addView(R.id.dynamic_view_container, createProgressBar(context, 28, 100, accentColor))
        
        val sub = customs?.optString("subValueText") ?: "4 Cores Active"
        container.addView(R.id.dynamic_view_container, createTextView(context, sub, 8f, subtextColor, marginTop = 4f))
        
        val footer = customs?.optString("footerText") ?: "NOS • DEV"
        container.addView(R.id.dynamic_view_container, createFooter(context, footer, accentColor))

        root.addView(R.id.nos_widget_root, container)
        return root
    }
}
