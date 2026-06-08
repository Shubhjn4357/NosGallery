package expo.modules.noswidgetpinning

import android.content.Intent
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import com.nothing.nosgallery.widget.NosWidgetPreferences
import org.json.JSONObject

class NosWidgetPinningModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("NosWidgetPinning")

    /**
     * Request the Android launcher to show a pin-widget dialog.
     * [widgetName] is the simple class name, e.g. "NOSClockWidget".
     */
    AsyncFunction("requestPinWidget") { widgetName: String, widgetId: String, category: String, widgetJson: String ->
      val context = appContext.reactContext ?: throw IllegalStateException("React context is not available")
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val appWidgetManager = AppWidgetManager.getInstance(context)
        val providerClassName = getWidgetProviderClassName(context, widgetName)
          ?: throw IllegalArgumentException("Widget provider class name not found for: $widgetName")

        val myProvider = ComponentName(context, providerClassName)
        if (appWidgetManager.isRequestPinAppWidgetSupported) {
          val callbackIntent = Intent(context, com.nothing.nosgallery.widget.NosWidgetPinReceiver::class.java).apply {
            putExtra("widgetId", widgetId)
            putExtra("category", category)
            putExtra("widgetJson", widgetJson)
          }

          val requestCode = widgetId.hashCode()
          val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
          } else {
            PendingIntent.FLAG_UPDATE_CURRENT
          }

          val successCallback = PendingIntent.getBroadcast(
            context,
            requestCode,
            callbackIntent,
            flags
          )

          appWidgetManager.requestPinAppWidget(myProvider, null, successCallback)
          true
        } else {
          false
        }
      } else {
        false
      }
    }

    /**
     * Save the current widget customization to SharedPreferences so the native
     * AppWidgetProvider can read it without invoking any JS thread.
     *
     * [category]   e.g. "clock", "weather" (prefix without underscore)
     * [widgetJson] JSON string of the widget object (templateId + customizations)
     *
     * When called just before requestPinWidget, pass appWidgetId = -1 to store as
     * a "pending next pin" record; the provider will pick it up on first WIDGET_ADDED.
     */
    AsyncFunction("saveWidgetConfig") { category: String, widgetJson: String ->
      val context = appContext.reactContext ?: throw IllegalStateException("React context is not available")
      // Store as the "latest" config for this category (widgetId = -1 is the pending slot)
      NosWidgetPreferences.saveWidgetConfig(context, -1, category, widgetJson)
      // Also broadcast an update to any already-pinned widget of this category
      notifyCategoryWidgets(context, category)
    }

    /**
     * Persist the entire widgets array and active theme from the React Native store.
     * This is called from the Zustand store subscriber when state changes.
     */
    AsyncFunction("saveWidgetsStore") { widgetsJson: String, activeTheme: String ->
      val context = appContext.reactContext ?: throw IllegalStateException("React context is not available")
      NosWidgetPreferences.getPrefs(context).edit()
        .putString("widgets", widgetsJson)
        .putString("activeTheme", activeTheme)
        .apply()
      // Refresh all pinned widgets
      notifyAllWidgets(context)
    }
  }

  private fun getWidgetProviderClassName(context: Context, widgetName: String): String? {
    val appWidgetManager = AppWidgetManager.getInstance(context)
    val installedProviders = appWidgetManager.installedProviders
    for (providerInfo in installedProviders) {
      if (providerInfo.provider.packageName == context.packageName &&
          providerInfo.provider.shortClassName.endsWith(widgetName)) {
        return providerInfo.provider.className
      }
    }
    return null
  }

  private fun notifyCategoryWidgets(context: Context, category: String) {
    val widgetClassMap = mapOf(
      "clock"        to "com.nothing.nosgallery.widget.NOSClockWidget",
      "calendar"     to "com.nothing.nosgallery.widget.NOSCalendarWidget",
      "weather"      to "com.nothing.nosgallery.widget.NOSWeatherWidget",
      "productivity" to "com.nothing.nosgallery.widget.NOSProductivityWidget",
      "health"       to "com.nothing.nosgallery.widget.NOSHealthWidget",
      "finance"      to "com.nothing.nosgallery.widget.NOSFinanceWidget",
      "developer"    to "com.nothing.nosgallery.widget.NOSDeveloperWidget",
      "social"       to "com.nothing.nosgallery.widget.NOSSocialWidget",
      "smart_home"   to "com.nothing.nosgallery.widget.NOSSmartHomeWidget",
      "ai"           to "com.nothing.nosgallery.widget.NOSAiWidget"
    )
    val className = widgetClassMap[category] ?: return
    try {
      val componentName = ComponentName(context, Class.forName(className))
      val appWidgetManager = AppWidgetManager.getInstance(context)
      val widgetIds = appWidgetManager.getAppWidgetIds(componentName)
      if (widgetIds.isNotEmpty()) {
        val intent = android.content.Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE)
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, widgetIds)
        intent.component = componentName
        context.sendBroadcast(intent)
      }
    } catch (e: Exception) {
      // Class not found or no widgets pinned — ignore
    }
  }

  private fun notifyAllWidgets(context: Context) {
    val categories = listOf("clock","calendar","weather","productivity","health","finance","developer","social","smart_home","ai")
    categories.forEach { notifyCategoryWidgets(context, it) }
  }
}
