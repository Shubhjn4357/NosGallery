package com.nothing.nosgallery.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.TypedValue
import android.widget.RemoteViews
import com.nothing.nosgallery.R
import org.json.JSONObject
import java.util.Locale

class NOSCalculatorWidget : NosBaseWidgetProvider() {
    override val defaultTemplateId = "productivity_calculator"

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == "com.nothing.nosgallery.WIDGET_CLICK") {
            val action = intent.getStringExtra("clickAction")
            val appWidgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID)
            if (action != null && action.startsWith("calc_press_") && appWidgetId != AppWidgetManager.INVALID_APPWIDGET_ID) {
                val key = action.substringAfter("calc_press_")
                handleCalculatorKey(context, appWidgetId, key)
                return
            }
        }
        super.onReceive(context, intent)
    }

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

        val title = customs?.optString("titleText") ?: "CALCULATOR"
        container.addView(R.id.dynamic_view_container, createHeader(context, title, "calculator", accentColor, subtextColor))

        val dynamicState = NosWidgetPreferences.getDynamicStateJson(context)
        val display = dynamicState.optString("calculator_display", "0")
        container.addView(R.id.dynamic_view_container, createTextView(context, display, 18f, textColor, marginTop = 4f))

        // Keypad Grid Rows
        val keypadContainer = createColumnView(context)
        
        val rows = listOf(
            listOf("C", "/", "*"),
            listOf("7", "8", "9", "-"),
            listOf("4", "5", "6", "+"),
            listOf("1", "2", "3", "=")
        )

        val btnBg = if (theme == "minimal") android.graphics.Color.parseColor("#ffe0e0e0") else android.graphics.Color.parseColor("#ff1c1c1e")
        val clearBg = android.graphics.Color.parseColor("#ffff3b30")

        for (row in rows) {
            val rowViews = createRowView(context)
            for (char in row) {
                val action = "calc_press_$char"
                val isOperator = listOf("/", "*", "-", "+", "=").contains(char)
                val isClear = char == "C"
                
                val bg = if (isClear) clearBg else if (char == "=") accentColor else btnBg
                val tc = if (isClear) android.graphics.Color.WHITE else if (char == "=") android.graphics.Color.BLACK else if (isOperator) accentColor else textColor
                
                val btn = createCalculatorButton(context, char, action, appWidgetId, tc, bg)
                rowViews.addView(R.id.dynamic_view_container, btn)
            }
            keypadContainer.addView(R.id.dynamic_view_container, rowViews)
        }
        
        container.addView(R.id.dynamic_view_container, keypadContainer)

        val footer = customs?.optString("footerText") ?: "NOS • CALCULATOR"
        container.addView(R.id.dynamic_view_container, createFooter(context, footer, accentColor))

        root.addView(R.id.nos_widget_root, container)
        return root
    }

    private fun createCalculatorButton(
        context: Context,
        label: String,
        action: String,
        appWidgetId: Int,
        textColor: Int,
        bgColor: Int
    ): RemoteViews {
        val views = RemoteViews(context.packageName, R.layout.widget_dynamic_button)
        views.setTextViewText(R.id.dynamic_button, label)
        views.setTextColor(R.id.dynamic_button, textColor)
        views.setTextViewTextSize(R.id.dynamic_button, TypedValue.COMPLEX_UNIT_SP, 8.5f)
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            views.setColorStateList(R.id.dynamic_button, "setBackgroundTintList", android.content.res.ColorStateList.valueOf(bgColor))
            views.setViewLayoutHeight(R.id.dynamic_button, 18f, TypedValue.COMPLEX_UNIT_DIP)
        } else {
            views.setInt(R.id.dynamic_button, "setBackgroundColor", bgColor)
        }
        
        val pi = getClickPendingIntent(context, appWidgetId, action)
        views.setOnClickPendingIntent(R.id.dynamic_button, pi)
        return views
    }

    private fun handleCalculatorKey(context: Context, appWidgetId: Int, key: String) {
        val dynamicState = NosWidgetPreferences.getDynamicStateJson(context)
        var display = dynamicState.optString("calculator_display", "0")
        
        when (key) {
            "C" -> {
                display = "0"
            }
            "=" -> {
                display = evaluateSafe(display)
            }
            else -> {
                if (display == "0" || display == "Error") {
                    display = if (listOf("/", "*", "-", "+").contains(key)) "0$key" else key
                } else {
                    display += key
                }
            }
        }

        dynamicState.put("calculator_display", display)
        NosWidgetPreferences.getPrefs(context).edit()
            .putString("dynamicState", dynamicState.toString())
            .apply()

        val appWidgetManager = AppWidgetManager.getInstance(context)
        onUpdate(context, appWidgetManager, intArrayOf(appWidgetId))
    }

    private fun evaluateSafe(eq: String): String {
        try {
            val clean = eq.replace("[^0-9+\\-*/.]".toRegex(), "")
            if (clean.isEmpty()) return "0"
            
            val tokens = mutableListOf<String>()
            var number = ""
            for (char in clean) {
                if (char.isDigit() || char == '.') {
                    number += char
                } else {
                    if (number.isNotEmpty()) {
                        tokens.add(number)
                        number = ""
                    }
                    tokens.add(char.toString())
                }
            }
            if (number.isNotEmpty()) {
                tokens.add(number)
            }
            
            if (tokens.isEmpty()) return "0"

            // Process multiply and divide first
            val pass1 = mutableListOf<String>()
            var i = 0
            while (i < tokens.size) {
                val token = tokens[i]
                if (token == "*" || token == "/") {
                    if (pass1.isEmpty() || i + 1 >= tokens.size) return "Error"
                    val prev = pass1.removeAt(pass1.size - 1).toDouble()
                    val next = tokens[i + 1].toDouble()
                    val res = if (token == "*") prev * next else if (next != 0.0) prev / next else 0.0
                    pass1.add(res.toString())
                    i += 2
                } else {
                    pass1.add(token)
                    i++
                }
            }
            
            if (pass1.isEmpty()) return "0"

            // Process add and subtract
            var result = pass1[0].toDouble()
            var j = 1
            while (j < pass1.size) {
                val op = pass1[j]
                if (j + 1 >= pass1.size) break
                val valNum = pass1[j + 1].toDouble()
                if (op == "+") {
                    result += valNum
                } else if (op == "-") {
                    result -= valNum
                }
                j += 2
            }
            
            val resStr = if (result % 1.0 == 0.0) result.toLong().toString() else result.toString()
            return if (resStr.length > 8) resStr.substring(0, 8) else resStr
        } catch (_: Exception) {
            return "Error"
        }
    }
}
