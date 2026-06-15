package expo.modules.expowidget

import android.content.Intent
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Unified Expo module that provides widget pinning, config storage,
 * and store synchronization for Android native widgets.
 *
 * This module is the JS ↔ Native bridge for the expo-widget package.
 * It replaces the old standalone NosWidgetPinningModule.
 */
class ExpoWidgetModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoWidget")

    /**
     * Request the Android launcher to show a pin-widget dialog.
     * [widgetName] is the simple class name, e.g. "NOSWidget2x2".
     * [widgetId] is the React Native unique ID for this widget instance.
     * [category] is the widget category (e.g. "clock", "weather").
     * [widgetJson] is the full JSON config blob.
     */
    AsyncFunction("requestPinWidget") { widgetName: String, widgetId: String, category: String, widgetJson: String ->
      val context = appContext.reactContext ?: throw IllegalStateException("React context is not available")
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val appWidgetManager = AppWidgetManager.getInstance(context)
        val providerClassName = getWidgetProviderClassName(context, widgetName)
          ?: throw IllegalArgumentException("Widget provider class name not found for: $widgetName")

        val myProvider = ComponentName(context, providerClassName)
        if (appWidgetManager.isRequestPinAppWidgetSupported) {
          val callbackIntent = Intent().apply {
            setClassName(context.packageName, getPinReceiverClassName(context))
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
     * Save widget customization to SharedPreferences.
     * The native AppWidgetProvider reads this without invoking JS.
     */
    AsyncFunction("saveWidgetConfig") { category: String, widgetJson: String ->
      val context = appContext.reactContext ?: throw IllegalStateException("React context is not available")
      saveWidgetConfig(context, -1, category, widgetJson)
      notifyAllWidgets(context)
    }

    /**
     * Persist the entire widgets array, active theme, and dynamic states from React Native.
     * Called from a Zustand/state store subscriber when state changes.
     */
    AsyncFunction("saveWidgetsStore") { widgetsJson: String, activeTheme: String, dynamicStateJson: String ->
      val context = appContext.reactContext ?: throw IllegalStateException("React context is not available")
      getPrefs(context).edit()
        .putString("widgets", widgetsJson)
        .putString("activeTheme", activeTheme)
        .putString("dynamicState", dynamicStateJson)
        .apply()
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

  private fun getPinReceiverClassName(context: Context): String =
    "${context.packageName}.widget.NosWidgetPinReceiver"

  private fun getPrefs(context: Context) =
    context.getSharedPreferences(PREFS_FILE, Context.MODE_PRIVATE)

  private fun saveWidgetConfig(
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
        } catch (e: Exception) {
          // Non-fatal
        }
      }
    }
  }

  companion object {
    private const val PREFS_FILE = "nos-gallery-native-storage"
  }
}
