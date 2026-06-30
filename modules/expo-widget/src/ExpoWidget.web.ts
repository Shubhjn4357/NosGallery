import { registerWebModule, NativeModule } from 'expo';

/**
 * Web platform fallback — widget features are Android-only.
 * All methods are no-ops on web.
 */
class ExpoWidgetModule extends NativeModule<{}> {
  async requestPinWidget(_widgetName: string, _widgetId: string, _category: string, _widgetJson: string): Promise<boolean> {
    console.warn('ExpoWidget.requestPinWidget is not supported on Web');
    return false;
  }
  async saveWidgetConfig(_category: string, _widgetJson: string): Promise<void> {
    console.warn('ExpoWidget.saveWidgetConfig is not supported on Web');
  }
  async saveWidgetsStore(_widgetsJson: string, _activeTheme: string, _dynamicStateJson: string): Promise<void> {
    console.warn('ExpoWidget.saveWidgetsStore is not supported on Web');
  }
}

export default registerWebModule(ExpoWidgetModule, 'ExpoWidget');
