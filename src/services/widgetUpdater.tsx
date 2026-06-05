import React from 'react';
import { requestWidgetUpdate } from 'react-native-android-widget';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NOSWidgetComponent } from '../components/NOSWidgetComponent';

export const syncOSWidget = async () => {
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
