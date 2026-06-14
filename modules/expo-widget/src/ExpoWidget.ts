import { NativeModule, requireNativeModule } from 'expo';

/**
 * Native module bridge for expo-widget.
 * Provides widget pinning, config persistence, and store synchronization.
 */
declare class ExpoWidgetNativeModule extends NativeModule<{}> {
  requestPinWidget(widgetName: string, widgetId: string, category: string, widgetJson: string): Promise<boolean>;
  saveWidgetConfig(category: string, widgetJson: string): Promise<void>;
  saveWidgetsStore(widgetsJson: string, activeTheme: string): Promise<void>;
}

let ExpoWidget: {
  requestPinWidget(widgetName: string, widgetId: string, category: string, widgetJson: string): Promise<boolean>;
  saveWidgetConfig(category: string, widgetJson: string): Promise<void>;
  saveWidgetsStore(widgetsJson: string, activeTheme: string): Promise<void>;
};

try {
  ExpoWidget = requireNativeModule<ExpoWidgetNativeModule>('ExpoWidget');
} catch (e) {
  console.warn('[ExpoWidget] Native module not found — using mock. Widget pinning will not work.');
  ExpoWidget = {
    async requestPinWidget(_widgetName: string, _widgetId: string, _category: string, _widgetJson: string) {
      console.log(`[ExpoWidget Mock] requestPinWidget(${_widgetName}, ${_widgetId}, ${_category})`);
      return false;
    },
    async saveWidgetConfig(_category: string, _widgetJson: string) {
      console.log(`[ExpoWidget Mock] saveWidgetConfig(${_category})`);
    },
    async saveWidgetsStore(_widgetsJson: string, _activeTheme: string) {
      console.log(`[ExpoWidget Mock] saveWidgetsStore(theme=${_activeTheme})`);
    },
  };
}

export default ExpoWidget;
