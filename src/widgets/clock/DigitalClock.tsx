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
  const { textStyle, subtextStyle, accentColor } = useWidgetStyle(customizations, globalTheme);

  const pad = (n: number) => n.toString().padStart(2, '0');
  
  // Custom offset time calculations based on clock type
  let displayTime = currentTime;
  let labelSuffix = '';

  if (customizations.titleText?.toLowerCase().includes('tokyo') || customizations.titleText?.toLowerCase().includes('japan')) {
    displayTime = new Date(currentTime.getTime() + (3.5 * 3600000));
    labelSuffix = 'TKY';
  } else if (customizations.titleText?.toLowerCase().includes('london') || customizations.titleText?.toLowerCase().includes('uk')) {
    displayTime = new Date(currentTime.getTime() - (4.5 * 3600000));
    labelSuffix = 'LDN';
  } else if (customizations.titleText?.toLowerCase().includes('new york') || customizations.titleText?.toLowerCase().includes('nyc') || customizations.titleText?.toLowerCase().includes('us')) {
    displayTime = new Date(currentTime.getTime() - (9.5 * 3600000));
    labelSuffix = 'NYC';
  } else if (customizations.titleText?.toLowerCase().includes('utc') || customizations.titleText?.toLowerCase().includes('gmt')) {
    displayTime = new Date(currentTime.getTime() - (5.5 * 3600000));
    labelSuffix = 'UTC';
  }

  const hours = pad(displayTime.getHours());
  const mins = pad(displayTime.getMinutes());
  
  const title = customizations.titleText || 'CLOCK';
  const isLight = customizations.backgroundColor === '#ffffff';

  // Clock categories
  const isMilitary = title.toLowerCase().includes('military') || title.toLowerCase().includes('24h');
  const formattedHours = isMilitary ? hours : ((displayTime.getHours() % 12 || 12).toString());
  
  const isLed = title.toLowerCase().includes('led') || title.toLowerCase().includes('retro');
  const isMatrix = title.toLowerCase().includes('matrix') || title.toLowerCase().includes('dot');
  
  // Standard radial tick clock frame (Image 4 Clock)
  const isStandardClock = !isLed && !isMatrix;

  if (isStandardClock) {
    const totalTicks = 36;
    const ticks = [];
    
    for (let i = 0; i < totalTicks; i++) {
      const angle = (i * 360) / totalTicks;
      ticks.push(
        <View
          key={i}
          style={[
            styles.tickMark,
            {
              transform: [
                { rotate: `${angle}deg` },
                { translateY: -27 }, // distance from center
              ],
              backgroundColor: isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.25)',
              // Bold major ticks (12, 3, 6, 9 o'clock)
              height: i % 9 === 0 ? 5 : 3,
              width: i % 9 === 0 ? 1.5 : 1,
            }
          ]}
        />
      );
    }

    return (
      <View style={styles.radialClockContainer}>
        {/* Dial ticks frame */}
        <View style={styles.ticksCircle}>
          {ticks}
        </View>

        {/* Central digital time */}
        <View style={styles.radialTimeWrapper}>
          <Text style={[styles.radialTimeText, textStyle, { color: isLight ? '#000000' : '#ffffff' }]}>
            {formattedHours}:{mins}
          </Text>
          {labelSuffix ? (
            <Text style={[styles.radialTimezone, subtextStyle]}>{labelSuffix}</Text>
          ) : null}
        </View>
      </View>
    );
  }

  // Fallback digital clock rendering (LED/Matrix/etc.)
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
      </View>
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
  
  // Radial Tick Frame Styles
  radialClockContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ticksCircle: {
    position: 'absolute',
    width: 66,
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickMark: {
    position: 'absolute',
    borderRadius: 0.5,
  },
  radialTimeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  radialTimeText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  radialTimezone: {
    fontSize: 7.5,
    fontWeight: 'bold',
    opacity: 0.6,
    marginTop: 1,
  },
});

