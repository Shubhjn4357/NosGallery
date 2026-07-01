package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * NOSCameraWidget
 * Design: Camera viewfinder HUD card — like a pro camera shutter UI.
 * TOP: Live timestamp watermark + camera mode badge
 * MIDDLE: Viewfinder frame (ascii corner brackets) + shutter button symbol
 * BOTTOM: 3 quick mode shortcuts (PHOTO / VIDEO / MACRO) + OPEN button
 * Unique: Only widget with a camera viewfinder HUD frame aesthetic.
 */
class NOSCameraWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "productivity_camera"

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

        val ts = SimpleDateFormat("yyyy-MM-dd  HH:mm:ss", Locale.getDefault()).format(Date())
        val btnBg = if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0")
                    else android.graphics.Color.parseColor("#ff1c1c1e")

        val root = createRootView(context, theme, customs)
        val col = createColumnView(context)

        // ── HEADER ──
        col.addView(R.id.dynamic_view_container,
            createHeader(context, "CAMERA HUB", "camera", accentColor, subtextColor))

        // ── TIMESTAMP + MODE ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, ts, 7f, subtextColor, marginTop = 0f, isBold = true))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "◉ REC READY  ·  50MP MAIN", 8f, accentColor, marginTop = 0f, isBold = true))

        // ── VIEWFINDER FRAME ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "⌐─────────────────────¬", 7f, accentColor, marginTop = 4f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "|                       |", 7f, accentColor, marginTop = 0f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "|    ○  SHUTTER  ○      |", 9f, textColor, marginTop = 0f, isBold = true))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "|                       |", 7f, accentColor, marginTop = 0f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "└───────────────────────┘", 7f, accentColor, marginTop = 0f))

        // ── MODE ROW ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 4f))
        val modeRow = createRowView(context)
        listOf("📷 PHOTO" to "cam_photo",
               "🎥 VIDEO" to "cam_video",
               "🔍 MACRO" to "cam_macro").forEach { (lbl, action) ->
            modeRow.addView(R.id.dynamic_view_container,
                createButtonView(context, lbl, action, appWidgetId, subtextColor, btnBg))
        }
        col.addView(R.id.dynamic_view_container, modeRow)

        // ── OPEN ──
        col.addView(R.id.dynamic_view_container,
            createButtonView(context, "⊕  OPEN CAMERA", "open_camera", appWidgetId, textColor, btnBg))

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • CAMERA", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
