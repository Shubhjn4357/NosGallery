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
        theme: String,
        appWidgetId: Int
    ) {
        val customizations = config?.optJSONObject("customizations")
        val templateId = config?.optString("templateId", defaultTemplateId) ?: defaultTemplateId

        val accentColor = resolveAccentColor(config, theme)
        val textColor = resolveTextColor(config, theme)
        val subtextColor = themeSubtext(theme)

        views.setInt(R.id.nos_widget_dot, "setBackgroundColor", accentColor)

        val label = (customizations?.optString("titleText")?.takeIf { it.isNotEmpty() } ?: "SMART HOME")
            .uppercase(Locale.getDefault())
        views.setTextViewText(R.id.nos_widget_label, label)
        views.setTextColor(R.id.nos_widget_label, subtextColor)

        val valueText = customizations?.optString("valueText")?.takeIf { it.isNotEmpty() }

        when {
            templateId.contains("light") || templateId.contains("lamp") -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "Lights  ON")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "3 ROOMS  •  BRIGHTNESS 70%")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.VISIBLE)
                views.setProgressBar(R.id.nos_widget_progress, 100, 70, false)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • LIGHTING")
                views.setViewVisibility(R.id.nos_widget_buttons_row, View.GONE)
            }
            templateId.contains("temp") || templateId.contains("thermostat") -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "22°C")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "THERMOSTAT  •  SET 21°C")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • THERMOSTAT")
                views.setViewVisibility(R.id.nos_widget_buttons_row, View.GONE)
            }
            templateId.contains("torch") -> {
                val enabled = config?.optBoolean("torchEnabled", false) ?: false
                views.setTextViewText(R.id.nos_widget_value, if (enabled) "ON" else "OFF")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "SYSTEM FLASHLIGHT")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • FLASHLIGHT")

                // Override accent dot color based on flashlight state
                views.setInt(R.id.nos_widget_dot, "setBackgroundColor", if (enabled) accentColor else subtextColor)

                // Enable buttons
                views.setViewVisibility(R.id.nos_widget_buttons_row, View.VISIBLE)
                views.setViewVisibility(R.id.nos_widget_btn_left, View.VISIBLE)
                views.setTextViewText(R.id.nos_widget_btn_left, "TOGGLE")
                views.setOnClickPendingIntent(R.id.nos_widget_btn_left, getClickPendingIntent(context, appWidgetId, "toggle_torch"))
                
                views.setViewVisibility(R.id.nos_widget_btn_right, View.GONE)
                views.setViewVisibility(R.id.nos_widget_btn_divider, View.GONE)
            }
            templateId.contains("bluetooth") -> {
                views.setTextViewText(R.id.nos_widget_value, "CONNECTED")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "NOTHING EAR (2)")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • BLUETOOTH")
                views.setViewVisibility(R.id.nos_widget_buttons_row, View.GONE)
            }
            templateId.contains("sound") -> {
                val profile = config?.optString("soundProfile", "vibrate") ?: "vibrate"
                views.setTextViewText(R.id.nos_widget_value, profile.uppercase(Locale.getDefault()))
                views.setTextColor(R.id.nos_widget_value, textColor)
                val profileDesc = when (profile) {
                    "sound" -> "Ringer & alerts enabled"
                    "vibrate" -> "Calls silenced, motor active"
                    else -> "All alerts muted completely"
                }
                views.setTextViewText(R.id.nos_widget_sub_value, profileDesc)
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • SOUND PROFILE")

                // Enable cycle button
                views.setViewVisibility(R.id.nos_widget_buttons_row, View.VISIBLE)
                views.setViewVisibility(R.id.nos_widget_btn_left, View.VISIBLE)
                views.setTextViewText(R.id.nos_widget_btn_left, "CYCLE")
                views.setOnClickPendingIntent(R.id.nos_widget_btn_left, getClickPendingIntent(context, appWidgetId, "cycle_sound"))

                views.setViewVisibility(R.id.nos_widget_btn_right, View.GONE)
                views.setViewVisibility(R.id.nos_widget_btn_divider, View.GONE)
            }
            else -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "2 Active")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "SMART DEVICES  •  HOME AWAY MODE")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • SMART HOME")
                views.setViewVisibility(R.id.nos_widget_buttons_row, View.GONE)
            }
        }

        views.setTextColor(R.id.nos_widget_footer, accentColor)
    }
}
