package com.nothing.nosgallery.store

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import androidx.compose.runtime.mutableStateOf
import com.nothing.nosgallery.widget.NosWidgetPreferences
import com.nothing.nosgallery.widget.WidgetLayoutCompiler
import org.json.JSONArray
import org.json.JSONObject
import java.util.Locale

class WidgetStore private constructor(private val context: Context) {

    private val prefs: SharedPreferences = NosWidgetPreferences.getPrefs(context)

    // Reactive Compose States
    val activeTab = mutableStateOf("editor")
    val activeTheme = mutableStateOf(prefs.getString("activeTheme", "nos") ?: "nos")
    
    val githubUsername = mutableStateOf(prefs.getString("githubUsername", "octocat") ?: "octocat")
    val geminiApiKey = mutableStateOf(prefs.getString("geminiApiKey", "") ?: "")
    val googleHealthConnected = mutableStateOf(prefs.getBoolean("googleHealthConnected", false))
    
    val autoRefresh = mutableStateOf(prefs.getBoolean("autoRefresh", true))
    val refreshInterval = mutableStateOf(prefs.getString("refreshInterval", "realtime") ?: "realtime")
    val batterySaver = mutableStateOf(prefs.getBoolean("batterySaver", false))
    
    val hapticsEnabled = mutableStateOf(prefs.getBoolean("hapticsEnabled", true))
    val soundEnabled = mutableStateOf(prefs.getBoolean("soundEnabled", true))

    // Interactive States
    val waterIntake = mutableStateOf(prefs.getInt("waterIntake", 1000))
    val waterGoal = mutableStateOf(prefs.getInt("waterGoal", 2000))
    val stopwatchTime = mutableStateOf(prefs.getLong("stopwatchTime", 0L))
    val stopwatchRunning = mutableStateOf(false) // always reset on launch
    val torchEnabled = mutableStateOf(prefs.getBoolean("torchEnabled", false))
    val soundProfile = mutableStateOf(prefs.getString("soundProfile", "vibrate") ?: "vibrate")

    // Preview widgets list on grid canvas
    val widgetsList = mutableStateOf<List<SavedWidget>>(emptyList())

    init {
        loadWidgets()
        saveStateToNative(notify = false)
    }

    fun loadWidgets() {
        val raw = prefs.getString("widgets", null)
        val list = mutableListOf<SavedWidget>()
        if (raw != null) {
            try {
                val array = JSONArray(raw)
                for (i in 0 until array.length()) {
                    val obj = array.getJSONObject(i)
                    list.add(
                        SavedWidget(
                            id = obj.getString("id"),
                            templateId = obj.getString("templateId"),
                            w = obj.getInt("w"),
                            h = obj.getInt("h")
                        )
                    )
                }
            } catch (_: Exception) {}
        } else {
            // Default initial widgets
            list.add(SavedWidget("init_clock", "clock_dot", 4, 2))
            list.add(SavedWidget("init_weather", "weather_aqi", 2, 2))
            list.add(SavedWidget("init_steps", "health_steps", 2, 2))
        }
        widgetsList.value = list
    }

    fun addWidget(templateId: String, w: Int, h: Int) {
        val id = "widget_${System.currentTimeMillis()}"
        widgetsList.value = widgetsList.value + SavedWidget(id, templateId, w, h)
        saveStateToNative()
    }

    fun removeWidget(id: String) {
        widgetsList.value = widgetsList.value.filter { it.id != id }
        saveStateToNative()
    }

    fun clearWidgets() {
        widgetsList.value = emptyList()
        saveStateToNative()
    }

    fun setWaterIntakeValue(value: Int) {
        waterIntake.value = Math.max(0, Math.min(waterGoal.value, value))
        saveStateToNative()
    }

    fun toggleTorch(enable: Boolean) {
        torchEnabled.value = enable
        saveStateToNative()
    }

    fun saveStateToNative(notify: Boolean = true) {
        val editor = prefs.edit()
        
        // Save state fields directly
        editor.putString("activeTheme", activeTheme.value)
        editor.putString("githubUsername", githubUsername.value)
        editor.putString("geminiApiKey", geminiApiKey.value)
        editor.putBoolean("googleHealthConnected", googleHealthConnected.value)
        editor.putBoolean("autoRefresh", autoRefresh.value)
        editor.putString("refreshInterval", refreshInterval.value)
        editor.putBoolean("batterySaver", batterySaver.value)
        editor.putBoolean("hapticsEnabled", hapticsEnabled.value)
        editor.putBoolean("soundEnabled", soundEnabled.value)
        editor.putInt("waterIntake", waterIntake.value)
        editor.putInt("waterGoal", waterGoal.value)
        editor.putLong("stopwatchTime", stopwatchTime.value)
        editor.putBoolean("torchEnabled", torchEnabled.value)
        editor.putString("soundProfile", soundProfile.value)

        // Compile and serialize active widgets with their compiled layout JSONs
        val widgetsArray = JSONArray()
        for (w in widgetsList.value) {
            val wObj = JSONObject()
            wObj.put("id", w.id)
            wObj.put("templateId", w.templateId)
            wObj.put("w", w.w)
            wObj.put("h", w.h)
            
            // Build customizations mapping active theme and local states
            val customizations = mutableMapOf<String, Any>()
            customizations["titleText"] = getWidgetTitle(w.templateId)
            customizations["valueText"] = getWidgetValue(w.templateId)
            
            val layoutNode = WidgetLayoutCompiler.compile(w.templateId, customizations, activeTheme.value, getStoreStateMap())
            wObj.put("layoutJSON", layoutNode.toString())
            widgetsArray.put(wObj)
        }
        editor.putString("widgets", widgetsArray.toString())

        // Build dynamicState json
        val dynamicObj = JSONObject()
        val stateMap = getStoreStateMap()
        for ((k, v) in stateMap) {
            dynamicObj.put(k, v)
        }
        editor.putString("dynamicState", dynamicObj.toString())

        editor.apply()

        if (notify) {
            notifyAllWidgets(context)
        }
    }

    private fun getStoreStateMap(): Map<String, Any> {
        return mapOf(
            "githubUsername" to githubUsername.value,
            "googleHealthConnected" to googleHealthConnected.value,
            "geminiApiKey" to geminiApiKey.value,
            "waterGoal" to waterGoal.value,
            "waterIntake" to waterIntake.value,
            "stopwatchTime" to stopwatchTime.value,
            "stopwatchRunning" to stopwatchRunning.value,
            "torchEnabled" to torchEnabled.value,
            "soundProfile" to soundProfile.value,
            "activeTheme" to activeTheme.value
        )
    }

    private fun getWidgetTitle(templateId: String): String {
        return when (templateId) {
            "clock_dot" -> "DOT CLOCK"
            "clock_digital" -> "DIGITAL CLOCK"
            "clock_analog" -> "ANALOG CLOCK"
            "clock_flip" -> "FLIP CLOCK"
            "clock_stopwatch" -> "STOPWATCH"
            "health_steps" -> "STEPS TRACKER"
            "health_water" -> "WATER TRACKER"
            "developer_battery" -> "BATTERY"
            "weather_aqi" -> "AIR QUALITY"
            "weather_current" -> "WEATHER"
            "smart_home_sound_control" -> "SOUND CONTROL"
            else -> "NOS WIDGET"
        }
    }

    private fun getWidgetValue(templateId: String): String {
        return when (templateId) {
            "health_steps" -> "5,420 steps"
            "health_water" -> "${waterIntake.value} / ${waterGoal.value} ml"
            "developer_battery" -> "82%"
            "weather_aqi" -> "32 AQI"
            "weather_current" -> "24°C"
            "smart_home_sound_control" -> soundProfile.value.uppercase(Locale.getDefault())
            else -> "--"
        }
    }

    private fun notifyAllWidgets(context: Context) {
        val appWidgetManager = AppWidgetManager.getInstance(context)
        val installedProviders = appWidgetManager.installedProviders ?: return
        for (providerInfo in installedProviders) {
            if (providerInfo.provider.packageName == context.packageName) {
                try {
                    val componentName = providerInfo.provider
                    val widgetIds = appWidgetManager.getAppWidgetIds(componentName)
                    if (widgetIds != null && widgetIds.isNotEmpty()) {
                        val intent = Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE)
                        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, widgetIds)
                        intent.component = componentName
                        context.sendBroadcast(intent)
                    }
                } catch (_: Exception) {}
            }
        }
    }

    companion object {
        @Volatile
        private var instance: WidgetStore? = null

        fun getInstance(context: Context): WidgetStore {
            return instance ?: synchronized(this) {
                instance ?: WidgetStore(context.applicationContext).also { instance = it }
            }
        }
    }
}

data class SavedWidget(
    val id: String,
    val templateId: String,
    val w: Int,
    val h: Int
)
