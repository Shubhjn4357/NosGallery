// Bootstrap Expo Router application first to ensure globals, React Native core, and Expo are properly initialized.
import 'expo-router/entry';

import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// Register widget task handler for OS home screen widgets (Android only, and not in Expo Go)
const isAndroid = Platform.OS === 'android';
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

if (isAndroid && !isExpoGo) {
  try {
    const { registerWidgetTaskHandler } = require('react-native-android-widget');
    const { widgetTaskHandler } = require('./widget-task-handler');

    registerWidgetTaskHandler(widgetTaskHandler);
  } catch (err) {
    console.warn('[NOS Entry] Failed to register widget task handler:', err);
  }
}

