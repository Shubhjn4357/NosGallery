import { Droplets } from 'lucide-react-native';

const LucideIcons = {
  Droplets,
};
import { WidgetCustomizations } from '../../store/widgetStore';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
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
  const { accentColor } = useWidgetStyle(customizations, globalTheme);

  const [cups, setCups] = useState(4);
  const [waveAnim] = useState(new Animated.Value(0));

  const GOAL = 8;
  const fillPct = (cups / GOAL) * 100;
  const title = customizations.titleText || 'HYDRATION';

  useEffect(() => {
    if (!interactive) {
      waveAnim.setValue(0);
      return;
    }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [waveAnim, interactive]);

  const waveTranslate = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-3, 3],
  });

  const logWater = () => {
    if (!interactive) return;
    setCups(prev => prev >= GOAL ? 0 : prev + 1);
  };

  const getHydrationLabel = (c: number) => {
    if (c === 0) return 'Not Started';
    if (c < 3) return 'Dehydrated';
    if (c < 6) return 'Getting There';
    if (c < 8) return 'Almost Done!';
    return 'Goal Reached!';
  };

  const isLight = customizations.backgroundColor === '#ffffff';
  const textColor = isLight ? '#000' : '#fff';
  const subtextColor = isLight ? '#666' : '#888';

  return (
    <TouchableOpacity
      activeOpacity={interactive ? 0.85 : 1}
      onPress={logWater}
      disabled={!interactive}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LucideIcons.Droplets size={10} color={accentColor} />
          <Text style={[styles.title, { color: subtextColor }]}>{title}</Text>
        </View>
        <Text style={[styles.cupsText, { color: textColor }]}>
          {cups}<Text style={{ fontSize: 9, color: subtextColor }}>/{GOAL}</Text>
        </Text>
      </View>

      {/* Fluid fill bar */}
      <View style={[styles.fluidTrack, { backgroundColor: isLight ? '#efeff4' : '#1a1a1f' }]}>
        <Animated.View
          style={[
            styles.fluidFill,
            {
              width: `${fillPct}%` as any,
              backgroundColor: accentColor,
              transform: [{ translateY: waveTranslate }],
            },
          ]}
        />
      </View>

      {/* Cup grid */}
      <View style={styles.cupsGrid}>
        {Array.from({ length: GOAL }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.cupDot,
              {
                backgroundColor: i < cups ? accentColor : (isLight ? '#d1d1d6' : '#2c2c2e'),
              },
            ]}
          />
        ))}
      </View>

      <Text style={[styles.status, { color: subtextColor }]}>
        {getHydrationLabel(cups).toUpperCase()}
      </Text>
    </TouchableOpacity>
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
  cupsText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  fluidTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 6,
  },
  fluidFill: {
    height: '100%',
    borderRadius: 4,
  },
  cupsGrid: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  cupDot: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  status: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: 2,
  },
});
