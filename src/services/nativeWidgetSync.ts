
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { ExpoWidget } from '../../modules/expo-widget/src';
import { useWidgetStore } from '../store/widgetStore';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const isAndroid = Platform.OS === 'android';

let unsubscribe: (() => void) | null = null;

/** Call this once in the app root (e.g. App.tsx / index.tsx useEffect). */
export function startNativeWidgetSync() {
  if (!isAndroid || isExpoGo) return;

  const syncToNative = async (state: { widgets: any[]; activeTheme: string }) => {
    try {
      await ExpoWidget.saveWidgetsStore(
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
