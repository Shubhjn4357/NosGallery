package expo.modules.noswidgetpinning

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NosWidgetPinningModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("NosWidgetPinning")

    AsyncFunction("requestPinWidget") { widgetName: String ->
      val context = appContext.reactContext ?: throw IllegalStateException("React context is not available")
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val appWidgetManager = AppWidgetManager.getInstance(context)
        val providerClassName = getWidgetProviderClassName(context, widgetName)
          ?: throw IllegalArgumentException("Widget provider class name not found for: $widgetName")
        
        val myProvider = ComponentName(context, providerClassName)
        if (appWidgetManager.isRequestPinAppWidgetSupported) {
          appWidgetManager.requestPinAppWidget(myProvider, null, null)
        } else {
          false
        }
      } else {
        false
      }
    }
  }

  private fun getWidgetProviderClassName(context: Context, widgetName: String): String? {
    val appWidgetManager = AppWidgetManager.getInstance(context)
    val installedProviders = appWidgetManager.installedProviders
    for (providerInfo in installedProviders) {
      if (providerInfo.provider.packageName == context.packageName &&
          providerInfo.provider.shortClassName.endsWith(".$widgetName")) {
        return providerInfo.provider.className
      }
    }
    return null
  }
}
