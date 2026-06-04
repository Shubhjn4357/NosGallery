import { WidgetCustomizations } from '../../store/widgetStore';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
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
  const { textStyle, subtextStyle, accentColor } = useWidgetStyle(customizations, globalTheme);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const swSec = Math.floor(swTime / 10) % 60;
  const swMin = Math.floor(swTime / 600);
  const swDs = swTime % 10;

  const title = customizations.titleText || 'STOPWATCH';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, subtextStyle]}>{title}</Text>
        <LucideIcons.Timer size={12} color={accentColor} />
      </View>
      <Text style={[styles.timeText, textStyle]}>
        {pad(swMin)}:{pad(swSec)}.{swDs}
      </Text>
      {interactive && (
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: swActive ? '#ff3b30' : '#34c759' }]}
            onPress={handleStopwatch}
          >
            <Text style={styles.btnText}>{swActive ? 'Pause' : 'Start'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#555' }]} onPress={handleStopwatchReset}>
            <Text style={styles.btnText}>Reset</Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 8.5,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  timeText: {
    fontSize: 28,
    fontWeight: '900',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 4,
  },
  btn: {
    flex: 1,
    paddingVertical: 3,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 8.5,
    fontWeight: 'bold',
  },
});
