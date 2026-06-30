
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { ExpoWidget, compileWidgetToLayout } from '../../modules/expo-widget/src';
import { useWidgetStore } from '../store/widgetStore';
import { themes, ThemeId } from '../themes/themes';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const isAndroid = Platform.OS === 'android';

let unsubscribe: (() => void) | null = null;

/** Call this once in the app root (e.g. App.tsx / index.tsx useEffect). */
export function startNativeWidgetSync() {
  if (!isAndroid || isExpoGo) return;

  const syncToNative = async (state: ReturnType<typeof useWidgetStore.getState>) => {
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
        googleUser: state.googleUser,
      };

      const activeThemeConfig = themes[state.activeTheme] || themes.nos;
      
      const widgetsWithLayout = state.widgets.map((w) => {
        try {
          const layout = compileWidgetToLayout(w, state);
          return {
            ...w,
            layoutJSON: JSON.stringify(layout),
          };
        } catch (err) {
          console.warn('[NativeWidgetSync] Failed to compile widget layout:', w.templateId, err);
          return w;
        }
      });

      await ExpoWidget.saveWidgetsStore(
        JSON.stringify(widgetsWithLayout),
        JSON.stringify(activeThemeConfig),
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
