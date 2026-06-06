import { NativeModule, requireNativeModule } from 'expo';

declare class NosWidgetPinningModule extends NativeModule<{}> {
  requestPinWidget(widgetName: string): Promise<boolean>;
}

let NosWidgetPinning: { requestPinWidget(widgetName: string): Promise<boolean> };

try {
  NosWidgetPinning = requireNativeModule<NosWidgetPinningModule>('NosWidgetPinning');
} catch (e) {
  console.warn("NosWidgetPinning native module was not found in the binary. Falling back to mock implementation.");
  NosWidgetPinning = {
    async requestPinWidget(widgetName: string) {
      console.log(`[NosWidgetPinning Mock] requestPinWidget called for ${widgetName}`);
      return false;
    }
  };
}

export default NosWidgetPinning;
