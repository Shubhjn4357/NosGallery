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
 * NOSPhotoFrameWidget
 * Design: Polaroid-style photo card with caption.
 * TOP: Film-strip header (frame # counter + date stamp)
 * MIDDLE: ASCII art polaroid frame border with caption area inside
 * BOTTOM: Album name + photo count + "SELECT PHOTO" button
 * Unique: Only widget designed as a literal Polaroid photograph card.
 */
class NOSPhotoFrameWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "productivity_photo_frame"

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

        val dateStr = SimpleDateFormat("d MMM yyyy", Locale.getDefault()).format(Date())
        val caption = customs?.optString("valueText") ?: "Summer in Tokyo"
        val album   = customs?.optString("subValueText") ?: "MEMORIES"

        val btnBg = if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0")
                    else android.graphics.Color.parseColor("#ff1c1c1e")

        val root = createRootView(context, theme, customs)
        val col = createColumnView(context)

        // ── FILM STRIP HEADER ──
        col.addView(R.id.dynamic_view_container,
            createHeader(context, "PHOTO FRAME", "gallery", accentColor, subtextColor))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "◼◻◼◻◼◻◼◻◼◻◼◻◼◻◼◻◼", 5f, subtextColor, marginTop = 0f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "FRAME #014  ·  $dateStr", 7f, accentColor, marginTop = 0f, isBold = true))

        // ── POLAROID FRAME ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "┌───────────────────┐", 7f, textColor, marginTop = 4f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "│                   │", 7f, textColor, marginTop = 0f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "│      🌅 ☁️ 🏙️       │", 11f, textColor, marginTop = 0f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "│                   │", 7f, textColor, marginTop = 0f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "└───────────────────┘", 7f, textColor, marginTop = 0f))

        // ── CAPTION ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, caption, 10f, textColor, marginTop = 2f, isBold = true))

        // ── ALBUM INFO ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 2f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "📂 $album  ·  42 PHOTOS", 8f, subtextColor, marginTop = 1f))

        // ── SELECT BUTTON ──
        col.addView(R.id.dynamic_view_container,
            createButtonView(context, "🖼  SELECT PHOTO", "open_gallery", appWidgetId, textColor, btnBg))

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • GALLERY", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
