import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from './widget-task-handler';

// Register widget task handler for OS home screen widgets
registerWidgetTaskHandler(widgetTaskHandler);

// Bootstrap Expo Router application
import 'expo-router/entry';
