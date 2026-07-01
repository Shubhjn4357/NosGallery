package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

/**
 * NOSFolderWidget
 * Design: App dock / launchpad — like iOS's home screen Springboard folder.
 * TOP: Folder name + app count badge
 * MIDDLE: 3x2 app icon grid using emoji glyphs as icon stand-ins
 * BOTTOM: "OPEN FOLDER" button
 * Unique: Only widget with a 3x2 emoji icon grid launchpad layout.
 */
class NOSFolderWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "productivity_folder"

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

        val folderName = customs?.optString("titleText") ?: "DEV TOOLS"
        val apps = listOf(
            "💻" to "IDE"        to "open_ide",
            "🐙" to "GitHub"     to "open_github",
            "🗃" to "DB Client"  to "open_db",
            "🖥" to "Terminal"   to "open_term",
            "📊" to "Analytics"  to "open_analytics",
            "🚀" to "Deploy"     to "open_deploy"
        )
        val btnBg = if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0")
                    else android.graphics.Color.parseColor("#ff1c1c1e")

        val root = createRootView(context, theme, customs)
        val col = createColumnView(context)

        // ── HEADER ──
        col.addView(R.id.dynamic_view_container,
            createHeader(context, "APP FOLDER", "folder", accentColor, subtextColor))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "$folderName  ·  ${apps.size} APPS", 9f, accentColor, marginTop = 0f, isBold = true))

        // ── 3x2 APP GRID ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 4f))
        apps.chunked(3).forEach { row ->
            val rowView = createRowView(context)
            row.forEach { (appData, action) ->
                val (icon, name) = appData
                val appCol = createColumnView(context)
                appCol.addView(R.id.dynamic_view_container,
                    createTextView(context, icon, 20f, textColor, marginTop = 0f))
                appCol.addView(R.id.dynamic_view_container,
                    createTextView(context, name.take(6), 6f, subtextColor, marginTop = 1f))
                rowView.addView(R.id.dynamic_view_container, appCol)
                rowView.addView(R.id.dynamic_view_container,
                    createTextView(context, "  ", 6f, subtextColor, marginTop = 0f))
            }
            col.addView(R.id.dynamic_view_container, rowView)
        }

        // ── OPEN BUTTON ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 2f))
        col.addView(R.id.dynamic_view_container,
            createButtonView(context, "⊞  OPEN FOLDER", "open_folder", appWidgetId, textColor, btnBg))

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • APPS", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
