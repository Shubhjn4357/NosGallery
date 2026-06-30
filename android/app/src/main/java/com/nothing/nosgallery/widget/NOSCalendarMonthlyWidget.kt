package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class NOSCalendarMonthlyWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "calendar_monthly"

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

        val title = customs?.optString("titleText") ?: "MONTH VIEW"
        container.addView(R.id.dynamic_view_container, createHeader(context, title, "calendar", accentColor, subtextColor))
        
        // Show today's formatted date natively
        val sdf = SimpleDateFormat("MMM dd", Locale.getDefault())
        val dateStr = sdf.format(Date()).uppercase(Locale.getDefault())
        container.addView(R.id.dynamic_view_container, createTextView(context, dateStr, 24f, textColor, marginTop = 6f))
        
        val sub = customs?.optString("subValueText") ?: "TAP TO EXPAND"
        container.addView(R.id.dynamic_view_container, createTextView(context, sub, 8f, subtextColor, marginTop = 4f))
        
        val footer = customs?.optString("footerText") ?: "NOS • CALENDAR"
        container.addView(R.id.dynamic_view_container, createFooter(context, footer, accentColor))

        root.addView(R.id.nos_widget_root, container)
        return root
    }
}
