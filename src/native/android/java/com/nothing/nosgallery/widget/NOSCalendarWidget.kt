package com.nothing.nosgallery.widget

import android.content.Context
import android.view.View
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

open class NOSCalendarWidget : NosBaseWidgetProvider() {

    override val categoryPrefix = "calendar_"
    open override val defaultTemplateId = "calendar_monthly"

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

        val label = (customizations?.optString("titleText")?.takeIf { it.isNotEmpty() } ?: "CALENDAR")
            .uppercase(Locale.getDefault())
        views.setTextViewText(R.id.nos_widget_label, label)
        views.setTextColor(R.id.nos_widget_label, subtextColor)

        when {
            templateId.contains("progress") -> {
                // Year progress
                val dayOfYear = java.util.Calendar.getInstance().get(java.util.Calendar.DAY_OF_YEAR)
                val totalDays = if (java.util.Calendar.getInstance().getActualMaximum(java.util.Calendar.DAY_OF_YEAR) == 366) 366 else 365
                val pct = (dayOfYear * 100) / totalDays
                views.setTextViewText(R.id.nos_widget_value, "$pct%")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "YEAR PROGRESS  •  DAY $dayOfYear / $totalDays")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.VISIBLE)
                views.setProgressBar(R.id.nos_widget_progress, 100, pct, false)
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
                    views.setColorStateList(
                        R.id.nos_widget_progress,
                        "setProgressTintList",
                        android.content.res.ColorStateList.valueOf(accentColor)
                    )
                }
            }
            templateId.contains("agenda") || templateId.contains("list") -> {
                val sdf = SimpleDateFormat("EEE, MMM d", Locale.getDefault())
                views.setTextViewText(R.id.nos_widget_value, sdf.format(Date()).uppercase(Locale.getDefault()))
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "▪ 09:30 DAILY SYNC  ▪ 11:00 REVIEW")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
            }
            else -> {
                // Month view
                val sdf = SimpleDateFormat("MMM yyyy", Locale.getDefault())
                val dayNum = SimpleDateFormat("d", Locale.getDefault()).format(Date())
                views.setTextViewText(R.id.nos_widget_value, "DAY  $dayNum")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, sdf.format(Date()).uppercase(Locale.getDefault()))
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
            }
        }

        views.setTextViewText(R.id.nos_widget_footer, "NOS • CALENDAR")
        views.setTextColor(R.id.nos_widget_footer, accentColor)
    }
}
