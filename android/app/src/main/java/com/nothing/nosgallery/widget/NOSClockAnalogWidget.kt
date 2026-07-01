package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

class NOSClockAnalogWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "clock_analog"

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

        val title = customs?.optString("titleText") ?: "ANALOG DIAL"
        container.addView(R.id.dynamic_view_container, createHeader(context, title, "clock", accentColor, subtextColor))

        val now = Date()
        val formatTime = SimpleDateFormat("h:mm a", Locale.getDefault()).format(now).uppercase(Locale.getDefault())

        // Render time with large typography
        container.addView(R.id.dynamic_view_container, createTextView(context, formatTime, 22f, textColor, marginTop = 6f))

        // Radial progress visual mockup: mock degrees
        val cal = Calendar.getInstance()
        val hour = cal.get(Calendar.HOUR)
        val min = cal.get(Calendar.MINUTE)
        val sec = cal.get(Calendar.SECOND)
        
        val radialStatus = "HR: ${hour * 30}° • MIN: ${min * 6}° • SEC: ${sec * 6}°"
        container.addView(R.id.dynamic_view_container, createTextView(context, radialStatus, 8f, subtextColor, marginTop = 4f))

        val footer = customs?.optString("footerText") ?: "NOS • ANALOG ENGINE"
        container.addView(R.id.dynamic_view_container, createFooter(context, footer, accentColor))

        root.addView(R.id.nos_widget_root, container)
        return root
    }
}
