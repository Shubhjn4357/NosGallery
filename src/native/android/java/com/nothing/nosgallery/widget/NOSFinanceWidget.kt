package com.nothing.nosgallery.widget

import android.content.Context
import android.view.View
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.util.Locale

open class NOSFinanceWidget : NosBaseWidgetProvider() {

    override val categoryPrefix = "finance_"
    open override val defaultTemplateId = "finance_crypto"

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

        val label = (customizations?.optString("titleText", null) ?: "FINANCE")
            .uppercase(Locale.getDefault())
        views.setTextViewText(R.id.nos_widget_label, label)
        views.setTextColor(R.id.nos_widget_label, subtextColor)

        val valueText = customizations?.optString("valueText", null)

        when {
            templateId.contains("crypto") || templateId.contains("btc") -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "\$67,490")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "BTC  •  +2.4%  •  ↑ TRENDING")
                views.setTextColor(R.id.nos_widget_sub_value, android.graphics.Color.parseColor("#FF39ff14"))
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • CRYPTO")
            }
            templateId.contains("balance") || templateId.contains("portfolio") -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "\$124,350")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "PORTFOLIO  •  +1.2% TODAY")
                views.setTextColor(R.id.nos_widget_sub_value, android.graphics.Color.parseColor("#FF39ff14"))
                views.setViewVisibility(R.id.nos_widget_progress, View.VISIBLE)
                views.setProgressBar(R.id.nos_widget_progress, 100, 72, false)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • PORTFOLIO")
            }
            else -> {
                views.setTextViewText(R.id.nos_widget_value, valueText ?: "\$178.42")
                views.setTextColor(R.id.nos_widget_value, textColor)
                views.setTextViewText(R.id.nos_widget_sub_value, "AAPL  •  +0.8%  •  NASDAQ")
                views.setTextColor(R.id.nos_widget_sub_value, android.graphics.Color.parseColor("#FF39ff14"))
                views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
                views.setTextViewText(R.id.nos_widget_footer, "NOS • STOCKS")
            }
        }

        views.setTextColor(R.id.nos_widget_footer, accentColor)
    }
}
