package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.os.Build
import android.util.TypedValue
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

class NOSMusicWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "productivity_music"

    override fun onUpdateWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int,
        config: JSONObject?,
        theme: String
    ): RemoteViews {
        val customs = config?.optJSONObject("customizations")
        val accentColor = parseColorOr(customs?.optString("accentColor"), themeAccent(theme))
        val textColor = parseColorOr(customs?.optString("textColor"), themeText(theme))
        val subtextColor = parseColorOr(customs?.optString("subValueColor"), themeSubtext(theme))

        val root = createRootView(context, theme, customs)
        val container = createColumnView(context)

        val title = customs?.optString("titleText") ?: "MUSIC PLAYER"
        container.addView(R.id.dynamic_view_container, createHeader(context, title, "music", accentColor, subtextColor))

        // Song details row (album art + titles)
        val detailsRow = createRowView(context)
        
        val albumArt = createImageView(context, "music", accentColor, widthDp = 22f, heightDp = 22f)
        detailsRow.addView(R.id.dynamic_view_container, albumArt)
        detailsRow.addView(R.id.dynamic_view_container, createSpacerView(context, 8f, isHorizontal = true))

        val titlesColumn = createColumnView(context)
        val songName = customs?.optString("valueText") ?: "Nothing (Spec)"
        val artistName = customs?.optString("subValueText") ?: "NOTHING OS DESIGN"
        titlesColumn.addView(R.id.dynamic_view_container, createTextView(context, songName, 12f, textColor))
        titlesColumn.addView(R.id.dynamic_view_container, createTextView(context, artistName, 8f, subtextColor, marginTop = 2f))
        
        detailsRow.addView(R.id.dynamic_view_container, titlesColumn)
        container.addView(R.id.dynamic_view_container, detailsRow)

        // Mock Progress Seekbar
        val progressViews = createProgressBar(context, 35, 100, accentColor)
        container.addView(R.id.dynamic_view_container, progressViews)

        // Playback control buttons row
        val btnRow = createRowView(context)
        val btnBg = if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0") else android.graphics.Color.parseColor("#ff1c1c1e")
        btnRow.addView(R.id.dynamic_view_container, createButtonView(context, "⏮", "prev_song", appWidgetId, textColor, btnBg))
        btnRow.addView(R.id.dynamic_view_container, createButtonView(context, "▶", "play_song", appWidgetId, textColor, btnBg))
        btnRow.addView(R.id.dynamic_view_container, createButtonView(context, "⏭", "next_song", appWidgetId, textColor, btnBg))
        
        container.addView(R.id.dynamic_view_container, btnRow)

        val footer = customs?.optString("footerText") ?: "NOS • MEDIA ENGINE"
        container.addView(R.id.dynamic_view_container, createFooter(context, footer, accentColor))

        root.addView(R.id.nos_widget_root, container)
        return root
    }

    private fun createSpacerView(context: Context, sizeDp: Float, isHorizontal: Boolean): RemoteViews {
        val spacer = RemoteViews(context.packageName, R.layout.widget_dynamic_spacer)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (isHorizontal) {
                spacer.setViewLayoutWidth(R.id.dynamic_spacer, sizeDp, TypedValue.COMPLEX_UNIT_DIP)
                spacer.setViewLayoutHeight(R.id.dynamic_spacer, 1f, TypedValue.COMPLEX_UNIT_DIP)
            } else {
                spacer.setViewLayoutWidth(R.id.dynamic_spacer, 1f, TypedValue.COMPLEX_UNIT_DIP)
                spacer.setViewLayoutHeight(R.id.dynamic_spacer, sizeDp, TypedValue.COMPLEX_UNIT_DIP)
            }
        }
        return spacer
    }
}
