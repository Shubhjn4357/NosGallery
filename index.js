// Bootstrap Expo Router application first to ensure globals, React Native core, and Expo are properly initialized.
import 'expo-router/entry';

import { Platform } from 'react-native';

// Register widget task handler for OS home screen widgets (Android only)
if (Platform.OS === 'android') {
  const { registerWidgetTaskHandler } = require('react-native-android-widget');
  const { widgetTaskHandler } = require('./widget-task-handler');

  registerWidgetTaskHandler(widgetTaskHandler);
}

