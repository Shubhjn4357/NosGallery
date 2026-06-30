package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

class NOSCameraWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "productivity_camera"

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

        val title = customs?.optString("titleText") ?: "CAMERA"
        container.addView(R.id.dynamic_view_container, createHeader(context, title, "camera", accentColor, subtextColor))
        
        container.addView(R.id.dynamic_view_container, createTextView(context, "Camera Ready", 16f, textColor, marginTop = 6f))

        val btnBg = if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0") else android.graphics.Color.parseColor("#ff1c1c1e")
        container.addView(R.id.dynamic_view_container, createButtonView(context, "OPEN CAMERA", "open_camera", appWidgetId, textColor, btnBg))
        
        val footer = customs?.optString("footerText") ?: "NOS • CAMERA"
        container.addView(R.id.dynamic_view_container, createFooter(context, footer, accentColor))

        root.addView(R.id.nos_widget_root, container)
        return root
    }
}
