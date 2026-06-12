package com.nothing.nosgallery.widget

import android.content.Context
import android.view.View
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.util.Locale

open class NOSHealthWidget : NosBaseWidgetProvider() {

    override val categoryPrefix = "health_"
    open override val defaultTemplateId = "health_steps"

    open override fun populateViews(
        context: Context,
        views: RemoteViews,
        config: JSONObject?,
        theme: String,
        appWidgetId: Int
    ) {
        val customizations = config?.optJSONObject("customizations")
        val templateId = config?.optString("templateId", defaultTemplateId) ?: defaultTemplateId

        val accentColor = resolveAccentColor(config, theme)
        val textColor = resolveTextColor(config, theme)
        val subtextColor = themeSubtext(theme)

        views.setInt(R.id.nos_widget_dot, "setBackgroundColor", accentColor)

        val label = (customizations?.optString("titleText", null) ?: "HEALTH")
            .uppercase(Locale.getDefault())
        views.setTextViewText(R.id.nos_widget_label, label)
        views.setTextColor(R.id.nos_widget_label, subtextColor)

        val valueText = customizations?.optString("valueText", null)

        when {
            templateId.contains("water") || templateId.contains("hydration") -> {
                val intake = config?.optInt("waterIntake", 1000) ?: 1000
                val goal = config?.optInt("waterGoal", 2000) ?: 2000
                val progress = if (goal > 0) (intake * 100) / goal else 0

                views.setTextViewText(R.id.nos_widget_value, "${intake} ML")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "HYDRATION  •  GOAL ${goal} ML")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.VISIBLE)
                views.setProgressBar(R.id.nos_widget_progress, 100, progress, false)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • HYDRATION")

                // Enable buttons
                views.setViewVisibility(R.id.nos_widget_buttons_row, View.VISIBLE)
                views.setViewVisibility(R.id.nos_widget_btn_left, View.VISIBLE)
                views.setViewVisibility(R.id.nos_widget_btn_right, View.VISIBLE)
                views.setViewVisibility(R.id.nos_widget_btn_divider, View.VISIBLE)
                views.setTextViewText(R.id.nos_widget_btn_left, "+250ML")
                views.setOnClickPendingIntent(R.id.nos_widget_btn_left, getClickPendingIntent(context, appWidgetId, "add_water"))
                views.setTextViewText(R.id.nos_widget_btn_right, "RESET")
                views.setOnClickPendingIntent(R.id.nos_widget_btn_right, getClickPendingIntent(context, appWidgetId, "reset_water"))
            }
            templateId.contains("breath") || templateId.contains("meditation") -> {
                views.setTextViewText(R.id.nos_widget_value, "Ready")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "BREATHE WORK  •  4-7-8 PATTERN")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • MINDFULNESS")
                views.setViewVisibility(R.id.nos_widget_buttons_row, View.GONE)
            }
            else -> {
                // Steps
                val stepsVal = valueText ?: "8,432"
                views.setTextViewText(R.id.nos_widget_value, stepsVal)
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "STEPS TODAY  •  GOAL 10,000")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.VISIBLE)
                views.setProgressBar(R.id.nos_widget_progress, 100, 84, false)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • HEALTH")
                views.setViewVisibility(R.id.nos_widget_buttons_row, View.GONE)
            }
        }

        views.setTextColor(R.id.nos_widget_footer, accentColor)
    }
}
