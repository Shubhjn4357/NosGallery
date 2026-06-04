import { WidgetCustomizations } from '../../store/widgetStore';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

interface FlipClockProps {
  currentTime: Date;
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
}

export const FlipClock: React.FC<FlipClockProps> = ({
  currentTime,
  customizations,
  globalTheme,
}) => {
  const { textStyle, subtextStyle, themeConfig } = useWidgetStyle(customizations, globalTheme);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const hours = pad(currentTime.getHours());
  const mins = pad(currentTime.getMinutes());

  const title = customizations.titleText || 'FLIP CLOCK';
  const cardBg = themeConfig.textColor === '#ffffff' ? '#222222' : '#e5e5ea';
  const cardColor = themeConfig.textColor === '#ffffff' ? '#ffffff' : '#000000';

  return (
    <View style={styles.container}>
      <Text style={[styles.title, subtextStyle]}>{title}</Text>
      <View style={styles.flipRow}>
        <View style={[styles.flipCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.flipText, textStyle, { color: cardColor }]}>{hours}</Text>
          <View style={styles.flipDivider} />
        </View>
        <Text style={[styles.flipSeparator, textStyle]}>:</Text>
        <View style={[styles.flipCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.flipText, textStyle, { color: cardColor }]}>{mins}</Text>
          <View style={styles.flipDivider} />
        </View>
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
  flipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: 4,
  },
  flipCard: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 32,
    alignItems: 'center',
    position: 'relative',
  },
  flipText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  flipDivider: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    top: '50%',
  },
  flipSeparator: {
    fontSize: 18,
    marginHorizontal: 4,
  },
});
