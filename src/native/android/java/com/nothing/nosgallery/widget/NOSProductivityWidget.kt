package com.nothing.nosgallery.widget

import android.content.Context
import android.view.View
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.util.Locale

open class NOSProductivityWidget : NosBaseWidgetProvider() {

    override val categoryPrefix = "productivity_"
    open override val defaultTemplateId = "productivity_todo"

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
                views.setViewVisibility(R.id.nos_widget_buttons_row, View.GONE)
            }
            templateId.contains("pomodoro") || templateId.contains("focus") || templateId.contains("timer") -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "25:00")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "DEEP WORK  •  SESSION 2")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • FOCUS TIMER")
                views.setViewVisibility(R.id.nos_widget_buttons_row, View.GONE)
            }
            templateId.contains("music") || templateId.contains("audio") || templateId.contains("player") -> {
                val playing = config?.optBoolean("musicPlaying", false) ?: false
                val trackIdx = config?.optInt("currentTrackIndex", 0) ?: 0
                val tracks = listOf("Nothing Beat", "Antigravity Chill", "Glyph Ambient")
                val trackName = valueText ?: tracks[trackIdx % tracks.size]

                views.setTextViewText(R.id.nos_widget_value, trackName)
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, if (playing) "PLAYING  •  VOLUME 50%" else "PAUSED")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • MUSIC")

                // Enable buttons
                views.setViewVisibility(R.id.nos_widget_buttons_row, View.VISIBLE)
                views.setViewVisibility(R.id.nos_widget_btn_left, View.VISIBLE)
                views.setViewVisibility(R.id.nos_widget_btn_right, View.VISIBLE)
                views.setViewVisibility(R.id.nos_widget_btn_divider, View.VISIBLE)
                views.setTextViewText(R.id.nos_widget_btn_left, if (playing) "PAUSE" else "PLAY")
                views.setOnClickPendingIntent(R.id.nos_widget_btn_left, getClickPendingIntent(context, appWidgetId, "music_play"))
                views.setTextViewText(R.id.nos_widget_btn_right, "SKIP")
                views.setOnClickPendingIntent(R.id.nos_widget_btn_right, getClickPendingIntent(context, appWidgetId, "music_skip"))
            }
            else -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "On Track")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "PRODUCTIVITY  •  ACTIVE")
                views.setTextColor(R.id.nos_widget_sub_value, subtextColor)
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • PRODUCTIVITY")
                views.setViewVisibility(R.id.nos_widget_buttons_row, View.GONE)
            }
        }

        views.setTextColor(R.id.nos_widget_footer, accentColor)
    }
}
