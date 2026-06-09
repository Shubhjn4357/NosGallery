package com.nothing.nosgallery.widget

import android.content.Context
import android.view.View
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.util.Locale

class NOSProductivityWidget : NosBaseWidgetProvider() {

    override val categoryPrefix = "productivity_"

    override fun populateViews(
        context: Context,
        views: RemoteViews,
        config: JSONObject?,
        theme: String
    ) {
        val customizations = config?.optJSONObject("customizations")
        val templateId = config?.optString("templateId", "productivity_todo") ?: "productivity_todo"

        val accentColor = resolveAccentColor(config, theme)
        val textColor = resolveTextColor(config, theme)
        val subtextColor = themeSubtext(theme)

        views.setInt(R.id.nos_widget_dot, "setBackgroundColor", accentColor)

        val label = (customizations?.optString("titleText", null) ?: "TASKS")
            .uppercase(Locale.getDefault())
        views.setTextViewText(R.id.nos_widget_label, label)
        views.setTextColor(R.id.nos_widget_label, subtextColor)

        val valueText = customizations?.optString("valueText", null)

        when {
            templateId.contains("todo") || templateId.contains("task") || templateId.contains("checklist") -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "3 / 5")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "☑ Deploy Branch  ☐ Refactor Store")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.VISIBLE)
                views.setProgressBar(R.id.nos_widget_progress, 100, 60, false)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • TODO LIST")
            }
            templateId.contains("pomodoro") || templateId.contains("focus") || templateId.contains("timer") -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "25:00")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "DEEP WORK  •  SESSION 2")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • FOCUS TIMER")
            }
            else -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "On Track")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "PRODUCTIVITY  •  ACTIVE")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • PRODUCTIVITY")
            }
        }

        views.setTextColor(R.id.nos_widget_footer, accentColor)
    }
}
