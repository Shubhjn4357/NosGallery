import { NativeModule, requireNativeModule } from 'expo';

declare class NosWidgetPinningModule extends NativeModule<{}> {
  requestPinWidget(widgetName: string): Promise<boolean>;
}

export default requireNativeModule<NosWidgetPinningModule>('NosWidgetPinning');
