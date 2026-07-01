package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.os.Build
import android.util.TypedValue
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

class NOSQuickControlsWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "developer_quick_controls"

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

        val title = customs?.optString("titleText") ?: "QUICK CONTROLS"
        container.addView(R.id.dynamic_view_container, createHeader(context, title, "terminal", accentColor, subtextColor))

        // Create a 2x2 circular toggles grid mimicking Nothing OS Control Center
        val row1 = createRowView(context)
        row1.addView(R.id.dynamic_view_container, createControlTile(context, "WiFi", "toggle_wifi", appWidgetId, true, textColor, accentColor))
        row1.addView(R.id.dynamic_view_container, createControlTile(context, "BT", "toggle_bt", appWidgetId, false, textColor, accentColor))
        container.addView(R.id.dynamic_view_container, row1)

        // Add tiny vertical spacer
        container.addView(R.id.dynamic_view_container, createSpacerView(context, 4f))

        val row2 = createRowView(context)
        row2.addView(R.id.dynamic_view_container, createControlTile(context, "Torch", "toggle_torch", appWidgetId, false, textColor, accentColor))
        row2.addView(R.id.dynamic_view_container, createControlTile(context, "Mute", "cycle_sound", appWidgetId, true, textColor, accentColor))
        container.addView(R.id.dynamic_view_container, row2)

        val footer = customs?.optString("footerText") ?: "NOS • CONTROL PANEL"
        container.addView(R.id.dynamic_view_container, createFooter(context, footer, accentColor))

        root.addView(R.id.nos_widget_root, container)
        return root
    }

    private fun createControlTile(
        context: Context,
        label: String,
        action: String,
        appWidgetId: Int,
        isActive: Boolean,
        textColor: Int,
        accentColor: Int
    ): RemoteViews {
        val views = RemoteViews(context.packageName, R.layout.widget_dynamic_button)
        views.setTextViewText(R.id.dynamic_button, label)
        
        val tc = if (isActive) android.graphics.Color.BLACK else textColor
        views.setTextColor(R.id.dynamic_button, tc)
        views.setTextViewTextSize(R.id.dynamic_button, TypedValue.COMPLEX_UNIT_SP, 8.5f)

        val bg = if (isActive) accentColor else android.graphics.Color.parseColor("#ff1c1c1e")
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            views.setColorStateList(R.id.dynamic_button, "setBackgroundTintList", android.content.res.ColorStateList.valueOf(bg))
            views.setViewLayoutHeight(R.id.dynamic_button, 24f, TypedValue.COMPLEX_UNIT_DIP)
            views.setViewLayoutWidth(R.id.dynamic_button, 42f, TypedValue.COMPLEX_UNIT_DIP)
        } else {
            views.setInt(R.id.dynamic_button, "setBackgroundColor", bg)
        }

        val pi = getClickPendingIntent(context, appWidgetId, action)
        views.setOnClickPendingIntent(R.id.dynamic_button, pi)
        return views
    }

    private fun createSpacerView(context: Context, sizeDp: Float): RemoteViews {
        val spacer = RemoteViews(context.packageName, R.layout.widget_dynamic_spacer)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            spacer.setViewLayoutWidth(R.id.dynamic_spacer, 1f, TypedValue.COMPLEX_UNIT_DIP)
            spacer.setViewLayoutHeight(R.id.dynamic_spacer, sizeDp, TypedValue.COMPLEX_UNIT_DIP)
        }
        return spacer
    }
}
