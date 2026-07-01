package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject

/**
 * NOSProductivityTodoWidget
 * Design: Kanban-style checklist with 5 bullet items and completion ring.
 * TOP: Completion count badge (e.g. "3 / 5 DONE") + ring fraction indicator
 * MIDDLE: 5 bullet items with ☑ / ☐ state — top item highlighted
 * BOTTOM: Priority badge + "ADD TASK" button
 * Unique: Only widget with inline tick-box list items.
 */
class NOSProductivityTodoWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "productivity_todo"

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

        // Sample tasks (top = active)
        val tasks = listOf(
            customs?.optString("valueText") ?: "Prep Presentation" to true,
            "Review PRD doc" to true,
            "Deploy build #244" to true,
            "Team standup notes" to false,
            "Update CHANGELOG" to false
        )
        val done = tasks.count { it.second }
        val total = tasks.size

        val root = createRootView(context, theme, customs)
        val col = createColumnView(context)

        // ── HEADER ──
        col.addView(R.id.dynamic_view_container,
            createHeader(context, "TO-DO LIST", "checklist", accentColor, subtextColor))

        // ── COMPLETION BADGE ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "✓ $done / $total TASKS COMPLETE", 9f, accentColor, marginTop = 2f, isBold = true))

        // ── PROGRESS BAR ──
        col.addView(R.id.dynamic_view_container,
            createProgressBar(context, done * 100 / total, 100, accentColor))

        // ── TASK ITEMS ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 4f))
        tasks.take(4).forEachIndexed { i, (task, isDone) ->
            val icon = if (isDone) "☑" else "☐"
            val color = if (isDone) subtextColor else if (i == 0) textColor else subtextColor
            val size = if (i == 0 && !isDone) 10f else 8.5f
            col.addView(R.id.dynamic_view_container,
                createTextView(context, "$icon  $task", size, color, marginTop = 2f, isBold = i == 0 && !isDone))
        }

        // ── ADD BUTTON ──
        val btnBg = if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0")
                    else android.graphics.Color.parseColor("#ff1c1c1e")
        col.addView(R.id.dynamic_view_container,
            createButtonView(context, "+  ADD TASK", "open_todo", appWidgetId, textColor, btnBg))

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • PRODUCTIVITY", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
