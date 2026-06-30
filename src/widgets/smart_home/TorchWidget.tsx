// @widget smart_home_torch
import { Zap, ZapOff } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';

import { View, Text, TouchableOpacity, Animated } from '../../../modules/expo-widget/src';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';
import { useWidgetStore } from '../../store/widgetStore';
import { useFeedback } from '../../hooks/useFeedback';

const LucideIcons = {
  Zap,
  ZapOff,
};

interface TorchWidgetProps {
  globalTheme: ThemeId;
  interactive: boolean;
}

export const TorchWidget: React.FC<TorchWidgetProps> = ({
  globalTheme,
  interactive,
}) => {
  const { torchEnabled, setTorchEnabled } = useWidgetStore();
  const { triggerHaptic } = useFeedback();
  const { accentColor, textStyle, subtextStyle } = useWidgetStyle({}, globalTheme);

  const [glowAnim] = React.useState(() => new Animated.Value(torchEnabled ? 1 : 0));

  useEffect(() => {
    Animated.timing(glowAnim, {
      toValue: torchEnabled ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [torchEnabled, glowAnim]);

  const toggleTorch = () => {
    if (!interactive) return;
    triggerHaptic('light');
    setTorchEnabled(!torchEnabled);
  };

  const isLight = textStyle.color === '#000000';
  const buttonBg = torchEnabled
    ? accentColor
    : isLight
    ? '#d1d1d6'
    : '#2c2c2e';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, subtextStyle]}>TORCH</Text>
        <Animated.View
          style={[
            styles.statusBadge,
            {
              opacity: glowAnim,
              backgroundColor: `${accentColor}22`,
            },
          ]}
        >
          <Text style={[styles.statusText, { color: accentColor }]}>ACTIVE</Text>
        </Animated.View>
      </View>

      <View style={styles.center}>
        <Animated.View
          style={[
            styles.glowHalo,
            {
              opacity: glowAnim,
              backgroundColor: `${accentColor}1a`,
              transform: [
                {
                  scale: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.25],
                  }),
                },
              ],
            },
          ]}
        />
        <TouchableOpacity
          onPress={toggleTorch}
          disabled={!interactive}
          style={[styles.btn, { backgroundColor: buttonBg }]}
          activeOpacity={0.8}
        >
          {torchEnabled ? (
            <LucideIcons.Zap size={18} color="#000000" />
          ) : (
            <LucideIcons.ZapOff size={18} color={subtextStyle.color} />
          )}
        </TouchableOpacity>
      </View>

      <Text style={[styles.footer, subtextStyle]}>
        {torchEnabled ? 'FLASHLIGHT ON' : 'FLASHLIGHT OFF'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
  },
  glowHalo: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  footer: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
});
