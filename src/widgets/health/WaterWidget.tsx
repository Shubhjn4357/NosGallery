import { WidgetCustomizations } from '../../store/widgetStore';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

interface WaterWidgetProps {
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
  interactive: boolean;
}

export const WaterWidget: React.FC<WaterWidgetProps> = ({
  customizations,
  globalTheme,
  interactive,
}) => {
  const { textStyle, subtextStyle, accentColor } = useWidgetStyle(customizations, globalTheme);

  const [waterCups, setWaterCups] = useState(() => {
    if (customizations.valueText) {
      const parsed = parseInt(customizations.valueText.split('/')[0].replace(/[^0-9]/g, ''), 10);
      return isNaN(parsed) ? 4 : Math.min(8, Math.max(0, parsed));
    }
    return 4;
  });
  const title = customizations.titleText || 'HYDRATION';

  const logWater = () => {
    if (!interactive) return;
    setWaterCups(prev => (prev >= 8 ? 0 : prev + 1));
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, subtextStyle]}>{title}</Text>
      <Text style={[styles.value, textStyle]}>{waterCups} / 8 Cups</Text>
      <View style={styles.cupsRow}>
        {Array.from({ length: 8 }).map((_, i) => (
          <TouchableOpacity
            key={i}
            disabled={!interactive}
            onPress={logWater}
            style={[
              styles.cup,
              {
                borderColor: accentColor,
                backgroundColor: i < waterCups ? accentColor : 'transparent',
              },
            ]}
          />
        ))}
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  cupsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  cup: {
    width: 10,
    height: 16,
    borderWidth: 1,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
});
