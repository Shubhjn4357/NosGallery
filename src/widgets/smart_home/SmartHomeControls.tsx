// @widget smart_home_controls
import { Home, Lightbulb } from 'lucide-react-native';
import { WidgetCustomizations } from '../../store/widgetStore';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { View, Text, TouchableOpacity, Animated } from '../../../modules/expo-widget/src';

import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

const LucideIcons = {
  Home,
  Lightbulb,
};

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
  const { accentColor } = useWidgetStyle(customizations, globalTheme);
  const title = customizations.titleText || 'SMART ROOM';

  const [glowAnim] = useState(() => new Animated.Value(lightOn ? 1 : 0));
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    Animated.timing(glowAnim, {
      toValue: lightOn ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();

    let loopAnim: Animated.CompositeAnimation | null = null;
    if (lightOn && interactive) {
      loopAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 1200, useNativeDriver: true }),
        ])
      );
      loopAnim.start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1.0);
    }

    return () => {
      if (loopAnim) loopAnim.stop();
    };
  }, [lightOn, glowAnim, pulseAnim, interactive]);

  const isLight = customizations.backgroundColor === '#ffffff';
  const textColor = isLight ? '#000' : '#fff';
  const dimColor = isLight ? '#888' : '#666';

  const DEVICES = [
    { label: 'Main Light', icon: 'Lamp', on: lightOn },
    { label: 'AC Unit', icon: 'Wind', on: false },
    { label: 'Smart Plug', icon: 'Plug', on: true },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LucideIcons.Home size={10} color={accentColor} />
          <Text style={[styles.title, { color: dimColor }]}>{title}</Text>
        </View>
        <Animated.View style={[styles.statusBadge, {
          opacity: glowAnim,
          backgroundColor: `${accentColor}22`,
        }]}>
          <Text style={[styles.statusText, { color: accentColor }]}>
            {lightOn ? 'ACTIVE' : 'STANDBY'}
          </Text>
        </Animated.View>
      </View>

      {/* Central glow bulb */}
      <View style={styles.bulbCenter}>
        <Animated.View
          style={[
            styles.glowHalo,
            {
              opacity: glowAnim,
              transform: [{ scale: pulseAnim }],
              backgroundColor: `${accentColor}1a`,
            },
          ]}
        />
        <TouchableOpacity
          onPress={toggleLight}
          disabled={!interactive}
          style={[styles.bulbBtn, { backgroundColor: lightOn ? accentColor : (isLight ? '#d1d1d6' : '#2c2c2e') }]}
        >
          <LucideIcons.Lightbulb size={16} color={lightOn ? '#000' : dimColor} />
        </TouchableOpacity>
      </View>

      {/* Device mini-list */}
      <View style={styles.deviceList}>
        {DEVICES.map((d, i) => (
          <View key={i} style={styles.deviceRow}>
            <View style={[styles.deviceDot, { backgroundColor: d.on ? accentColor : (isLight ? '#d1d1d6' : '#333') }]} />
            <Text style={[styles.deviceLabel, { color: textColor, opacity: d.on ? 1 : 0.45 }]} numberOfLines={1}>
              {d.label}
            </Text>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },
  bulbCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  glowHalo: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  bulbBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceList: {
    gap: 4,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deviceDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  deviceLabel: {
    fontSize: 8.5,
    fontWeight: '600',
  },
});
