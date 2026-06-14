/**
 * expo-widget — Android native widget system for Expo/React Native
 *
 * Fully dynamic, data-driven widget engine. Define widgets in React Native,
 * render them natively on the Android home screen. No native code changes needed.
 *
 * @example
 * ```ts
 * import { ExpoWidget, WidgetConfig } from 'expo-widget';
 *
 * // Pin a widget to the home screen
 * const config: WidgetConfig = {
 *   id: 'my_clock',
 *   templateId: 'clock_digital',
 *   w: 2, h: 2,
 *   customizations: {
 *     titleText: 'MY CLOCK',
 *     valueText: '10:42 PM',
 *     footerText: 'NOS • CLOCK',
 *   }
 * };
 *
 * await ExpoWidget.requestPinWidget('NOSWidget2x2', config.id, 'clock', JSON.stringify(config));
 * ```
 */

// Native module bridge
export { default as ExpoWidget } from './ExpoWidget';

// Types
export type {
  WidgetConfig,
  WidgetCustomizations,
  ClickHandler,
  WidgetSize,
} from './ExpoWidget.types';

// Helpers
export {
  getWidgetProviderName,
  buildWidgetConfig,
} from './helpers';
