/**
 * nativeWidgetSync.ts
 *
 * Subscribes to the Zustand widget store and pushes state changes to native
 * Android SharedPreferences via NosWidgetPinningModule.saveWidgetsStore().
 *
 * This replaces the old requestWidgetUpdate / headless JS task approach.
 * The native AppWidgetProvider reads SharedPreferences directly on each
 * onUpdate() call — no JS thread involvement.
 */
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import NosWidgetPinning from '../../modules/nos-widget-pinning/src/NosWidgetPinningModule';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const isAndroid = Platform.OS === 'android';

let unsubscribe: (() => void) | null = null;

/** Call this once in the app root (e.g. App.tsx / index.tsx useEffect). */
export function startNativeWidgetSync() {
  if (!isAndroid || isExpoGo) return;

  // Lazy import so we don't pull the store into any non-Android/web bundle.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useWidgetStore } = require('../store/widgetStore');

  const syncToNative = async (state: { widgets: any[]; activeTheme: string }) => {
    try {
      await NosWidgetPinning.saveWidgetsStore(
        JSON.stringify(state.widgets),
        state.activeTheme
      );
    } catch (err) {
      // Non-fatal — widget will fall back to defaults next update
      console.log('[NativeWidgetSync] saveWidgetsStore failed:', err);
    }
  };

  // Initial sync
  const initialState = useWidgetStore.getState();
  syncToNative(initialState);

  // Subscribe to future changes (throttled to avoid rapid-fire saves)
  let pendingTimeout: ReturnType<typeof setTimeout> | null = null;

  unsubscribe = useWidgetStore.subscribe(
    (state: { widgets: any[]; activeTheme: string }) => {
      if (pendingTimeout) clearTimeout(pendingTimeout);
      pendingTimeout = setTimeout(() => {
        syncToNative(state);
        pendingTimeout = null;
      }, 500); // 500ms debounce
    }
  );
}

/** Cleanup subscription (call on app unmount if needed). */
export function stopNativeWidgetSync() {
  unsubscribe?.();
  unsubscribe = null;
}
