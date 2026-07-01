package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.os.Build
import android.util.TypedValue
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

class NOSCalendarMonthlyWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "calendar_monthly"

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

        val sdf = SimpleDateFormat("MMMM yyyy", Locale.getDefault())
        val titleText = customs?.optString("titleText") ?: sdf.format(Date()).uppercase(Locale.getDefault())
        container.addView(R.id.dynamic_view_container, createHeader(context, titleText, "calendar", accentColor, subtextColor))

        // Create 7-column header: S M T W T F S
        val daysHeaderRow = createRowView(context)
        val daysOfWeek = listOf("S", "M", "T", "W", "T", "F", "S")
        for (day in daysOfWeek) {
            val cellText = createTextView(context, day, 6.5f, subtextColor, isWeight = true)
            daysHeaderRow.addView(R.id.dynamic_view_container, cellText)
        }
        container.addView(R.id.dynamic_view_container, daysHeaderRow)

        // Get calendar instance for current month
        val cal = Calendar.getInstance()
        val today = cal.get(Calendar.DAY_OF_MONTH)
        
        // Let's draw a compact 2-row layout representing the week of today!
        // We'll show the current week and the next week to keep it clean and fits the 4x2 widget height!
        val weekRow = createRowView(context)
        
        // Go back to the beginning of the current week (Sunday)
        cal.set(Calendar.DAY_OF_WEEK, Calendar.SUNDAY)
        
        for (i in 0 until 7) {
            val dayNum = cal.get(Calendar.DAY_OF_MONTH)
            val isToday = dayNum == today
            
            val cellBox = createDayCell(context, dayNum, isToday, textColor, accentColor)
            weekRow.addView(R.id.dynamic_view_container, cellBox)
            cal.add(Calendar.DAY_OF_MONTH, 1)
        }
        container.addView(R.id.dynamic_view_container, weekRow)

        // Add a second week row
        val nextWeekRow = createRowView(context)
        for (i in 0 until 7) {
            val dayNum = cal.get(Calendar.DAY_OF_MONTH)
            val isToday = dayNum == today
            
            val cellBox = createDayCell(context, dayNum, isToday, textColor, accentColor)
            nextWeekRow.addView(R.id.dynamic_view_container, cellBox)
            cal.add(Calendar.DAY_OF_MONTH, 1)
        }
        container.addView(R.id.dynamic_view_container, nextWeekRow)

        val footer = customs?.optString("footerText") ?: "NOS • CALENDAR"
        container.addView(R.id.dynamic_view_container, createFooter(context, footer, accentColor))

        root.addView(R.id.nos_widget_root, container)
        return root
    }

    private fun createDayCell(context: Context, dayNum: Int, isToday: Boolean, textColor: Int, accentColor: Int): RemoteViews {
        val cell = RemoteViews(context.packageName, R.layout.widget_dynamic_text_weight)
        cell.setTextViewText(R.id.dynamic_text, dayNum.toString())
        cell.setTextViewTextSize(R.id.dynamic_text, TypedValue.COMPLEX_UNIT_SP, 9f)
        
        if (isToday) {
            cell.setTextColor(R.id.dynamic_text, android.graphics.Color.BLACK)
            cell.setInt(R.id.dynamic_text, "setBackgroundResource", R.drawable.widget_rounded_bg_12)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                cell.setColorStateList(R.id.dynamic_text, "setBackgroundTintList", android.content.res.ColorStateList.valueOf(accentColor))
            }
        } else {
            cell.setTextColor(R.id.dynamic_text, textColor)
        }
        return cell
    }
}
