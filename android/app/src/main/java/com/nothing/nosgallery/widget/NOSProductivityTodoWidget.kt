package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

class NOSProductivityTodoWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "productivity_todo"

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

        val title = customs?.optString("titleText") ?: "TO-DO LIST"
        container.addView(R.id.dynamic_view_container, createHeader(context, title, "checksquare", accentColor, subtextColor))
        
        val valTxt = customs?.optString("valueText") ?: "☑️ Prep Presentation"
        container.addView(R.id.dynamic_view_container, createTextView(context, valTxt, 15f, textColor, marginTop = 6f))
        
        val sub = customs?.optString("subValueText") ?: "3 ITEMS REMAINING"
        container.addView(R.id.dynamic_view_container, createTextView(context, sub, 8f, subtextColor, marginTop = 4f))
        
        val footer = customs?.optString("footerText") ?: "NOS • PRODUCTIVITY"
        container.addView(R.id.dynamic_view_container, createFooter(context, footer, accentColor))

        root.addView(R.id.nos_widget_root, container)
        return root
    }
}
