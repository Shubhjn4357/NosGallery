import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from './widget-task-handler';
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const msg = args[0];
    if (typeof msg === 'string') {
      if (
        msg.includes('useNativeDriver') ||
        msg.includes('pointerEvents') ||
        msg.includes('shadow*')
      ) {
        return;
      }
    }
    originalWarn(...args);
  };
}

// Register widget task handler for OS home screen widgets
registerWidgetTaskHandler(widgetTaskHandler);

// Bootstrap Expo Router application
import 'expo-router/entry';
