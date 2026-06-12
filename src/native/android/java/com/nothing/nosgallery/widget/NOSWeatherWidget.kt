package com.nothing.nosgallery.widget

import android.content.Context
import android.view.View
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.util.Locale

open class NOSWeatherWidget : NosBaseWidgetProvider() {

    override val categoryPrefix = "weather_"
    open override val defaultTemplateId = "weather_current"

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

        val city = (customizations?.optString("titleText", null) ?: "LOCATION")
            .uppercase(Locale.getDefault())
        views.setTextViewText(R.id.nos_widget_label, city)
        views.setTextColor(R.id.nos_widget_label, subtextColor)

        val valueText = customizations?.optString("valueText", null)

        when {
            templateId.contains("aqi") -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "12 AQI")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "AIR QUALITY  •  EXCELLENT")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.VISIBLE)
                views.setProgressBar(R.id.nos_widget_progress, 100, 12, false)
            }
            templateId.contains("uv") -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "UV  3")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "UV INDEX  •  MODERATE")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
            }
            else -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "18°C")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "RAIN  •  HUM 74%  •  WIND 12 KM/H")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
            }
        }

        views.setTextViewText(R.id.nos_widget_footer, "NOS • WEATHER")
        views.setTextColor(R.id.nos_widget_footer, accentColor)
    }
}
