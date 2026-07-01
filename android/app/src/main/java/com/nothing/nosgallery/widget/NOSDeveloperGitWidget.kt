package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.os.Build
import android.util.TypedValue
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

class NOSDeveloperGitWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "developer_git"

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

        val title = customs?.optString("titleText") ?: "GITHUB GRID"
        container.addView(R.id.dynamic_view_container, createHeader(context, title, "terminal", accentColor, subtextColor))

        // Create a 7x3 GitHub commits matrix programmatically
        val gridContainer = createColumnView(context)
        
        for (rowIdx in 0 until 3) {
            val row = createRowView(context)
            for (colIdx in 0 until 7) {
                // Determine a mock contribution color shade
                val shadeIndex = (rowIdx + colIdx) % 4
                val cellColor = when (shadeIndex) {
                    0 -> adjustAlpha(textColor, 0.05f) // No commits
                    1 -> adjustAlpha(accentColor, 0.25f) // Low commits
                    2 -> adjustAlpha(accentColor, 0.6f)  // Mid commits
                    else -> accentColor                   // High commits
                }
                
                val cell = createGridCell(context, cellColor)
                row.addView(R.id.dynamic_view_container, cell)
                
                // Add tiny horizontal spacer
                if (colIdx < 6) {
                    row.addView(R.id.dynamic_view_container, createSpacerView(context, 2f, true))
                }
            }
            gridContainer.addView(R.id.dynamic_view_container, row)
            
            // Add tiny vertical spacer between rows
            if (rowIdx < 2) {
                gridContainer.addView(R.id.dynamic_view_container, createSpacerView(context, 2f, false))
            }
        }
        
        container.addView(R.id.dynamic_view_container, gridContainer)

        val valTxt = customs?.optString("valueText") ?: "1,240 COMMITS"
        container.addView(R.id.dynamic_view_container, createTextView(context, valTxt, 11f, textColor, marginTop = 6f))

        val footer = customs?.optString("footerText") ?: "NOS • DEVELOPER"
        container.addView(R.id.dynamic_view_container, createFooter(context, footer, accentColor))

        root.addView(R.id.nos_widget_root, container)
        return root
    }

    private fun createGridCell(context: Context, color: Int, sizeDp: Float = 6f): RemoteViews {
        val cell = RemoteViews(context.packageName, R.layout.widget_dynamic_spacer)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            cell.setViewLayoutWidth(R.id.dynamic_spacer, sizeDp, TypedValue.COMPLEX_UNIT_DIP)
            cell.setViewLayoutHeight(R.id.dynamic_spacer, sizeDp, TypedValue.COMPLEX_UNIT_DIP)
        }
        cell.setInt(R.id.dynamic_spacer, "setBackgroundResource", R.drawable.widget_rounded_bg_4)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            cell.setColorStateList(R.id.dynamic_spacer, "setBackgroundTintList", android.content.res.ColorStateList.valueOf(color))
        } else {
            cell.setInt(R.id.dynamic_spacer, "setBackgroundColor", color)
        }
        return cell
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

    private fun adjustAlpha(color: Int, factor: Float): Int {
        val alpha = (factor * 255).toInt().coerceIn(0, 255)
        return (color and 0x00FFFFFF) or (alpha shl 24)
    }
}
