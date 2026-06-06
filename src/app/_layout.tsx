import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useWidgetStore } from '../store/widgetStore';
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
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

export default function RootLayout() {
  const { settings } = useWidgetStore();
  useEffect(() => {
    // Battery optimization simulated logging
    const intervalTime = settings.refreshInterval === 'realtime'
      ? 1000
      : settings.refreshInterval === '1min'
        ? 60000
        : settings.refreshInterval === '5min'
          ? 300000
          : 900000;

    console.log(`[NOS Refresh Engine] Starting batch cycle. Interval: ${settings.refreshInterval} (${intervalTime}ms)`);
    
    const refreshTimer = setInterval(() => {
      if (settings.autoRefresh) {
        console.log(`[NOS Refresh Engine] Batch update triggered for active widgets.`);
      }
    }, intervalTime);

    return () => clearInterval(refreshTimer);
  }, [settings.refreshInterval, settings.autoRefresh]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000000' } }}>
        <Stack.Screen name="index" />
      </Stack>
      
    </>
  );
}
