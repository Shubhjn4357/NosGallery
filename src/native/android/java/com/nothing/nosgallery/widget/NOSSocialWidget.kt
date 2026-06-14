package com.nothing.nosgallery.widget

import android.content.Context
import android.view.View
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.util.Locale

open class NOSSocialWidget : NosBaseWidgetProvider() {

    override val categoryPrefix = "social_"
    open override val defaultTemplateId = "social_feed"

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

        val label = (customizations?.optString("titleText")?.takeIf { it.isNotEmpty() } ?: "SOCIAL")
            .uppercase(Locale.getDefault())
        views.setTextViewText(R.id.nos_widget_label, label)
        views.setTextColor(R.id.nos_widget_label, subtextColor)

        val valueText = customizations?.optString("valueText")?.takeIf { it.isNotEmpty() }

        when {
            templateId.contains("contact") -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "FAV CONTACT")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "TAP TO CALL  •  MOBILE")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • CONTACT")
            }
            templateId.contains("shortcuts") || templateId.contains("direct") -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "Socials")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "QUICK LINKS  •  TAP TO OPEN")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • SHORTCUTS")
            }
            templateId.contains("counter") || templateId.contains("follower") -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "12.4K")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "FOLLOWERS  •  +48 THIS WEEK")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • FOLLOWERS")
            }
            else -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "7 New")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "NOTIFICATIONS  •  3 MENTIONS")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • SOCIAL FEED")
            }
        }

        views.setTextColor(R.id.nos_widget_footer, accentColor)
    }
}
