import { WidgetCustomizations } from '../../store/widgetStore';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

interface CpuMonitorProps {
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
  interactive?: boolean;
}

export const CpuMonitor: React.FC<CpuMonitorProps> = ({
  customizations,
  globalTheme,
  interactive = false,
}) => {
  const { textStyle, subtextStyle, accentColor } = useWidgetStyle(customizations, globalTheme);

  const title = customizations.titleText || 'CPU MONITOR';
  const lowercaseTitle = title.toLowerCase();

  const [usage, setUsage] = React.useState(() => {
    if (customizations.valueText) {
      const parsed = parseInt(customizations.valueText.replace(/[^0-9]/g, ''), 10);
      return isNaN(parsed) ? 12 : Math.min(100, Math.max(0, parsed));
    }
    return 12;
  });

  React.useEffect(() => {
    if (!interactive) return;
    const ticker = setInterval(() => {
      setUsage(prev => {
        const delta = Math.floor(Math.random() * 9) - 4; // -4 to +4
        return Math.min(99, Math.max(2, prev + delta));
      });
    }, 2000);
    return () => clearInterval(ticker);
  }, [interactive]);

  const label = lowercaseTitle.includes('ram') || lowercaseTitle.includes('memory') ? 'RAM' : 
                lowercaseTitle.includes('disk') || lowercaseTitle.includes('storage') ? 'DISK' : 'CPU';

  return (
    <View style={styles.container}>
      <Text style={[styles.title, subtextStyle]}>{title}</Text>
      <Text style={[styles.value, textStyle]}>{label} USAGE: {usage}%</Text>
      <View style={styles.barOutline}>
        <View style={[styles.barFill, { width: `${usage}%`, backgroundColor: accentColor }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 8.5,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  barOutline: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    width: '100%',
    marginTop: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
});
