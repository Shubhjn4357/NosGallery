import { RotateCcw } from 'lucide-react-native';

const LucideIcons = {
  RotateCcw,
};
import { WidgetCustomizations } from '../../store/widgetStore';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

interface StopwatchWidgetProps {
  swTime: number;
  swActive: boolean;
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
  interactive: boolean;
  handleStopwatch: () => void;
  handleStopwatchReset: () => void;
}

export const StopwatchWidget: React.FC<StopwatchWidgetProps> = ({
  swTime,
  swActive,
  customizations,
  globalTheme,
  interactive,
  handleStopwatch,
  handleStopwatchReset,
}) => {
  const { subtextStyle } = useWidgetStyle(customizations, globalTheme);

  const swSec = Math.floor(swTime / 10);
  const displaySec = swSec % 60;
  
  // Choose standard orange/espresso accent if none provided
  const timerAccent = customizations.accentColor || '#ff9500';
  const isLight = customizations.backgroundColor === '#ffffff';

  // Calculate ticks
  const maxTicks = 24;
  // Make ticks fill up to 20 or loop
  const filledTicks = Math.min(maxTicks, Math.round((swSec % 30) / 30 * maxTicks));

  return (
    <View style={styles.container}>
      {/* Top Progress Ticks */}
      <View style={styles.ticksWrapper}>
        <View style={styles.ticksNumbersRow}>
          <Text style={[styles.tickNum, subtextStyle]}>10</Text>
          <Text style={[styles.tickNum, subtextStyle, { marginRight: 20 }]}>20</Text>
        </View>
        <View style={styles.ticksRow}>
          {Array.from({ length: maxTicks }).map((_, idx) => {
            const isFilled = idx < filledTicks;
            return (
              <View
                key={idx}
                style={[
                  styles.tickBar,
                  {
                    backgroundColor: isFilled 
                      ? timerAccent 
                      : (isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)'),
                    height: idx % 6 === 0 ? 10 : 6,
                  }
                ]}
              />
            );
          })}
        </View>
      </View>

      {/* Main Control Panel */}
      <View style={styles.controlsRow}>
        {/* Name Label */}
        <View>
          <Text style={[styles.timerTitle, { color: timerAccent }]}>
            {customizations.titleText || 'Espresso'}
          </Text>
          <Text style={[styles.timerSubText, subtextStyle]}>Brewing</Text>
        </View>

        {/* Play/Stop Center Trigger Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={!interactive}
            onPress={handleStopwatch}
            style={[styles.playStopBtn, { borderColor: timerAccent }]}
          >
            {swActive ? (
              <View style={[styles.stopSquare, { backgroundColor: timerAccent }]} />
            ) : (
              <View style={[styles.playTriangle, { borderLeftColor: timerAccent }]} />
            )}
          </TouchableOpacity>

          {/* Quick Double-tap Reset Area */}
          {swTime > 0 && !swActive && (
            <TouchableOpacity 
              activeOpacity={0.7} 
              onPress={handleStopwatchReset}
              style={styles.resetBadge}
            >
              <LucideIcons.RotateCcw size={10} color={timerAccent} />
            </TouchableOpacity>
          )}
        </View>

        {/* Elapsed Timer Counter */}
        <View style={styles.timeWrapper}>
          <Text style={[styles.timeText, { color: isLight ? '#000000' : '#ffffff' }]}>
            {displaySec}
            <Text style={[styles.timeUnit, { color: timerAccent }]}>s</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  ticksWrapper: {
    width: '100%',
  },
  ticksNumbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingLeft: 30,
    marginBottom: 2,
  },
  tickNum: {
    fontSize: 7.5,
    fontWeight: 'bold',
    opacity: 0.5,
  },
  ticksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 12,
    paddingHorizontal: 4,
  },
  tickBar: {
    width: 2.5,
    borderRadius: 1,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  timerTitle: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  timerSubText: {
    fontSize: 7.5,
    fontWeight: 'bold',
    opacity: 0.6,
    marginTop: 1,
  },
  buttonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playStopBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopSquare: {
    width: 10,
    height: 10,
    borderRadius: 1.5,
  },
  playTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 2.5,
  },
  resetBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: 'rgba(120, 120, 120, 0.08)',
    borderRadius: 6,
    padding: 2,
  },
  timeWrapper: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  timeUnit: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

