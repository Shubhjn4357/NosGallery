import { Droplets, Plus, Target } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';
import { useWidgetStore } from '../../store/widgetStore';
import { useFeedback } from '../../hooks/useFeedback';

const LucideIcons = {
  Droplets,
  Plus,
  Target,
};

interface WaterWidgetProps {
  globalTheme: ThemeId;
  interactive: boolean;
  customizations?: any;
}

const TARGETS = [1500, 2000, 2500, 3000];

export const WaterWidget: React.FC<WaterWidgetProps> = ({
  globalTheme,
  interactive,
}) => {
  const { waterIntake, waterGoal, setWaterIntake, setWaterGoal, incrementWaterIntake } = useWidgetStore();
  const { triggerHaptic } = useFeedback();
  const { accentColor, textStyle, subtextStyle } = useWidgetStyle({}, globalTheme);

  const [waveAnim] = useState(new Animated.Value(0));

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

  const handleLogWater = () => {
    if (!interactive) return;
    triggerHaptic('light');
    incrementWaterIntake(250);
  };

  const handleCycleTarget = () => {
    if (!interactive) return;
    triggerHaptic('selection');
    const curIdx = TARGETS.indexOf(waterGoal);
    const nextIdx = (curIdx + 1) % TARGETS.length;
    setWaterGoal(TARGETS[nextIdx]);
  };

  const handleReset = () => {
    if (!interactive) return;
    triggerHaptic('medium');
    setWaterIntake(0);
  };

  const fillPct = Math.min(100, (waterIntake / waterGoal) * 100);
  const isLight = textStyle.color === '#000000';
  const controlBg = isLight ? '#e5e5ea' : '#1c1c1e';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LucideIcons.Droplets size={10} color={accentColor} />
          <Text style={[styles.title, subtextStyle]}>HYDRATION</Text>
        </View>
        <Text style={[styles.cupsText, textStyle]}>
          {waterIntake}
          <Text style={{ fontSize: 9, color: subtextStyle.color }}>/{waterGoal}ml</Text>
        </Text>
      </View>

      {/* Fluid progress bar */}
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

      {/* Interactive controls */}
      {interactive && (
        <View style={styles.controlsRow}>
          <TouchableOpacity
            onPress={handleLogWater}
            style={[styles.btn, { backgroundColor: accentColor }]}
            activeOpacity={0.8}
          >
            <LucideIcons.Plus size={10} color="#000000" />
            <Text style={styles.btnLabel}>+250ML</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCycleTarget}
            style={[styles.iconBtn, { backgroundColor: controlBg }]}
            activeOpacity={0.8}
          >
            <LucideIcons.Target size={10} color={textStyle.color} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleReset}
            style={[styles.iconBtn, { backgroundColor: controlBg }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.resetText, textStyle]}>C</Text>
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
    paddingVertical: 2,
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
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  fluidTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 6,
  },
  fluidFill: {
    height: '100%',
    borderRadius: 5,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  btn: {
    flex: 1.5,
    height: 22,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  btnLabel: {
    color: '#000000',
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  iconBtn: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: {
    fontSize: 8.5,
    fontWeight: 'bold',
  },
});
