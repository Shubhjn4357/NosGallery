
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { ExpoWidget, compileWidgetToLayout } from '../../modules/expo-widget/src';
import { useWidgetStore } from '../store/widgetStore';
import { themes, ThemeId } from '../themes/themes';

/**
 * Detect if running inside Expo Go.
 * SDK 51+: Constants.appOwnership === 'expo' means Expo Go.
 */
function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

const isAndroid = Platform.OS === 'android';

let unsubscribe: (() => void) | null = null;
let syncStarted = false;

/** Call this once in the app root (e.g. _layout.tsx useEffect). */
export function startNativeWidgetSync() {
  // Don't run in Expo Go, non-Android, or if already started
  if (!isAndroid || isExpoGo() || syncStarted) return;
  syncStarted = true;

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

      const activeThemeConfig = themes[state.activeTheme as ThemeId] || themes.nos;

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
      // Non-fatal — widget will fall back to defaults on next update
      console.log('[NativeWidgetSync] saveWidgetsStore failed:', err);
    }
  };

  // Initial sync on mount
  const initialState = useWidgetStore.getState();
  syncToNative(initialState);

  // Subscribe to future store changes with a 500ms debounce
  let pendingTimeout: ReturnType<typeof setTimeout> | null = null;

  unsubscribe = useWidgetStore.subscribe((state) => {
    if (pendingTimeout) clearTimeout(pendingTimeout);
    pendingTimeout = setTimeout(() => {
      syncToNative(state);
      pendingTimeout = null;
    }, 500);
  });
}

/** Cleanup subscription (call on app unmount if needed). */
export function stopNativeWidgetSync() {
  unsubscribe?.();
  unsubscribe = null;
  syncStarted = false;
}
