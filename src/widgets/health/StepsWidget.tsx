import { WidgetCustomizations } from '../../store/widgetStore';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

interface StepsWidgetProps {
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
}

export const StepsWidget: React.FC<StepsWidgetProps> = ({
  customizations,
  globalTheme,
}) => {
  const { textStyle, subtextStyle, accentColor } = useWidgetStyle(customizations, globalTheme);

  const title = customizations.titleText || 'FITNESS';
  const lowercaseTitle = title.toLowerCase();

  const getStats = () => {
    if (lowercaseTitle.includes('cal') || lowercaseTitle.includes('burn')) {
      return { val: '482 kcal', sub: '68% of daily target' };
    }
    if (lowercaseTitle.includes('sleep') || lowercaseTitle.includes('rest')) {
      return { val: '7h 42m', sub: '92% sleep quality score' };
    }
    if (lowercaseTitle.includes('water') || lowercaseTitle.includes('hydration')) {
      return { val: '5 / 8 cups', sub: '62% completed' };
    }
    if (lowercaseTitle.includes('mood') || lowercaseTitle.includes('stress')) {
      return { val: 'Calm (38)', sub: 'ECG heart rate normal' };
    }
    // Default steps
    return { val: '8,432 steps', sub: '84% of steps goal' };
  };

  const stats = getStats();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, subtextStyle]}>{title}</Text>
      <Text style={[styles.value, textStyle]}>{stats.val}</Text>
      <Text style={[styles.desc, subtextStyle, { color: accentColor }]}>{stats.sub}</Text>
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  desc: {
    fontSize: 9.5,
  },
});
