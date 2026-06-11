package com.nothing.nosgallery.widget

import android.content.Context
import android.view.View
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.util.Locale

open class NOSDeveloperWidget : NosBaseWidgetProvider() {

    override val categoryPrefix = "developer_"
    open override val defaultTemplateId = "developer_git"

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

        val label = (customizations?.optString("titleText", null) ?: "DEVELOPER")
            .uppercase(Locale.getDefault())
        views.setTextViewText(R.id.nos_widget_label, label)
        views.setTextColor(R.id.nos_widget_label, subtextColor)

        val valueText = customizations?.optString("valueText", null)

        when {
            templateId.contains("git") || templateId.contains("commit") -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "27 Commits")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "STREAK 14 DAYS  •  7 REPOS ACTIVE")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.VISIBLE)
                views.setProgressBar(R.id.nos_widget_progress, 100, 78, false)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • GITHUB")
            }
            templateId.contains("build") || templateId.contains("ci") || templateId.contains("deploy") -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "Deploying...")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "CI/CD PIPELINE  •  STAGE 3 / 5")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.VISIBLE)
                views.setProgressBar(R.id.nos_widget_progress, 100, 60, false)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • CI/CD")
            }
            templateId.contains("cpu") || templateId.contains("server") -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "CPU: 28%")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "RAM 42%  •  DISK 61%  •  NET ↑ 1.2 MB/S")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.VISIBLE)
                views.setProgressBar(R.id.nos_widget_progress, 100, 28, false)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • SYSTEM MONITOR")
            }
            else -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "Active")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "DEV  •  TOOLS RUNNING")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • DEVELOPER")
            }
        }

        views.setTextColor(R.id.nos_widget_footer, accentColor)
    }
}
