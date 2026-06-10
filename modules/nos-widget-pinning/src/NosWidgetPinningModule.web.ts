import { registerWebModule, NativeModule } from 'expo';

// NosWidgetPinningModule is not available on the web platform.
class NosWidgetPinningModule extends NativeModule<{}> {
  async requestPinWidget(widgetName: string, widgetId: string, category: string, widgetJson: string): Promise<boolean> {
    console.warn('NosWidgetPinning.requestPinWidget is not supported on Web');
    return false;
  }
  async saveWidgetConfig(category: string, widgetJson: string): Promise<void> {
    console.warn('NosWidgetPinning.saveWidgetConfig is not supported on Web');
  }
  async saveWidgetsStore(widgetsJson: string, activeTheme: string): Promise<void> {
    console.warn('NosWidgetPinning.saveWidgetsStore is not supported on Web');
  }
}

export default registerWebModule(NosWidgetPinningModule, 'NosWidgetPinningModule');
