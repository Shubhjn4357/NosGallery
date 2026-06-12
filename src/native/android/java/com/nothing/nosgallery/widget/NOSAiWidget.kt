package com.nothing.nosgallery.widget

import android.content.Context
import android.view.View
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.util.Locale

open class NOSAiWidget : NosBaseWidgetProvider() {

    override val categoryPrefix = "ai_"
    open override val defaultTemplateId = "ai_chat"

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

        val label = (customizations?.optString("titleText", null) ?: "NOS AI")
            .uppercase(Locale.getDefault())
        views.setTextViewText(R.id.nos_widget_label, label)
        views.setTextColor(R.id.nos_widget_label, subtextColor)

        val valueText = customizations?.optString("valueText", null)

        when {
            templateId.contains("brief") || templateId.contains("summary") -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "Briefing Ready")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "AI DAILY BRIEF  •  TAP TO READ")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • AI BRIEF")
            }
            templateId.contains("prompt") || templateId.contains("chat") -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "Ask NOS AI")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "QUICK PROMPT  •  TAP TO OPEN")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • AI PROMPT")
            }
            else -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "AI Active")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "AI ASSISTANT  •  READY")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • AI")
            }
        }

        views.setTextColor(R.id.nos_widget_footer, accentColor)
    }
}
