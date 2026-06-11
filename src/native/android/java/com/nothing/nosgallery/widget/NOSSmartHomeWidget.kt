package com.nothing.nosgallery.widget

import android.content.Context
import android.view.View
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.util.Locale

open class NOSSmartHomeWidget : NosBaseWidgetProvider() {

    override val categoryPrefix = "smart_home_"
    open override val defaultTemplateId = "smart_home_controls"

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

        val label = (customizations?.optString("titleText", null) ?: "SMART HOME")
            .uppercase(Locale.getDefault())
        views.setTextViewText(R.id.nos_widget_label, label)
        views.setTextColor(R.id.nos_widget_label, subtextColor)

        val valueText = customizations?.optString("valueText", null)

        when {
            templateId.contains("light") || templateId.contains("lamp") -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "Lights  ON")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "3 ROOMS  •  BRIGHTNESS 70%")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.VISIBLE)
                views.setProgressBar(R.id.nos_widget_progress, 100, 70, false)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • LIGHTING")
            }
            templateId.contains("temp") || templateId.contains("thermostat") -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "22°C")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "THERMOSTAT  •  SET 21°C")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • THERMOSTAT")
            }
            else -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "2 Active")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "SMART DEVICES  •  HOME AWAY MODE")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • SMART HOME")
            }
        }

        views.setTextColor(R.id.nos_widget_footer, accentColor)
    }
}
