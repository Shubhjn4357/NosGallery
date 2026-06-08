import { Wind } from 'lucide-react-native';
import { WidgetCustomizations } from '../../store/widgetStore';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

const LucideIcons = {
  Wind,
};

interface BreathingWidgetProps {
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
  interactive?: boolean;
}

const PHASES = [
  { label: 'INHALE', duration: 4000, scaleTarget: 1.5 },
  { label: 'HOLD', duration: 4000, scaleTarget: 1.5 },
  { label: 'EXHALE', duration: 6000, scaleTarget: 1.0 },
  { label: 'HOLD', duration: 2000, scaleTarget: 1.0 },
];

export const BreathingWidget: React.FC<BreathingWidgetProps> = ({
  customizations,
  globalTheme,
  interactive = false,
}) => {
  const { accentColor } = useWidgetStyle(customizations, globalTheme);
  const title = customizations.titleText || 'BREATH WORK';

  const [scaleAnim] = useState(() => new Animated.Value(1.0));
  const [opacityAnim] = useState(() => new Animated.Value(0.4));
  const phaseIdxRef = useRef(0);
  const phaseAnim = useRef<Animated.CompositeAnimation | null>(null);

  const [phaseLabel, setPhaseLabel] = React.useState('INHALE');

  useEffect(() => {
    if (!interactive) {
      const timeoutId = setTimeout(() => {
        setPhaseLabel((prev) => (prev !== 'INHALE' ? 'INHALE' : prev));
      }, 0);
      scaleAnim.setValue(1.0);
      opacityAnim.setValue(0.4);
      return () => clearTimeout(timeoutId);
    }
    const runPhase = (idx: number) => {
      const phase = PHASES[idx];
      setPhaseLabel(phase.label);
      phaseAnim.current = Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: phase.scaleTarget,
          duration: phase.duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: phase.scaleTarget > 1 ? 0.9 : 0.4,
          duration: phase.duration,
          useNativeDriver: true,
        }),
      ]);
      phaseAnim.current.start(({ finished }) => {
        if (finished) {
          phaseIdxRef.current = (idx + 1) % PHASES.length;
          runPhase(phaseIdxRef.current);
        }
      });
    };
    runPhase(0);
    return () => phaseAnim.current?.stop();
  }, [scaleAnim, opacityAnim, interactive]);

  const isLight = customizations.backgroundColor === '#ffffff';
  const dimColor = isLight ? '#888' : '#666';

  const PHASE_COLORS: Record<string, string> = {
    INHALE: accentColor,
    HOLD: '#ffcc00',
    EXHALE: '#007aff',
  };
  const phaseColor = PHASE_COLORS[phaseLabel] || accentColor;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LucideIcons.Wind size={10} color={accentColor} />
          <Text style={[styles.title, { color: dimColor }]}>{title}</Text>
        </View>
        <Text style={[styles.technique, { color: dimColor }]}>4-4-6-2</Text>
      </View>

      {/* Animated breathing orb */}
      <View style={styles.orbContainer}>
        {/* Outer glow ring */}
        <Animated.View
          style={[
            styles.outerRing,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
              borderColor: phaseColor,
            },
          ]}
        />
        {/* Inner orb */}
        <Animated.View
          style={[
            styles.innerOrb,
            {
              transform: [{ scale: scaleAnim }],
              backgroundColor: phaseColor + '33',
            },
          ]}
        />
        {/* Phase label centered */}
        <View style={styles.centerLabel}>
          <Text style={[styles.phaseLabel, { color: phaseColor }]}>{phaseLabel}</Text>
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
  technique: {
    fontSize: 7.5,
    fontWeight: '600',
  },
  orbContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  innerOrb: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
