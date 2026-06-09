package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class NosWidgetPinReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val appWidgetId = intent.getIntExtra(
            AppWidgetManager.EXTRA_APPWIDGET_ID,
            AppWidgetManager.INVALID_APPWIDGET_ID
        )
        if (appWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            Log.e("NosWidgetPinReceiver", "Received invalid appWidgetId")
            return
        }

        val widgetId = intent.getStringExtra("widgetId")
        val category = intent.getStringExtra("category")
        val widgetJson = intent.getStringExtra("widgetJson")

        Log.d("NosWidgetPinReceiver", "Widget successfully pinned: id=$appWidgetId, rnId=$widgetId, category=$category")

        if (widgetId != null && category != null && widgetJson != null) {
            // Write the mappings into SharedPreferences
            NosWidgetPreferences.saveWidgetMapping(context, appWidgetId, widgetId, category, widgetJson)

            // Trigger an immediate update broadcast to the corresponding AppWidgetProvider class
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val providerClassMap = mapOf(
                "clock"        to NOSClockWidget::class.java,
                "calendar"     to NOSCalendarWidget::class.java,
                "weather"      to NOSWeatherWidget::class.java,
                "productivity" to NOSProductivityWidget::class.java,
                "health"       to NOSHealthWidget::class.java,
                "finance"      to NOSFinanceWidget::class.java,
                "developer"    to NOSDeveloperWidget::class.java,
                "social"       to NOSSocialWidget::class.java,
                "smart_home"   to NOSSmartHomeWidget::class.java,
                "ai"           to NOSAiWidget::class.java
            )

            val providerClass = providerClassMap[category]
            if (providerClass != null) {
                val updateIntent = Intent(context, providerClass).apply {
                    action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
                    putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, intArrayOf(appWidgetId))
                }
                context.sendBroadcast(updateIntent)
            }
        }
    }
}
