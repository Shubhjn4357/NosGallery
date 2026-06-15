
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

  const syncToNative = async (state: any) => {
    try {
      const dynamicState = {
        githubUsername: state.githubUsername,
        googleHealthConnected: state.googleHealthConnected,
        geminiApiKey: state.geminiApiKey,
        activeAiProvider: state.activeAiProvider,
        waterGoal: state.waterGoal,
        waterIntake: state.waterIntake,
        stopwatchTime: state.stopwatchTime,
        stopwatchRunning: state.stopwatchRunning,
        stopwatchLaps: state.stopwatchLaps,
        torchEnabled: state.torchEnabled,
        musicPlaying: state.musicPlaying,
        currentTrackIndex: state.currentTrackIndex,
        systemVolume: state.systemVolume,
      };

      await ExpoWidget.saveWidgetsStore(
        JSON.stringify(state.widgets),
        state.activeTheme,
        JSON.stringify(dynamicState)
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
    (state) => {
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
