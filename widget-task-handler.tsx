import React from 'react';
import { WidgetTaskHandlerProps } from 'react-native-android-widget';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NOSWidgetComponent } from './src/components/NOSWidgetComponent';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  let widgets: any[] = [];
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
    console.log('[Widget Task Handler] Error reading widgets:', err);
  }

  props.renderWidget(
    <NOSWidgetComponent
      widgets={widgets}
      activeTheme={activeTheme}
      widgetName={props.widgetInfo.widgetName}
    />
  );
}
