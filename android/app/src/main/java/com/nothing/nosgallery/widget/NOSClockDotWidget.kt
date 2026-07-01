package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

/**
 * NOSClockDotWidget
 * Design: Binary/Braille dot matrix clock — unique Nothing brand concept.
 * TOP: Hours in 5x4 dot matrix (each digit as 5-tall dot column)
 * MIDDLE: Separator dot + minutes matrix
 * BOTTOM: Readable time label + date
 * Unique: Only clock using a dot-matrix visual time representation.
 */
class NOSClockDotWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "clock_dot"

    // 3-wide dot patterns for digits 0-9
    private val dotPatterns = mapOf(
        '0' to "●●●\n●·●\n●·●\n●·●\n●●●",
        '1' to "·●·\n●●·\n·●·\n·●·\n●●●",
        '2' to "●●●\n··●\n●●●\n●··\n●●●",
        '3' to "●●●\n··●\n●●●\n··●\n●●●",
        '4' to "●·●\n●·●\n●●●\n··●\n··●",
        '5' to "●●●\n●··\n●●●\n··●\n●●●",
        '6' to "●●·\n●··\n●●●\n●·●\n●●●",
        '7' to "●●●\n··●\n·●·\n·●·\n·●·",
        '8' to "●●●\n●·●\n●●●\n●·●\n●●●",
        '9' to "●●●\n●·●\n●●●\n··●\n·●●"
    )

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

        val cal = Calendar.getInstance()
        val hourStr = SimpleDateFormat("HH", Locale.getDefault()).format(cal.time)
        val minStr  = SimpleDateFormat("mm", Locale.getDefault()).format(cal.time)
        val timeReadable = SimpleDateFormat("h:mm a", Locale.getDefault()).format(cal.time).uppercase()
        val dateStr = SimpleDateFormat("EEE d MMM", Locale.getDefault()).format(cal.time).uppercase()

        val root = createRootView(context, theme, customs)
        val col = createColumnView(context)

        // ── HEADER ──
        col.addView(R.id.dynamic_view_container,
            createHeader(context, "NOTHING CLOCK", "dot", accentColor, subtextColor))

        // ── DOT MATRIX ROW ──
        val matrixRow = createRowView(context)

        // Hour digits
        hourStr.forEach { digit ->
            val pattern = (dotPatterns[digit] ?: "·····\n·····\n·····\n·····\n·····")
                .replace("●", "●").replace("·", "·")
            val digitCol = createColumnView(context)
            pattern.split("\n").forEach { dotRow ->
                digitCol.addView(R.id.dynamic_view_container,
                    createTextView(context, dotRow, 5f, accentColor, marginTop = 0f, isBold = true))
            }
            matrixRow.addView(R.id.dynamic_view_container, digitCol)
            matrixRow.addView(R.id.dynamic_view_container,
                createTextView(context, " ", 5f, subtextColor, marginTop = 0f))
        }

        // Separator
        matrixRow.addView(R.id.dynamic_view_container,
            createTextView(context, ":\n:\n:\n:\n:", 6f, subtextColor, marginTop = 0f))
        matrixRow.addView(R.id.dynamic_view_container,
            createTextView(context, " ", 5f, subtextColor, marginTop = 0f))

        // Minute digits
        minStr.forEach { digit ->
            val pattern = dotPatterns[digit] ?: "·····\n·····\n·····\n·····\n·····"
            val digitCol = createColumnView(context)
            pattern.split("\n").forEach { dotRow ->
                digitCol.addView(R.id.dynamic_view_container,
                    createTextView(context, dotRow, 5f, textColor, marginTop = 0f, isBold = true))
            }
            matrixRow.addView(R.id.dynamic_view_container, digitCol)
            matrixRow.addView(R.id.dynamic_view_container,
                createTextView(context, " ", 5f, subtextColor, marginTop = 0f))
        }

        col.addView(R.id.dynamic_view_container, matrixRow)

        // ── READABLE TIME ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 4f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, timeReadable, 14f, textColor, marginTop = 2f, isBold = true))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, dateStr, 8f, subtextColor, marginTop = 1f))

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • DOT CLOCK", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
