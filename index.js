// Bootstrap Expo Router application first to ensure globals, React Native core, and Expo are properly initialized.
import 'expo-router/entry';

// NOTE: The old react-native-android-widget headless JS task handler has been removed.
// Widget rendering is now handled natively in Kotlin (NosBaseWidgetProvider subclasses)
// which read customization state from SharedPreferences written by NosWidgetPinningModule.
// This eliminates the JS thread wakeup on every widget update/click.
