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
 * NOSDeveloperBuildWidget
 * Design: CI/CD pipeline status board — GitHub Actions aesthetic.
 * TOP: Build status badge (large, colour coded) + build number + branch
 * MIDDLE: 5-step pipeline stages (CHECKOUT → BUILD → TEST → LINT → DEPLOY)
 *         each with ✓ / ○ / ✗ / ⌛ state and duration
 * BOTTOM: Committer + last commit message + TRIGGER button
 * Unique: Only widget showing a multi-stage CI/CD pipeline flow.
 */
class NOSDeveloperBuildWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "developer_build"

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

        val green  = android.graphics.Color.parseColor("#ff30d158")
        val red    = android.graphics.Color.parseColor("#ffff453a")
        val yellow = android.graphics.Color.parseColor("#ffffd60a")

        val valTxt = customs?.optString("valueText") ?: "SUCCESS"
        val isSuccess = valTxt.uppercase().let { it == "SUCCESS" || it == "PASSED" }
        val isFail    = valTxt.uppercase().let { it == "FAILED" || it == "ERROR" }
        val statusColor = when { isSuccess -> green; isFail -> red; else -> yellow }
        val statusIcon  = when { isSuccess -> "✓"; isFail -> "✗"; else -> "⌛" }

        val btnBg = if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0")
                    else android.graphics.Color.parseColor("#ff1c1c1e")

        val root = createRootView(context, theme, customs)
        val col = createColumnView(context)

        // ── HEADER ──
        col.addView(R.id.dynamic_view_container,
            createHeader(context, "CI/CD PIPELINE", "terminal", accentColor, subtextColor))

        // ── BUILD STATUS ──
        val buildNum = customs?.optString("subValueText") ?: "#244"
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "$statusIcon $valTxt  $buildNum · MAIN", 14f, statusColor, marginTop = 2f, isBold = true))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, SimpleDateFormat("HH:mm · d MMM", Locale.getDefault()).format(Date()), 8f, subtextColor, marginTop = 0f))

        // ── PIPELINE STAGES ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 4f))

        val stages = if (isSuccess) listOf(
            "✓ CHECKOUT" to "3s"   to green,
            "✓ BUILD"    to "42s"  to green,
            "✓ TEST"     to "1m5s" to green,
            "✓ LINT"     to "18s"  to green,
            "✓ DEPLOY"   to "22s"  to green
        ) else if (isFail) listOf(
            "✓ CHECKOUT" to "3s"  to green,
            "✓ BUILD"    to "42s" to green,
            "✗ TEST"     to "55s" to red,
            "○ LINT"     to "—"   to subtextColor,
            "○ DEPLOY"   to "—"   to subtextColor
        ) else listOf(
            "✓ CHECKOUT" to "3s"  to green,
            "⌛ BUILD"   to "…"   to yellow,
            "○ TEST"     to "—"   to subtextColor,
            "○ LINT"     to "—"   to subtextColor,
            "○ DEPLOY"   to "—"   to subtextColor
        )

        stages.forEach { ((stage, time), clr) ->
            val stageRow = createRowView(context)
            stageRow.addView(R.id.dynamic_view_container,
                createTextView(context, stage, 8f, clr, marginTop = 2f, isBold = true))
            stageRow.addView(R.id.dynamic_view_container,
                createTextView(context, "  $time", 8f, subtextColor, marginTop = 2f))
            col.addView(R.id.dynamic_view_container, stageRow)
        }

        // ── COMMIT INFO ──
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "─────────────────────", 6f, subtextColor, marginTop = 2f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "▸ feat: widget redesign overhaul", 8f, subtextColor, marginTop = 1f))
        col.addView(R.id.dynamic_view_container,
            createTextView(context, "by @Shubhjn4357 · just now", 7f, subtextColor, marginTop = 1f))

        // ── TRIGGER ──
        col.addView(R.id.dynamic_view_container,
            createButtonView(context, "⟳  TRIGGER BUILD", "trigger_build", appWidgetId, textColor, btnBg))

        col.addView(R.id.dynamic_view_container,
            createFooter(context, customs?.optString("footerText") ?: "NOS • CI/CD", accentColor))

        root.addView(R.id.nos_widget_root, col)
        return root
    }
}
