import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { NOSWidgetComponent } from '../components/NOSWidgetComponent';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const isAndroid = Platform.OS === 'android';

export const syncOSWidget = async () => {
  if (!isAndroid || isExpoGo) {
    return;
  }

  try {

    await requestWidgetUpdate({
      widgetName: 'NOSGalleryWidget',
      renderWidget: async () => {
        let widgets = [];
        let activeTheme = 'nos';
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
        return <NOSWidgetComponent widgets={widgets} activeTheme={activeTheme} />;
      }
    });
  } catch (err) {
    console.log('[Widget Updater] Sync failed:', err);
  }
};
