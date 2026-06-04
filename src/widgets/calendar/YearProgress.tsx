import { WidgetCustomizations } from '../../store/widgetStore';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

interface YearProgressProps {
  currentTime: Date;
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
}

export const YearProgress: React.FC<YearProgressProps> = ({
  currentTime,
  customizations,
  globalTheme,
}) => {
  const { textStyle, subtextStyle, accentColor } = useWidgetStyle(customizations, globalTheme);

  const start = new Date(currentTime.getFullYear(), 0, 1);
  const end = new Date(currentTime.getFullYear() + 1, 0, 1);
  const done = (currentTime.getTime() - start.getTime()) / (end.getTime() - start.getTime());
  const pct = (done * 100).toFixed(6);

  const title = customizations.titleText || 'YEAR PROGRESS';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, subtextStyle]}>{title}</Text>
        <Text style={[styles.year, textStyle, { color: accentColor }]}>{currentTime.getFullYear()}</Text>
      </View>
      <Text style={[styles.pct, textStyle]}>{pct}%</Text>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${done * 100}%`, backgroundColor: accentColor }]} />
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
    fontSize: 8.5,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  year: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  pct: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  progressBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    width: '100%',
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
