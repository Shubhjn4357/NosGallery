package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

class NOSHealthStepsWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "health_steps"

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

        val title = customs?.optString("titleText") ?: "STEPS TRACKER"
        container.addView(R.id.dynamic_view_container, createHeader(context, title, "heart", accentColor, subtextColor))
        
        val valTxt = customs?.optString("valueText") ?: "👣 5,420 STEPS"
        container.addView(R.id.dynamic_view_container, createTextView(context, valTxt, 20f, textColor, marginTop = 6f))
        
        container.addView(R.id.dynamic_view_container, createProgressBar(context, 54, 100, accentColor))
        
        val sub = customs?.optString("subValueText") ?: "Goal: 10,000 steps"
        container.addView(R.id.dynamic_view_container, createTextView(context, sub, 8f, subtextColor, marginTop = 4f))
        
        val footer = customs?.optString("footerText") ?: "NOS • HEALTH"
        container.addView(R.id.dynamic_view_container, createFooter(context, footer, accentColor))

        root.addView(R.id.nos_widget_root, container)
        return root
    }
}
