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
        theme: String
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
                val hydVal = valueText ?: "1,200 ML"
                views.setTextViewText(R.id.nos_widget_value, hydVal)
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "HYDRATION  •  GOAL 2,500 ML")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.VISIBLE)
                views.setProgressBar(R.id.nos_widget_progress, 100, 48, false)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • HYDRATION")
            }
            templateId.contains("breath") || templateId.contains("meditation") -> {
                views.setTextViewText(R.id.nos_widget_value, "Ready")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "BREATHE WORK  •  4-7-8 PATTERN")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • MINDFULNESS")
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
            }
        }

        views.setTextColor(R.id.nos_widget_footer, accentColor)
    }
}
