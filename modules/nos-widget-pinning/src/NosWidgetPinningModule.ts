import { NativeModule, requireNativeModule } from 'expo';

declare class NosWidgetPinningModule extends NativeModule<{}> {
  requestPinWidget(widgetName: string, widgetId: string, category: string, widgetJson: string): Promise<boolean>;
  saveWidgetConfig(category: string, widgetJson: string): Promise<void>;
  saveWidgetsStore(widgetsJson: string, activeTheme: string): Promise<void>;
}

let NosWidgetPinning: {
  requestPinWidget(widgetName: string, widgetId: string, category: string, widgetJson: string): Promise<boolean>;
  saveWidgetConfig(category: string, widgetJson: string): Promise<void>;
  saveWidgetsStore(widgetsJson: string, activeTheme: string): Promise<void>;
};

try {
  NosWidgetPinning = requireNativeModule<NosWidgetPinningModule>('NosWidgetPinning');
} catch (e) {
  console.warn('[NosWidgetPinning] Native module not found — using mock.');
  NosWidgetPinning = {
    async requestPinWidget(widgetName: string, widgetId: string, category: string, widgetJson: string) {
      console.log(`[NosWidgetPinning Mock] requestPinWidget(${widgetName}, ${widgetId}, ${category})`);
      return false;
    },
    async saveWidgetConfig(category: string, widgetJson: string) {
      console.log(`[NosWidgetPinning Mock] saveWidgetConfig(${category})`);
    },
    async saveWidgetsStore(widgetsJson: string, activeTheme: string) {
      console.log(`[NosWidgetPinning Mock] saveWidgetsStore(theme=${activeTheme})`);
    },
  };
}

export default NosWidgetPinning;
