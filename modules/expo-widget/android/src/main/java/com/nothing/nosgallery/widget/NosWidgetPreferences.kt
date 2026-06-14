package com.nothing.nosgallery.widget

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject

/**
 * Shared utility for reading widget configuration written by the React Native UI.
 * RN calls NosWidgetPinningModule.saveWidgetConfig(widgetsJson, activeTheme, pinnedWidgetId, category)
 * which writes to the "nos-gallery-native-storage" SharedPreferences file.
 *
 * Key format:
 *   "widgets"       → JSON array of all widget objects
 *   "activeTheme"   → global theme id string
 *   "pinned_{id}"   → JSON object of the pinned widget config for a specific appWidgetId
 *   "category_{id}" → category string (e.g. "clock", "weather") for a specific appWidgetId
 */
object NosWidgetPreferences {

    private const val PREFS_FILE = "nos-gallery-native-storage"

    fun getPrefs(context: Context): SharedPreferences =
        context.getSharedPreferences(PREFS_FILE, Context.MODE_PRIVATE)

    // ── Global store ─────────────────────────────────────────────────────────────

    fun getWidgetsJson(context: Context): JSONArray {
        val raw = getPrefs(context).getString("widgets", null)
        if (raw != null) {
            return try { JSONArray(raw) } catch (e: Exception) { JSONArray() }
        }
        // Fallback: load default_widgets.json from assets
        return try {
            val inputStream = context.assets.open("default_widgets.json")
            val size = inputStream.available()
            val buffer = ByteArray(size)
            inputStream.read(buffer)
            inputStream.close()
            val jsonStr = String(buffer, Charsets.UTF_8)
            JSONArray(jsonStr)
        } catch (e: Exception) {
            JSONArray()
        }
    }

    fun getActiveTheme(context: Context): String =
        getPrefs(context).getString("activeTheme", "nos") ?: "nos"

    // ── Per-instance (appWidgetId) config ────────────────────────────────────────

    fun getWidgetConfig(context: Context, appWidgetId: Int): JSONObject? {
        val raw = getPrefs(context).getString("pinned_$appWidgetId", null) ?: return null
        return try { JSONObject(raw) } catch (e: Exception) { null }
    }

    fun getWidgetCategory(context: Context, appWidgetId: Int): String =
        getPrefs(context).getString("category_$appWidgetId", "clock") ?: "clock"

    fun saveWidgetConfig(
        context: Context,
        appWidgetId: Int,
        category: String,
        widgetJson: String
    ) {
        getPrefs(context).edit()
            .putString("pinned_$appWidgetId", widgetJson)
            .putString("category_$appWidgetId", category)
            .apply()
    }

    fun saveWidgetMapping(
        context: Context,
        appWidgetId: Int,
        widgetId: String,
        category: String,
        widgetJson: String
    ) {
        getPrefs(context).edit()
            .putString("map_$appWidgetId", widgetId)
            .putString("category_$appWidgetId", category)
            .putString("pinned_$appWidgetId", widgetJson)
            .apply()
    }

    fun removeWidgetConfig(context: Context, appWidgetId: Int) {
        getPrefs(context).edit()
            .remove("pinned_$appWidgetId")
            .remove("category_$appWidgetId")
            .remove("map_$appWidgetId")
            .apply()
    }

    // ── Helpers ───────────────────────────────────────────────────────────────────

    /** Find first widget in the stored array whose templateId starts with [prefix]. */
    fun findFirstByCategory(context: Context, prefix: String): JSONObject? {
        val arr = getWidgetsJson(context)
        for (i in 0 until arr.length()) {
            val obj = arr.optJSONObject(i) ?: continue
            val templateId = obj.optString("templateId", "")
            if (templateId.startsWith(prefix)) return obj
        }
        return null
    }

    /** Resolve the best widget config for this appWidgetId, templateId, and category prefix. */
    fun resolveWidgetConfig(
        context: Context,
        appWidgetId: Int,
        templateId: String?,
        categoryPrefix: String
    ): JSONObject? {
        // 1. Check if there is a mapping to a React Native widget ID
        val mappedId = getPrefs(context).getString("map_$appWidgetId", null)
        if (mappedId != null) {
            val widgets = getWidgetsJson(context)
            for (i in 0 until widgets.length()) {
                val obj = widgets.optJSONObject(i) ?: continue
                if (obj.optString("id") == mappedId) {
                    return obj
                }
            }
        }
        // 2. Fall back to per-instance saved config (backup)
        val pinned = getWidgetConfig(context, appWidgetId)
        if (pinned != null) return pinned
        
        // 3. Fall back to the default config for the specific templateId (if provided)
        if (templateId != null) {
            val widgets = getWidgetsJson(context)
            for (i in 0 until widgets.length()) {
                val obj = widgets.optJSONObject(i) ?: continue
                if (obj.optString("templateId") == templateId) return obj
            }
        }
        
        // 4. Fall back to the first stored widget of this category
        return findFirstByCategory(context, categoryPrefix)
    }

    // ── Color helpers ─────────────────────────────────────────────────────────────

    /**
     * Parse a hex color string (#RRGGBB or #AARRGGBB) to an Android int color.
     * Falls back to [default] on any error.
     */
    fun parseColor(hex: String?, default: Int): Int {
        if (hex.isNullOrBlank()) return default
        return try {
            android.graphics.Color.parseColor(hex)
        } catch (e: Exception) {
            default
        }
    }
}

