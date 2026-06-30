package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

class NOSHealthWaterWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "health_water"

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

        val title = customs?.optString("titleText") ?: "WATER TRACKER"
        container.addView(R.id.dynamic_view_container, createHeader(context, title, "heart", accentColor, subtextColor))

        val dynamicState = NosWidgetPreferences.getDynamicStateJson(context)
        val waterIntake = dynamicState.optInt("waterIntake", 1000)
        val waterGoal = dynamicState.optInt("waterGoal", 2000)

        container.addView(R.id.dynamic_view_container, createTextView(context, "$waterIntake / $waterGoal ml", 20f, textColor, marginTop = 6f))

        // Actions row
        val row = createRowView(context)
        val colors = mapOf(
            "btnBg" to if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0") else android.graphics.Color.parseColor("#ff1c1c1e")
        )
        val addActionObj = JSONObject().apply {
            put("type", "state")
            put("field", "waterIntake")
            put("mutation", "increment")
            put("amount", 250)
        }
        val resetActionObj = JSONObject().apply {
            put("type", "state")
            put("field", "waterIntake")
            put("mutation", "set")
            put("value", 0)
        }
        row.addView(R.id.dynamic_view_container, createButtonView(context, "+250ml", addActionObj.toString(), appWidgetId, textColor, colors["btnBg"]!!))
        row.addView(R.id.dynamic_view_container, createButtonView(context, "RESET", resetActionObj.toString(), appWidgetId, textColor, colors["btnBg"]!!))
        
        container.addView(R.id.dynamic_view_container, row)

        val footer = customs?.optString("footerText") ?: "NOS • HEALTH"
        container.addView(R.id.dynamic_view_container, createFooter(context, footer, accentColor))

        root.addView(R.id.nos_widget_root, container)
        return root
    }
}
