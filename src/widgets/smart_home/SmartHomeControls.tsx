import { WidgetCustomizations } from '../../store/widgetStore';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

interface SmartHomeControlsProps {
  lightOn: boolean;
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
  interactive: boolean;
  toggleLight: () => void;
}

export const SmartHomeControls: React.FC<SmartHomeControlsProps> = ({
  lightOn,
  customizations,
  globalTheme,
  interactive,
  toggleLight,
}) => {
  const { textStyle, subtextStyle, accentColor } = useWidgetStyle(customizations, globalTheme);

  const title = customizations.titleText || 'SMART BULB';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, subtextStyle]}>{title}</Text>
        <LucideIcons.Home size={12} color={lightOn ? accentColor : '#555'} />
      </View>
      <Text style={[styles.value, textStyle]}>
        LIGHTS: {lightOn ? 'ON' : 'OFF'}
      </Text>
      {interactive && (
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: lightOn ? accentColor : '#333' }]}
          onPress={toggleLight}
        >
          <Text style={[styles.btnText, { color: lightOn ? '#000000' : '#ffffff' }]}>Toggle Bulb</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
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
  btn: {
    paddingVertical: 3,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  btnText: {
    fontSize: 8.5,
    fontWeight: 'bold',
  },
});
