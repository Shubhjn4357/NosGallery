package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

class NOSDeveloperGitWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "developer_git"

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

        val title = customs?.optString("titleText") ?: "GITHUB GRID"
        container.addView(R.id.dynamic_view_container, createHeader(context, title, "terminal", accentColor, subtextColor))
        
        val valTxt = customs?.optString("valueText") ?: "1,240 COMMITS"
        container.addView(R.id.dynamic_view_container, createTextView(context, valTxt, 18f, textColor, marginTop = 6f))
        
        val sub = customs?.optString("subValueText") ?: "Last commit: 2h ago"
        container.addView(R.id.dynamic_view_container, createTextView(context, sub, 8f, subtextColor, marginTop = 4f))
        
        val footer = customs?.optString("footerText") ?: "NOS • DEVELOPER"
        container.addView(R.id.dynamic_view_container, createFooter(context, footer, accentColor))

        root.addView(R.id.nos_widget_root, container)
        return root
    }
}
