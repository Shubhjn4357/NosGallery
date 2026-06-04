import { WidgetCustomizations } from '../../store/widgetStore';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

interface BreathingWidgetProps {
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
  interactive?: boolean;
}

export const BreathingWidget: React.FC<BreathingWidgetProps> = ({
  customizations,
  globalTheme,
  interactive = false,
}) => {
  const { textStyle, accentColor } = useWidgetStyle(customizations, globalTheme);

  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathScale, setBreathScale] = useState(1.0);
  const [breathCounter, setBreathCounter] = useState(4);

  useEffect(() => {
    if (!interactive) {
      setBreathScale(1.0);
      setBreathPhase('inhale');
      setBreathCounter(4);
      return;
    }
    const timer = setInterval(() => {
      setBreathCounter((prev) => {
        if (prev <= 1) {
          // Advance phase using functional update to avoid stale closure
          setBreathPhase((curr) => {
            if (curr === 'inhale') {
              setBreathScale(1.35);
              return 'hold';
            }
            if (curr === 'hold') {
              setBreathScale(0.85);
              return 'exhale';
            }
            setBreathScale(1.0);
            return 'inhale';
          });
          return 4;
        }
        // Nudge scale using functional update (no stale read needed)
        setBreathPhase((curr) => {
          setBreathScale((scale) => {
            if (curr === 'inhale') return Math.min(1.35, scale + 0.08);
            if (curr === 'exhale') return Math.max(0.85, scale - 0.04);
            return scale;
          });
          return curr;
        });
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [interactive]); // Only re-create when interactive changes, not on every phase tick

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.circle,
          {
            transform: [{ scale: breathScale }],
            backgroundColor: `${accentColor}18`,
            borderColor: accentColor,
          },
        ]}
      >
        <Text style={[styles.phase, textStyle, { color: accentColor }]}>
          {breathPhase.toUpperCase()}
        </Text>
        <Text style={[styles.timer, textStyle]}>{breathCounter}s</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phase: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  timer: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 1,
  },
});
