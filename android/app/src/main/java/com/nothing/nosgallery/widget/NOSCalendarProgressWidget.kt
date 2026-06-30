package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.util.Calendar

class NOSCalendarProgressWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "calendar_progress"

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

        val title = customs?.optString("titleText") ?: "YEAR PROGRESS"
        container.addView(R.id.dynamic_view_container, createHeader(context, title, "calendar", accentColor, subtextColor))

        // Calculate actual year progress percentage
        val cal = Calendar.getInstance()
        val dayOfYear = cal.get(Calendar.DAY_OF_YEAR)
        val totalDays = if (cal.getActualMaximum(Calendar.DAY_OF_YEAR) > 365) 366 else 365
        val pct = (dayOfYear * 100) / totalDays

        container.addView(R.id.dynamic_view_container, createProgressBar(context, pct, 100, accentColor))
        
        val sub = customs?.optString("subValueText") ?: "$pct% OF YEAR COMPLETED"
        container.addView(R.id.dynamic_view_container, createTextView(context, sub, 8f, textColor, marginTop = 6f))
        
        val footer = customs?.optString("footerText") ?: "NOS • CALENDAR"
        container.addView(R.id.dynamic_view_container, createFooter(context, footer, accentColor))

        root.addView(R.id.nos_widget_root, container)
        return root
    }
}
