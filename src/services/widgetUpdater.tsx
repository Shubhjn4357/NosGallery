import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { NOSWidgetComponent } from '../components/NOSWidgetComponent';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const isAndroid = Platform.OS === 'android';

export const syncOSWidget = async (passedWidgets?: any[], passedTheme?: string) => {
  if (!isAndroid || isExpoGo) {
    return;
  }

  try {
    const widgetNames = [
      'NOSClockWidget',
      'NOSCalendarWidget',
      'NOSWeatherWidget',
      'NOSProductivityWidget',
      'NOSHealthWidget',
      'NOSFinanceWidget',
      'NOSDeveloperWidget',
      'NOSSocialWidget',
      'NOSSmartHomeWidget',
      'NOSAiWidget'
    ];

    for (const name of widgetNames) {
      await requestWidgetUpdate({
        widgetName: name,
        renderWidget: async () => {
          let widgets = passedWidgets || [];
          let activeTheme = passedTheme || 'nos';
          if (!passedWidgets) {
            try {
              const storageData = await AsyncStorage.getItem('nos-gallery-widget-storage');
              if (storageData) {
                const parsed = JSON.parse(storageData);
                if (parsed.state) {
                  widgets = parsed.state.widgets || [];
                  activeTheme = parsed.state.activeTheme || 'nos';
                }
              }
            } catch (err) {
              console.log('[Widget Updater] Storage read error:', err);
            }
          }
          return <NOSWidgetComponent widgets={widgets} activeTheme={activeTheme} widgetName={name} />;
        }
      });
    }
  } catch (err) {
    console.log('[Widget Updater] Sync failed:', err);
  }
};
