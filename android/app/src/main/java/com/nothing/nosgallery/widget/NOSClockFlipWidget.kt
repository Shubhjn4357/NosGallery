package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.os.Build
import android.util.TypedValue
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class NOSClockFlipWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "clock_flip"

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

        val title = customs?.optString("titleText") ?: "RETRO FLIP"
        container.addView(R.id.dynamic_view_container, createHeader(context, title, "clock", accentColor, subtextColor))

        val now = Date()
        val hourStr = SimpleDateFormat("HH", Locale.getDefault()).format(now)
        val minStr = SimpleDateFormat("mm", Locale.getDefault()).format(now)

        // Draw side-by-side flip cards
        val cardsRow = createRowView(context)
        
        val hrCard = createFlipCard(context, hourStr, textColor, theme)
        val minCard = createFlipCard(context, minStr, textColor, theme)
        
        cardsRow.addView(R.id.dynamic_view_container, hrCard)
        // Add divider/spacer
        cardsRow.addView(R.id.dynamic_view_container, createSpacerView(context, 6f))
        cardsRow.addView(R.id.dynamic_view_container, minCard)
        
        container.addView(R.id.dynamic_view_container, cardsRow)

        val footer = customs?.optString("footerText") ?: "NOS • FLIP CLOCK"
        container.addView(R.id.dynamic_view_container, createFooter(context, footer, accentColor))

        root.addView(R.id.nos_widget_root, container)
        return root
    }

    private fun createFlipCard(context: Context, value: String, textColor: Int, theme: String): RemoteViews {
        val card = RemoteViews(context.packageName, R.layout.widget_dynamic_text_weight)
        card.setTextViewText(R.id.dynamic_text, value)
        card.setTextViewTextSize(R.id.dynamic_text, TypedValue.COMPLEX_UNIT_SP, 20f)
        card.setTextColor(R.id.dynamic_text, textColor)
        
        val cardBg = if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0") else android.graphics.Color.parseColor("#ff1c1c1e")
        card.setInt(R.id.dynamic_text, "setBackgroundResource", R.drawable.widget_rounded_bg_8)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            card.setColorStateList(R.id.dynamic_text, "setBackgroundTintList", android.content.res.ColorStateList.valueOf(cardBg))
        }
        return card
    }

    private fun createSpacerView(context: Context, sizeDp: Float): RemoteViews {
        val spacer = RemoteViews(context.packageName, R.layout.widget_dynamic_spacer)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            spacer.setViewLayoutWidth(R.id.dynamic_spacer, sizeDp, TypedValue.COMPLEX_UNIT_DIP)
            spacer.setViewLayoutHeight(R.id.dynamic_spacer, 1f, TypedValue.COMPLEX_UNIT_DIP)
        }
        return spacer
    }
}
