import { WidgetCustomizations } from '../../store/widgetStore';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

interface DigitalClockProps {
  currentTime: Date;
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
}

export const DigitalClock: React.FC<DigitalClockProps> = ({
  currentTime,
  customizations,
  globalTheme,
}) => {
  const { textStyle, subtextStyle, accentColor, themeConfig } = useWidgetStyle(customizations, globalTheme);

  const pad = (n: number) => n.toString().padStart(2, '0');
  
  // Custom offset time calculations based on clock type
  let displayTime = currentTime;
  let labelSuffix = '';

  const templateId = customizations.themeOverride || '';

  if (customizations.titleText?.toLowerCase().includes('tokyo') || customizations.titleText?.toLowerCase().includes('japan')) {
    // GMT+9 (assume standard local is GMT+5:30)
    displayTime = new Date(currentTime.getTime() + (3.5 * 3600000));
    labelSuffix = 'TKY (JST)';
  } else if (customizations.titleText?.toLowerCase().includes('london') || customizations.titleText?.toLowerCase().includes('uk')) {
    // GMT+1
    displayTime = new Date(currentTime.getTime() - (4.5 * 3600000));
    labelSuffix = 'LDN (BST)';
  } else if (customizations.titleText?.toLowerCase().includes('new york') || customizations.titleText?.toLowerCase().includes('nyc') || customizations.titleText?.toLowerCase().includes('us')) {
    // GMT-4
    displayTime = new Date(currentTime.getTime() - (9.5 * 3600000));
    labelSuffix = 'NYC (EDT)';
  } else if (customizations.titleText?.toLowerCase().includes('utc') || customizations.titleText?.toLowerCase().includes('gmt')) {
    // GMT
    displayTime = new Date(currentTime.getTime() - (5.5 * 3600000));
    labelSuffix = 'UTC';
  }

  const hours = pad(displayTime.getHours());
  const mins = pad(displayTime.getMinutes());
  const secs = pad(displayTime.getSeconds());
  
  const title = customizations.titleText || 'DIGITAL CLOCK';

  // Customize formatting based on clock categories
  const isMilitary = title.toLowerCase().includes('military') || title.toLowerCase().includes('24h');
  const formattedHours = isMilitary ? hours : ((displayTime.getHours() % 12 || 12).toString().padStart(2, '0'));
  const amPm = displayTime.getHours() >= 12 ? 'PM' : 'AM';

  // LED typography styling helper
  const isLed = title.toLowerCase().includes('led') || title.toLowerCase().includes('retro');
  const isMatrix = title.toLowerCase().includes('matrix') || title.toLowerCase().includes('dot');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, subtextStyle, { fontSize: 8 }]}>{title}</Text>
        {labelSuffix ? <Text style={[styles.timezone, textStyle, { color: accentColor, fontSize: 8 }]}>{labelSuffix}</Text> : null}
      </View>
      
      <View style={styles.timeRow}>
        <Text 
          style={[
            styles.timeLabel, 
            textStyle, 
            { fontSize: customizations.fontSize || 32 },
            isLed && { fontFamily: 'monospace', letterSpacing: -1 },
            isMatrix && { letterSpacing: 2, color: accentColor }
          ]}
        >
          {formattedHours}:{mins}
        </Text>
        {!isMilitary && (
          <Text style={[styles.amPmLabel, textStyle, { color: accentColor }]}>{amPm}</Text>
        )}
      </View>
      
      {isMatrix && (
        <Text style={[styles.secsLabel, textStyle, { color: accentColor }]}>{secs}s</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  timezone: {
    fontWeight: 'bold',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  timeLabel: {
    fontWeight: '900',
  },
  amPmLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },
  secsLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 2,
    letterSpacing: 1,
  },
});
