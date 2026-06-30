package com.nothing.nosgallery.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.view.View
import android.widget.RemoteViews
import expo.modules.expowidget.R
import org.json.JSONObject
import java.util.Locale

/**
 * Fully dynamic, data-driven widget provider.
 *
 * This class knows NOTHING about specific widget types (weather, clock, finance, etc.).
 * All display content is read from a JSON configuration stored in SharedPreferences
 * by the React Native layer. The native side is a pure rendering engine.
 *
 * JSON config structure expected in SharedPreferences:
 * {
 *   "id": "...",
 *   "templateId": "...",
 *   "customizations": {
 *     "titleText": "LABEL",
 *     "valueText": "Main display value",
 *     "subValueText": "Secondary info",
 *     "footerText": "NOS • CATEGORY",
 *     "backgroundColor": "#FF000000",
 *     "accentColor": "#FFff0000",
 *     "textColor": "#FFFFFFFF",
 *     "subValueColor": "#FF888888",
 *     "showProgressBar": false,
 *     "progressBarValue": 0,
 *     "progressBarMax": 100,
 *     "showActionButtons": false,
 *     "btnLeftText": "ACTION",
 *     "btnLeftAction": "action_id",
 *     "btnRightText": "RESET",
 *     "btnRightAction": "action_id",
 *     "clickAction": "open_uri|open_app|none",
 *     "launchUri": "https://...",
 *     "launchPackage": "com.example.app",
 *     "launchClass": "com.example.Activity",
 *     "intentAction": "android.intent.action.VIEW",
 *     "intentExtras": {}
 *   }
 * }
 */
open class NosBaseWidgetProvider : AppWidgetProvider() {

    open val defaultTemplateId: String? = null

    // ── AppWidgetProvider callbacks ───────────────────────────────────────────────

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == "com.nothing.nosgallery.WIDGET_CLICK") {
            val appWidgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID)
            val clickAction = intent.getStringExtra("clickAction")
            if (appWidgetId != AppWidgetManager.INVALID_APPWIDGET_ID && clickAction != null) {
                if (clickAction.startsWith("{") && clickAction.endsWith("}")) {
                    executeDynamicAction(context, appWidgetId, clickAction)
                } else {
                    handleWidgetClick(context, appWidgetId, clickAction)
                }
            }
        } else {
            super.onReceive(context, intent)
        }
    }

    /**
     * Generic click handler. Reads a `clickHandlers` JSON object from the widget config
     * to determine what state mutation to perform. Format:
     *
     * "clickHandlers": {
     *   "my_action": {
     *     "type": "increment|toggle|cycle|set|native",
     *     "field": "someStateField",
     *     "amount": 250,
     *     "values": ["a", "b", "c"],
     *     "displayField": "valueText",
     *     "displayFormat": "{value} ML",
     *     "nativeAction": "toggle_torch"
     *   }
     * }
     *
     * Only "native" type actions (like torch) execute platform APIs.
     * Everything else is pure JSON state mutation.
     */
    private fun handleNativeAction(context: Context, action: String, config: JSONObject): Boolean {
        try {
            val dynamicState = NosWidgetPreferences.getDynamicStateJson(context)
            when (action) {
                "toggle_stopwatch" -> {
                    val isRunning = dynamicState.optBoolean("stopwatchRunning", false)
                    val now = android.os.SystemClock.elapsedRealtime()
                    if (isRunning) {
                        val startBase = NosWidgetPreferences.getPrefs(context).getLong("stopwatch_start_base", now)
                        val elapsedMs = now - startBase
                        val elapsedDeci = elapsedMs / 100
                        dynamicState.put("stopwatchTime", elapsedDeci)
                        dynamicState.put("stopwatchRunning", false)
                    } else {
                        val currentDeci = dynamicState.optLong("stopwatchTime", 0L)
                        val startBase = now - (currentDeci * 100)
                        NosWidgetPreferences.getPrefs(context).edit().putLong("stopwatch_start_base", startBase).apply()
                        dynamicState.put("stopwatchRunning", true)
                    }
                    NosWidgetPreferences.getPrefs(context).edit()
                        .putString("dynamicState", dynamicState.toString())
                        .apply()
                    return true
                }
                "reset_stopwatch" -> {
                    dynamicState.put("stopwatchTime", 0L)
                    dynamicState.put("stopwatchRunning", false)
                    NosWidgetPreferences.getPrefs(context).edit()
                        .putString("dynamicState", dynamicState.toString())
                        .remove("stopwatch_start_base")
                        .apply()
                    return true
                }
                "toggle_torch" -> {
                    val current = dynamicState.optBoolean("torchEnabled", false)
                    val next = !current
                    dynamicState.put("torchEnabled", next)
                    NosWidgetPreferences.getPrefs(context).edit()
                        .putString("dynamicState", dynamicState.toString())
                        .apply()
                    toggleNativeFlashlight(context, next)
                    return true
                }
            }
        } catch (_: Exception) {}
        return false
    }

    private fun handleWidgetClick(context: Context, appWidgetId: Int, clickAction: String) {
        val config = NosWidgetPreferences.resolveWidgetConfig(context, appWidgetId, null, "") ?: JSONObject()
        val handlers = config.optJSONObject("clickHandlers")
            ?: config.optJSONObject("customizations")?.optJSONObject("clickHandlers")
        val handler = handlers?.optJSONObject(clickAction)

        val handled = handleNativeAction(context, clickAction, config)

        if (handler != null && !handled) {
            val customs = config.optJSONObject("customizations") ?: JSONObject().also { config.put("customizations", it) }
            val type = handler.optString("type", "none")
            val field = handler.optString("field", "")
            val displayField = handler.optString("displayField", "valueText")
            val displayFormat = handler.optString("displayFormat", "{value}")

            when (type) {
                "toggle" -> {
                    val current = config.optBoolean(field, false)
                    val next = !current
                    config.put(field, next)
                    val trueLabel = handler.optString("trueLabel", "ON")
                    val falseLabel = handler.optString("falseLabel", "OFF")
                    customs.put(displayField, if (next) trueLabel else falseLabel)

                    val nativeAction = handler.optString("nativeAction", "")
                    if (nativeAction.isNotEmpty()) {
                        handleNativeAction(context, nativeAction, config)
                    }
                }
                "increment" -> {
                    val amount = handler.optInt("amount", 1)
                    val current = config.optInt(field, 0)
                    val next = current + amount
                    config.put(field, next)
                    customs.put(displayField, displayFormat.replace("{value}", next.toString()))
                }
                "set" -> {
                    val value = handler.opt("value")
                    if (value != null) {
                        config.put(field, value)
                        customs.put(displayField, displayFormat.replace("{value}", value.toString()))
                    }
                }
                "cycle" -> {
                    val values = handler.optJSONArray("values")
                    if (values != null && values.length() > 0) {
                        val current = config.optString(field, values.optString(0))
                        var nextIdx = 0
                        for (i in 0 until values.length()) {
                            if (values.optString(i) == current) {
                                nextIdx = (i + 1) % values.length()
                                break
                            }
                        }
                        val nextVal = values.optString(nextIdx)
                        config.put(field, nextVal)
                        customs.put(displayField, displayFormat.replace("{value}", nextVal.uppercase(Locale.getDefault())))
                    }
                }
                "native" -> {
                    val nativeAction = handler.optString("nativeAction", "")
                    if (nativeAction.isNotEmpty()) {
                        handleNativeAction(context, nativeAction, config)
                    }
                }
            }

            // Sync updated field value to global dynamicState
            if (field.isNotEmpty()) {
                try {
                    val dynamicState = NosWidgetPreferences.getDynamicStateJson(context)
                    dynamicState.put(field, config.opt(field))
                    NosWidgetPreferences.getPrefs(context).edit()
                        .putString("dynamicState", dynamicState.toString())
                        .apply()
                } catch (_: Exception) {}
            }
        }

        // Save updated config
        val category = NosWidgetPreferences.getWidgetCategory(context, appWidgetId)
        NosWidgetPreferences.saveWidgetConfig(context, appWidgetId, category, config.toString())
        syncWidgetBackToStore(context, appWidgetId, config)

        // Force widget redraw
        val appWidgetManager = AppWidgetManager.getInstance(context)
        updateWidget(context, appWidgetManager, appWidgetId)
    }

    private fun executeDynamicAction(context: Context, appWidgetId: Int, actionJsonStr: String) {
        try {
            val action = JSONObject(actionJsonStr)
            val type = action.optString("type", "state")

            when (type) {
                "intent" -> {
                    val intentAction = action.optString("intentAction", Intent.ACTION_VIEW)
                    val uriStr = action.optString("uri")
                    val intent = if (!uriStr.isNullOrBlank()) {
                        Intent(intentAction, Uri.parse(uriStr))
                    } else {
                        Intent(intentAction)
                    }
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    context.startActivity(intent)
                }
                "route" -> {
                    val route = action.optString("route")
                    if (!route.isNullOrBlank()) {
                        val deepLinkUri = "nosgallery://app/$route"
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(deepLinkUri)).apply {
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                        context.startActivity(intent)
                    }
                }
                "state" -> {
                    val field = action.optString("field")
                    if (!field.isNullOrBlank()) {
                        val mutation = action.optString("mutation", "set")
                        val dynamicState = NosWidgetPreferences.getDynamicStateJson(context)

                        when (mutation) {
                            "toggle" -> {
                                val curr = dynamicState.optBoolean(field, false)
                                dynamicState.put(field, !curr)
                            }
                            "increment" -> {
                                val amount = action.optInt("amount", 1)
                                val curr = dynamicState.optInt(field, 0)
                                dynamicState.put(field, curr + amount)
                            }
                            "set" -> {
                                val value = action.opt("value")
                                dynamicState.put(field, value)
                            }
                        }

                        NosWidgetPreferences.getPrefs(context).edit()
                            .putString("dynamicState", dynamicState.toString())
                            .apply()

                        val config = NosWidgetPreferences.resolveWidgetConfig(context, appWidgetId, null, "") ?: JSONObject()
                        syncWidgetBackToStore(context, appWidgetId, config)

                        val appWidgetManager = AppWidgetManager.getInstance(context)
                        updateWidget(context, appWidgetManager, appWidgetId)
                    }
                }
                "native" -> {
                    val nativeAction = action.optString("nativeAction")
                    val config = NosWidgetPreferences.resolveWidgetConfig(context, appWidgetId, null, "") ?: JSONObject()
                    handleNativeAction(context, nativeAction, config)

                    val appWidgetManager = AppWidgetManager.getInstance(context)
                    updateWidget(context, appWidgetManager, appWidgetId)
                }
            }
        } catch (e: Exception) {
            android.util.Log.e("NosBaseWidgetProvider", "Failed to execute dynamic action: ${e.message}", e)
        }
    }

    private fun toggleNativeFlashlight(context: Context, enable: Boolean) {
        try {
            val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as android.hardware.camera2.CameraManager
            val cameraId = cameraManager.cameraIdList.firstOrNull()
            if (cameraId != null) {
                cameraManager.setTorchMode(cameraId, enable)
            }
        } catch (e: Exception) {
            android.util.Log.e("NosBaseWidgetProvider", "Failed to toggle native torch: ${e.message}")
        }
    }

    private fun syncWidgetBackToStore(context: Context, appWidgetId: Int, updatedWidget: JSONObject) {
        try {
            val widgets = NosWidgetPreferences.getWidgetsJson(context)
            val updatedId = updatedWidget.optString("id")
            if (!updatedId.isNullOrBlank()) {
                for (i in 0 until widgets.length()) {
                    val obj = widgets.optJSONObject(i) ?: continue
                    if (obj.optString("id") == updatedId) {
                        val keys = updatedWidget.keys()
                        while (keys.hasNext()) {
                            val key = keys.next()
                            obj.put(key, updatedWidget.get(key))
                        }
                        break
                    }
                }
                NosWidgetPreferences.getPrefs(context).edit()
                    .putString("widgets", widgets.toString())
                    .apply()
            }
        } catch (e: Exception) {
            // Non-fatal
        }
    }

    fun getClickPendingIntent(
        context: Context,
        appWidgetId: Int,
        clickAction: String
    ): PendingIntent {
        val intent = Intent("com.nothing.nosgallery.WIDGET_CLICK").apply {
            setPackage(context.packageName)
            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
            putExtra("clickAction", clickAction)
        }
        val flags = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }
        return PendingIntent.getBroadcast(
            context,
            (appWidgetId.toString() + "_" + clickAction).hashCode(),
            intent,
            flags
        )
    }

    // ── Core update logic ─────────────────────────────────────────────────────────

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    private fun updateWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        val template = defaultTemplateId
        val categoryPrefix = template?.substringBefore('_') ?: ""
        val config = NosWidgetPreferences.resolveWidgetConfig(context, appWidgetId, template, categoryPrefix)
        val theme = NosWidgetPreferences.getActiveTheme(context)
        val customs = config?.optJSONObject("customizations")

        val layoutJsonStr = config?.optString("layoutJSON")
        if (!layoutJsonStr.isNullOrBlank()) {
            try {
                val layoutNode = JSONObject(layoutJsonStr)
                val views = RemoteViews(context.packageName, R.layout.nos_widget_layout)

                // Clear all views inside root FrameLayout
                views.removeAllViews(R.id.nos_widget_root)

                // Background color: customizations > theme default
                val bgColor = parseColorOr(customs?.optString("backgroundColor"), themeBackground(theme))
                views.setInt(R.id.nos_widget_root, "setBackgroundColor", bgColor)

                // Root tap action
                val tapIntent = buildLaunchIntent(context, config)
                val pendingIntent = PendingIntent.getActivity(
                    context,
                    appWidgetId,
                    tapIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(R.id.nos_widget_root, pendingIntent)

                // Recursively render dynamic layout and add it under root FrameLayout
                val dynamicViews = NosDynamicLayoutRenderer.renderNode(context, layoutNode, appWidgetId, this)
                if (dynamicViews != null) {
                    views.addView(R.id.nos_widget_root, dynamicViews)
                }

                appWidgetManager.updateAppWidget(appWidgetId, views)
                return
            } catch (e: Exception) {
                android.util.Log.e("NosBaseWidgetProvider", "Failed to render dynamic layout: ${e.message}", e)
            }
        }

        val layoutResName = if (template != null) {
            "widgetprovider_${template.lowercase()}_layout"
        } else {
            "nos_widget_layout"
        }
        val layoutResId = context.resources.getIdentifier(layoutResName, "layout", context.packageName)
        val finalLayoutResId = if (layoutResId != 0) layoutResId else R.layout.nos_widget_layout

        val views = RemoteViews(context.packageName, finalLayoutResId)

        // Background color: customizations > theme default
        val bgColor = parseColorOr(customs?.optString("backgroundColor"), themeBackground(theme))
        views.setInt(R.id.nos_widget_root, "setBackgroundColor", bgColor)

        // Root tap action
        val tapIntent = buildLaunchIntent(context, config)
        val pendingIntent = PendingIntent.getActivity(
            context, appWidgetId, tapIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.nos_widget_root, pendingIntent)

        // Populate all views from JSON data only
        populateViews(context, views, config, customs, theme, appWidgetId)

        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    /**
     * Build launch intent from explicit JSON properties only.
     * No templateId-based fallbacks — just open the host app if nothing is configured.
     */
    private fun buildLaunchIntent(context: Context, config: JSONObject?): Intent {
        val customs = config?.optJSONObject("customizations")

        // 1. Deep link URI
        val launchUri = customs?.optString("launchUri")?.takeIf { it.isNotBlank() }
            ?: config?.optString("launchUri")?.takeIf { it.isNotBlank() }
        if (!launchUri.isNullOrBlank()) {
            try {
                return Intent(Intent.ACTION_VIEW, Uri.parse(launchUri)).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
            } catch (_: Exception) {}
        }

        // 2. Open specific app package
        val launchPackage = customs?.optString("launchPackage")?.takeIf { it.isNotBlank() }
            ?: config?.optString("launchPackage")?.takeIf { it.isNotBlank() }
        if (!launchPackage.isNullOrBlank()) {
            try {
                val launchIntent = context.packageManager.getLaunchIntentForPackage(launchPackage)
                if (launchIntent != null) {
                    launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    return launchIntent
                }
            } catch (_: Exception) {}
        }

        // 3. Specific activity class
        val launchClass = customs?.optString("launchClass")?.takeIf { it.isNotBlank() }
            ?: config?.optString("launchClass")?.takeIf { it.isNotBlank() }
        if (!launchClass.isNullOrBlank()) {
            try {
                val pkg = launchPackage ?: context.packageName
                return Intent().apply {
                    setClassName(pkg, launchClass)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
            } catch (_: Exception) {}
        }

        // 4. Custom intent action
        val intentAction = customs?.optString("intentAction")?.takeIf { it.isNotBlank() }
            ?: config?.optString("intentAction")?.takeIf { it.isNotBlank() }
        if (!intentAction.isNullOrBlank()) {
            try {
                return Intent(intentAction).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    val extras = customs?.optJSONObject("intentExtras")
                        ?: config?.optJSONObject("intentExtras")
                    if (extras != null) {
                        val keys = extras.keys()
                        while (keys.hasNext()) {
                            val key = keys.next()
                            when (val value = extras.get(key)) {
                                is String -> putExtra(key, value)
                                is Boolean -> putExtra(key, value)
                                is Int -> putExtra(key, value)
                                is Double -> putExtra(key, value)
                            }
                        }
                    }
                }
            } catch (_: Exception) {}
        }

        // 5. Fallback: open host app
        return (context.packageManager.getLaunchIntentForPackage(context.packageName) ?: Intent()).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
    }

    // ── Purely data-driven view population ────────────────────────────────────────

    open fun populateViews(
        context: Context,
        views: RemoteViews,
        config: JSONObject?,
        customs: JSONObject?,
        theme: String,
        appWidgetId: Int
    ) {
        val accentColor = parseColorOr(customs?.optString("accentColor"), themeAccent(theme))
        val textColor = parseColorOr(customs?.optString("textColor"), themeText(theme))
        val subtextColor = parseColorOr(customs?.optString("subValueColor"), themeSubtext(theme))

        val templateId = config?.optString("templateId") ?: defaultTemplateId ?: ""
        val dynamicState = NosWidgetPreferences.getDynamicStateJson(context)

        // Reset default visibilities
        views.setViewVisibility(R.id.nos_widget_image, View.GONE)
        views.setViewVisibility(R.id.nos_widget_clock_value, View.GONE)
        views.setViewVisibility(R.id.nos_widget_chronometer, View.GONE)
        views.setViewVisibility(R.id.nos_widget_value, View.VISIBLE)
        views.setViewVisibility(R.id.nos_widget_progress, View.GONE)
        views.setViewVisibility(R.id.nos_widget_buttons_row, View.GONE)

        // Resolve and set preview image
        val previewName = config?.optString("preview")
        if (!previewName.isNullOrBlank()) {
            val resId = context.resources.getIdentifier(previewName, "drawable", context.packageName)
            if (resId != 0) {
                views.setImageViewResource(R.id.nos_widget_image, resId)
                views.setViewVisibility(R.id.nos_widget_image, View.VISIBLE)
            }
        }

        // Accent dot
        views.setInt(R.id.nos_widget_dot, "setBackgroundColor", accentColor)

        // Title label
        var titleText = customs?.optString("titleText")?.takeIf { it.isNotBlank() }
            ?: config?.optString("titleText")?.takeIf { it.isNotBlank() }
            ?: "NOS WIDGET"

        // Primary value
        var valueText = customs?.optString("valueText")?.takeIf { it.isNotBlank() }
            ?: config?.optString("valueText")?.takeIf { it.isNotBlank() }
            ?: "--"

        // Sub value
        var subValueText = customs?.optString("subValueText")?.takeIf { it.isNotBlank() }
            ?: config?.optString("subValueText")?.takeIf { it.isNotBlank() }
            ?: ""

        // Progress bar options
        var showProgress = customs?.optBoolean("showProgressBar", false)
            ?: config?.optBoolean("showProgressBar", false)
            ?: false
        var progressVal = customs?.optInt("progressBarValue", 0)
            ?: config?.optInt("progressBarValue", 0)
            ?: 0
        var progressMax = customs?.optInt("progressBarMax", 100)
            ?: config?.optInt("progressBarMax", 100)
            ?: 100

        // Buttons options
        var showButtons = customs?.optBoolean("showActionButtons", false)
            ?: config?.optBoolean("showActionButtons", false)
            ?: false
        var btnLeftText = customs?.optString("btnLeftText")?.takeIf { it.isNotBlank() }
            ?: config?.optString("btnLeftText")?.takeIf { it.isNotBlank() }
            ?: "ACTION"
        var btnLeftAction = customs?.optString("btnLeftAction")?.takeIf { it.isNotBlank() }
            ?: config?.optString("btnLeftAction")?.takeIf { it.isNotBlank() }
            ?: "none"
        var btnRightText = customs?.optString("btnRightText")?.takeIf { it.isNotBlank() }
            ?: config?.optString("btnRightText")?.takeIf { it.isNotBlank() }
            ?: "RESET"
        var btnRightAction = customs?.optString("btnRightAction")?.takeIf { it.isNotBlank() }
            ?: config?.optString("btnRightAction")?.takeIf { it.isNotBlank() }
            ?: "none"

        // ── Template Specific Dynamic State Resolving (Only for generic fallback layout) ────────
        val hasCustomLayout = if (templateId.isNotEmpty()) {
            val resName = "widgetprovider_${templateId.lowercase(Locale.getDefault())}_layout"
            context.resources.getIdentifier(resName, "layout", context.packageName) != 0
        } else false
        
        if (!hasCustomLayout) {
            if (templateId.startsWith("clock_") && templateId != "clock_stopwatch") {
                views.setViewVisibility(R.id.nos_widget_clock_value, View.VISIBLE)
                views.setViewVisibility(R.id.nos_widget_value, View.GONE)
                views.setCharSequence(R.id.nos_widget_clock_value, "setFormat12Hour", "h:mm a")
                views.setCharSequence(R.id.nos_widget_clock_value, "setFormat24Hour", "HH:mm")
                views.setTextColor(R.id.nos_widget_clock_value, textColor)
            } else if (templateId == "clock_stopwatch") {
                val stopwatchRunning = dynamicState.optBoolean("stopwatchRunning", false)
                val stopwatchTime = dynamicState.optLong("stopwatchTime", 0L)
                if (stopwatchRunning) {
                    views.setViewVisibility(R.id.nos_widget_chronometer, View.VISIBLE)
                    views.setViewVisibility(R.id.nos_widget_value, View.GONE)
                    val baseTime = android.os.SystemClock.elapsedRealtime() - (stopwatchTime * 100)
                    views.setChronometer(R.id.nos_widget_chronometer, baseTime, null, true)
                    views.setTextColor(R.id.nos_widget_chronometer, textColor)
                } else {
                    views.setViewVisibility(R.id.nos_widget_value, View.VISIBLE)
                    val mins = stopwatchTime / 600
                    val secs = (stopwatchTime % 600) / 10
                    val deci = stopwatchTime % 10
                    valueText = String.format("%02d:%02d.%d", mins, secs, deci)
                }
                showButtons = true
                btnLeftText = if (stopwatchRunning) "PAUSE" else "START"
                btnLeftAction = "toggle_stopwatch"
                btnRightText = "RESET"
                btnRightAction = "reset_stopwatch"
            }

            // Apply updated/resolved values to the UI
            views.setTextViewText(R.id.nos_widget_label, titleText.uppercase(Locale.getDefault()))
            views.setTextColor(R.id.nos_widget_label, subtextColor)

            views.setTextViewText(R.id.nos_widget_value, valueText)
            views.setTextColor(R.id.nos_widget_value, textColor)

            views.setTextViewText(R.id.nos_widget_sub_value, subValueText)
            views.setTextColor(R.id.nos_widget_sub_value, subtextColor)

            if (showProgress) {
                views.setViewVisibility(R.id.nos_widget_progress, View.VISIBLE)
                views.setProgressBar(R.id.nos_widget_progress, progressMax, progressVal, false)
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
                    views.setColorStateList(
                        R.id.nos_widget_progress,
                        "setProgressTintList",
                        android.content.res.ColorStateList.valueOf(accentColor)
                    )
                }
            }

            if (showButtons) {
                views.setViewVisibility(R.id.nos_widget_buttons_row, View.VISIBLE)
                views.setViewVisibility(R.id.nos_widget_btn_left, View.VISIBLE)
                views.setViewVisibility(R.id.nos_widget_btn_right, View.VISIBLE)
                views.setViewVisibility(R.id.nos_widget_btn_divider, View.VISIBLE)

                views.setTextViewText(R.id.nos_widget_btn_left, btnLeftText)
                views.setOnClickPendingIntent(R.id.nos_widget_btn_left, getClickPendingIntent(context, appWidgetId, btnLeftAction))
                views.setTextViewText(R.id.nos_widget_btn_right, btnRightText)
                views.setOnClickPendingIntent(R.id.nos_widget_btn_right, getClickPendingIntent(context, appWidgetId, btnRightAction))
            }

            val footerText = customs?.optString("footerText")?.takeIf { it.isNotBlank() }
                ?: config?.optString("footerText")?.takeIf { it.isNotBlank() }
                ?: "NOS • STUDIO"
            views.setTextViewText(R.id.nos_widget_footer, footerText.uppercase(Locale.getDefault()))
            views.setTextColor(R.id.nos_widget_footer, accentColor)
        }
    }

    // ── Color helpers ─────────────────────────────────────────────────────────────

    fun parseColorOr(obj: Any?, default: Int): Int {
        if (obj == null) return default
        if (obj is Int) return obj
        if (obj is Number) return obj.toInt()
        var str = obj.toString().trim()
        if (str.isBlank()) return default
        return try {
            if (str.startsWith("#")) {
                if (str.length == 4) { // #fff -> #ffffff
                    str = "#" + str[1] + str[1] + str[2] + str[2] + str[3] + str[3]
                }
                if (str.length == 7) { // #ffffff -> #ffffffff
                    str = "#FF" + str.substring(1)
                }
            }
            Color.parseColor(str)
        } catch (_: Exception) {
            default
        }
    }

    // ── Theme defaults (only used when customizations don't specify colors) ──────

    fun themeBackground(theme: String): Int {
        try {
            val json = JSONObject(theme)
            val bg = json.optString("backgroundColor")
            if (bg.isNotBlank()) return Color.parseColor(bg)
        } catch (_: Exception) {}
        return when (theme) {
            "glassmorphism" -> Color.parseColor("#CC0d1117")
            "liquidglass"   -> Color.parseColor("#990B1E24")
            "luxury"        -> Color.parseColor("#FF1c1a17")
            "cyberpunk"     -> Color.parseColor("#FF0d0f1a")
            "minimal"       -> Color.parseColor("#FFF5F5F5")
            "warm"          -> Color.parseColor("#FF1a1209")
            else            -> Color.parseColor("#FF000000")
        }
    }

    fun themeAccent(theme: String): Int {
        try {
            val json = JSONObject(theme)
            val accent = json.optString("accentColor")
            if (accent.isNotBlank()) return Color.parseColor(accent)
        } catch (_: Exception) {}
        return when (theme) {
            "glassmorphism" -> Color.parseColor("#FF39ff14")
            "liquidglass"   -> Color.parseColor("#FF00F0FF")
            "luxury"        -> Color.parseColor("#FFdfba6b")
            "cyberpunk"     -> Color.parseColor("#FFff003c")
            "minimal"       -> Color.parseColor("#FF333333")
            "warm"          -> Color.parseColor("#FFe8824b")
            else            -> Color.parseColor("#FFff0000")
        }
    }

    fun themeText(theme: String): Int {
        try {
            val json = JSONObject(theme)
            val txt = json.optString("textColor")
            if (txt.isNotBlank()) return Color.parseColor(txt)
        } catch (_: Exception) {}
        return when (theme) {
            "minimal" -> Color.parseColor("#FF111111")
            else      -> Color.parseColor("#FFFFFFFF")
        }
    }

    fun themeSubtext(theme: String): Int {
        try {
            val json = JSONObject(theme)
            val sub = json.optString("subtextColor")
            if (sub.isNotBlank()) return Color.parseColor(sub)
        } catch (_: Exception) {}
        return when (theme) {
            "minimal" -> Color.parseColor("#FF666666")
            else      -> Color.parseColor("#FF888888")
        }
    }
}
