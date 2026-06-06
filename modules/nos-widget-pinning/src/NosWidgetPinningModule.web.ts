import { registerWebModule, NativeModule } from 'expo';

// NosWidgetPinningModule is not available on the web platform.
class NosWidgetPinningModule extends NativeModule<{}> {
  async requestPinWidget(widgetName: string): Promise<boolean> {
    console.warn('NosWidgetPinning.requestPinWidget is not supported on Web');
    return false;
  }
}

export default registerWebModule(NosWidgetPinningModule, 'NosWidgetPinningModule');
