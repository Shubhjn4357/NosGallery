import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useWidgetStore } from '../store/widgetStore';
import { AnimatedSplashScreen } from '../components/AnimatedSplashScreen';

export default function RootLayout() {
  const { settings } = useWidgetStore();
  const [isSplashVisible, setIsSplashVisible] = useState(true);

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
      {isSplashVisible && (
        <AnimatedSplashScreen onAnimationEnd={() => setIsSplashVisible(false)} />
      )}
    </>
  );
}
