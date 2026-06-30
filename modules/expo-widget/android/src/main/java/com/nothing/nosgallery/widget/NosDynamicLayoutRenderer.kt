package com.nothing.nosgallery.widget

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.res.ColorStateList
import android.graphics.Color
import android.os.Build
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.widget.LinearLayout
import android.widget.RemoteViews
import expo.modules.expowidget.R
import org.json.JSONArray
import org.json.JSONObject
import java.util.Locale

object NosDynamicLayoutRenderer {

    private val radiusMap: Map<Int, Int> = mapOf(
        4 to R.drawable.widget_rounded_bg_4,
        8 to R.drawable.widget_rounded_bg_8,
        12 to R.drawable.widget_rounded_bg_12,
        16 to R.drawable.widget_rounded_bg_16,
        24 to R.drawable.widget_rounded_bg_24,
        32 to R.drawable.widget_rounded_bg_32
    )

    fun renderNode(
        context: Context,
        node: JSONObject,
        appWidgetId: Int,
        provider: NosBaseWidgetProvider
    ): RemoteViews? {
        val type = node.optString("type", "view")
        val style = node.optJSONObject("style") ?: JSONObject()
        val packageName = context.packageName

        // Choose layout resource based on type and layout options
        val layoutRes = when (type) {
            "text" -> {
                val flex = style.optDouble("flex", 0.0)
                if (flex > 0.0) R.layout.widget_dynamic_text_weight else R.layout.widget_dynamic_text
            }
            "image" -> R.layout.widget_dynamic_image
            "progress" -> R.layout.widget_dynamic_progress
            "clock" -> R.layout.widget_dynamic_clock
            "chronometer" -> R.layout.widget_dynamic_chronometer
            "button" -> R.layout.widget_dynamic_button
            else -> {
                val flexDir = style.optString("flexDirection", "column")
                if (flexDir == "row") R.layout.widget_dynamic_view_row else R.layout.widget_dynamic_view_column
            }
        }

        val views = RemoteViews(packageName, layoutRes)
        val viewId = when (type) {
            "text" -> R.id.dynamic_text
            "image" -> R.id.dynamic_image
            "progress" -> R.id.dynamic_progress
            "clock" -> R.id.dynamic_clock
            "chronometer" -> R.id.dynamic_chronometer
            "button" -> R.id.dynamic_button
            else -> R.id.dynamic_view_container
        }

        // Apply Styles
        applyStylesToView(context, views, viewId, style)

        // Apply specific properties based on type
        when (type) {
            "text" -> {
                val textValue = node.optString("text", "")
                views.setTextViewText(viewId, textValue)
            }
            "button" -> {
                val btnText = node.optString("text", "")
                views.setTextViewText(viewId, btnText)
                val action = node.optString("action")
                if (!action.isNullOrBlank()) {
                    val pi = provider.getClickPendingIntent(context, appWidgetId, action)
                    views.setOnClickPendingIntent(viewId, pi)
                }
            }
            "clock" -> {
                val format = node.optString("clockFormat", "h:mm a")
                views.setCharSequence(viewId, "setFormat12Hour", format)
                views.setCharSequence(viewId, "setFormat24Hour", if (format.contains("a")) "HH:mm" else format)
            }
            "chronometer" -> {
                val dynamicState = NosWidgetPreferences.getDynamicStateJson(context)
                val running = dynamicState.optBoolean("stopwatchRunning", false)
                val timeVal = dynamicState.optLong("stopwatchTime", 0L)
                if (running) {
                    val baseTime = android.os.SystemClock.elapsedRealtime() - (timeVal * 100)
                    views.setChronometer(viewId, baseTime, null, true)
                } else {
                    views.setChronometer(viewId, android.os.SystemClock.elapsedRealtime(), null, false)
                    val mins = timeVal / 600
                    val secs = (timeVal % 600) / 10
                    val deci = timeVal % 10
                    val textStr = String.format("%02d:%02d.%d", mins, secs, deci)
                    views.setCharSequence(viewId, "setFormat", textStr)
                }
            }
            "progress" -> {
                val progValue = node.optInt("progressValue", -1)
                val value = if (progValue >= 0) progValue else {
                    val progObj = node.optJSONObject("progress")
                    progObj?.optInt("value", 0) ?: 0
                }
                
                val max = node.optJSONObject("progress")?.optInt("max", 100) ?: 100
                views.setProgressBar(viewId, max, value, false)
                
                val accentColorStr = style.optString("color").takeIf { it.isNotBlank() } 
                    ?: node.optString("accentColor").takeIf { it.isNotBlank() }
                if (!accentColorStr.isNullOrBlank() && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    try {
                        val color = Color.parseColor(accentColorStr)
                        views.setColorStateList(viewId, "setProgressTintList", ColorStateList.valueOf(color))
                    } catch (_: Exception) {}
                }
            }
            "image" -> {
                val name = node.optString("imageName", "")
                if (name.isNotEmpty()) {
                    val resName = "ic_" + name.lowercase(Locale.getDefault())
                    val resId = context.resources.getIdentifier(resName, "drawable", context.packageName)
                    if (resId != 0) {
                        views.setImageViewResource(viewId, resId)
                        val tintColorStr = style.optString("color").takeIf { it.isNotBlank() }
                        if (!tintColorStr.isNullOrBlank()) {
                            try {
                                val color = Color.parseColor(tintColorStr)
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                                    views.setInt(viewId, "setImageTintList", Color.parseColor(tintColorStr))
                                }
                            } catch (_: Exception) {}
                        }
                    }
                }
            }
        }

        // Apply Click handler to the container view if defined
        val viewAction = node.optString("action")
        if (type == "view" && !viewAction.isNullOrBlank()) {
            val pi = provider.getClickPendingIntent(context, appWidgetId, viewAction)
            views.setOnClickPendingIntent(viewId, pi)
        }

        // Render and add children
        val children = node.optJSONArray("children")
        if (children != null && children.length() > 0) {
            val gap = style.optDouble("gap", 0.0)
            val flexDir = style.optString("flexDirection", "column")
            
            for (i in 0 until children.length()) {
                val childJson = children.optJSONObject(i) ?: continue
                
                // Add gap spacer between children
                if (gap > 0.0 && i > 0) {
                    val spacerViews = createSpacer(context, gap, flexDir)
                    views.addView(viewId, spacerViews)
                }

                // Apply margins as spacer before child
                val childStyle = childJson.optJSONObject("style")
                if (childStyle != null) {
                    val marginTop = childStyle.optDouble("marginTop", 0.0)
                    val marginLeft = childStyle.optDouble("marginLeft", 0.0)
                    if (flexDir == "column" && marginTop > 0.0) {
                        views.addView(viewId, createSpacer(context, marginTop, "column"))
                    } else if (flexDir == "row" && marginLeft > 0.0) {
                        views.addView(viewId, createSpacer(context, marginLeft, "row"))
                    }
                }

                val childViews = renderNode(context, childJson, appWidgetId, provider)
                if (childViews != null) {
                    views.addView(viewId, childViews)
                }

                // Apply margins as spacer after child
                if (childStyle != null) {
                    val marginBottom = childStyle.optDouble("marginBottom", 0.0)
                    val marginRight = childStyle.optDouble("marginRight", 0.0)
                    if (flexDir == "column" && marginBottom > 0.0) {
                        views.addView(viewId, createSpacer(context, marginBottom, "column"))
                    } else if (flexDir == "row" && marginRight > 0.0) {
                        views.addView(viewId, createSpacer(context, marginRight, "row"))
                    }
                }
            }
        }

        return views
    }

    private fun createSpacer(context: Context, sizeDp: Double, direction: String): RemoteViews {
        val views = RemoteViews(context.packageName, R.layout.widget_dynamic_spacer)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (direction == "row") {
                views.setViewLayoutWidth(R.id.dynamic_spacer, sizeDp.toFloat(), TypedValue.COMPLEX_UNIT_DIP)
                views.setViewLayoutHeight(R.id.dynamic_spacer, 1f, TypedValue.COMPLEX_UNIT_DIP)
            } else {
                views.setViewLayoutWidth(R.id.dynamic_spacer, 1f, TypedValue.COMPLEX_UNIT_DIP)
                views.setViewLayoutHeight(R.id.dynamic_spacer, sizeDp.toFloat(), TypedValue.COMPLEX_UNIT_DIP)
            }
        } else {
            val scale = context.resources.displayMetrics.density
            val sizePx = (sizeDp * scale + 0.5f).toInt()
            if (direction == "row") {
                views.setViewPadding(R.id.dynamic_spacer, sizePx, 1, 0, 0)
            } else {
                views.setViewPadding(R.id.dynamic_spacer, 1, sizePx, 0, 0)
            }
        }
        return views
    }

    private fun applyStylesToView(
        context: Context,
        views: RemoteViews,
        viewId: Int,
        style: JSONObject
    ) {
        val scale = context.resources.displayMetrics.density

        // 1. Background color + Border radius
        val bgColorStr = style.optString("backgroundColor")
        if (bgColorStr.isNotEmpty() && bgColorStr != "transparent") {
            try {
                val color = Color.parseColor(bgColorStr)
                val borderRadius = style.optInt("borderRadius", 0)
                
                if (borderRadius > 0) {
                    val closestRadius = radiusMap.keys.minByOrNull { Math.abs(it - borderRadius) } ?: 16
                    val drawableRes = radiusMap[closestRadius] ?: R.drawable.widget_rounded_bg_16
                    
                    views.setInt(viewId, "setBackgroundResource", drawableRes)
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                        views.setColorStateList(viewId, "setBackgroundTintList", ColorStateList.valueOf(color))
                    }
                } else {
                    views.setInt(viewId, "setBackgroundColor", color)
                }
            } catch (_: Exception) {}
        }

        // 2. Padding
        val padding = style.optDouble("padding", 0.0)
        val paddingLeft = style.optDouble("paddingLeft", padding)
        val paddingRight = style.optDouble("paddingRight", padding)
        val paddingTop = style.optDouble("paddingTop", padding)
        val paddingBottom = style.optDouble("paddingBottom", padding)

        val plPx = (paddingLeft * scale + 0.5f).toInt()
        val prPx = (paddingRight * scale + 0.5f).toInt()
        val ptPx = (paddingTop * scale + 0.5f).toInt()
        val pbPx = (paddingBottom * scale + 0.5f).toInt()
        views.setViewPadding(viewId, plPx, ptPx, prPx, pbPx)

        // 3. Size (width/height)
        val widthVal = style.optDouble("width", -1.0)
        val heightVal = style.optDouble("height", -1.0)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (widthVal > 0.0) {
                views.setViewLayoutWidth(viewId, widthVal.toFloat(), TypedValue.COMPLEX_UNIT_DIP)
            }
            if (heightVal > 0.0) {
                views.setViewLayoutHeight(viewId, heightVal.toFloat(), TypedValue.COMPLEX_UNIT_DIP)
            }
        }

        // 4. Flex / Grid gravity
        val flexDirection = style.optString("flexDirection", "column")
        val justifyContent = style.optString("justifyContent", "flex-start")
        val alignItems = style.optString("alignItems", "stretch")

        var gravity = 0
        if (flexDirection == "row") {
            gravity = when (justifyContent) {
                "center" -> Gravity.CENTER_HORIZONTAL
                "flex-end" -> Gravity.RIGHT
                else -> Gravity.LEFT
            }
            gravity = gravity or when (alignItems) {
                "center" -> Gravity.CENTER_VERTICAL
                "flex-end" -> Gravity.BOTTOM
                else -> Gravity.TOP
            }
            views.setInt(viewId, "setOrientation", LinearLayout.HORIZONTAL)
        } else {
            gravity = when (justifyContent) {
                "center" -> Gravity.CENTER_VERTICAL
                "flex-end" -> Gravity.BOTTOM
                else -> Gravity.TOP
            }
            gravity = gravity or when (alignItems) {
                "center" -> Gravity.CENTER_HORIZONTAL
                "flex-end" -> Gravity.RIGHT
                else -> Gravity.LEFT
            }
            views.setInt(viewId, "setOrientation", LinearLayout.VERTICAL)
        }
        views.setInt(viewId, "setGravity", gravity)

        // 5. Text-specific styles (color, size, alignment)
        val textColorStr = style.optString("color")
        if (textColorStr.isNotEmpty()) {
            try {
                val color = Color.parseColor(textColorStr)
                views.setTextColor(viewId, color)
            } catch (_: Exception) {}
        }

        val fontSize = style.optDouble("fontSize", 0.0)
        if (fontSize > 0.0) {
            views.setTextViewTextSize(viewId, TypedValue.COMPLEX_UNIT_SP, fontSize.toFloat())
        }

        val textAlign = style.optString("textAlign", "left")
        val textGravity = when (textAlign) {
            "center" -> Gravity.CENTER
            "right" -> Gravity.RIGHT
            else -> Gravity.LEFT
        }
        views.setInt(viewId, "setGravity", textGravity)
    }
}
