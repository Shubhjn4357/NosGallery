import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useWidgetStore } from '../store/widgetStore';

// Suppress framework-level/React 19 development warnings
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  const msg = args[0];
  if (typeof msg === 'string') {
    if (
      msg.includes('useNativeDriver') ||
      msg.includes('pointerEvents') ||
      msg.includes('shadow*') ||
      msg.includes("Can't perform a React state update")
    ) {
      return;
    }
  }
  originalWarn(...args);
};

const originalError = console.error;
console.error = (...args: any[]) => {
  const msg = args[0];
  if (typeof msg === 'string') {
    if (
      msg.includes("Can't perform a React state update")
    ) {
      return;
    }
  }
  originalError(...args);
};

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

    const refreshTimer = setInterval(() => {
      if (settings.autoRefresh) {
        // Refresh cycle trigger
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
