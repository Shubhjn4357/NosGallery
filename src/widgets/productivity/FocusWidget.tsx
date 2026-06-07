import { Pause, Play, RefreshCw, RotateCcw, Target } from 'lucide-react-native';

const LucideIcons = {
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Target,
};
import { WidgetCustomizations } from '../../store/widgetStore';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

interface FocusWidgetProps {
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
  interactive: boolean;
}

const TOTAL = 25 * 60;

export const FocusWidget: React.FC<FocusWidgetProps> = ({
  customizations,
  globalTheme,
  interactive,
}) => {
  const { accentColor } = useWidgetStyle(customizations, globalTheme);
  const title = customizations.titleText || 'FOCUS MODE';

  const [timeLeft, setTimeLeft] = useState(TOTAL);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Rotating ring animation
  const [spinAnim] = useState(() => new Animated.Value(0));
  const spinLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(p => {
          if (p <= 1) { clearInterval(intervalRef.current!); setIsActive(false); return TOTAL; }
          return p - 1;
        });
      }, 1000);
      spinLoop.current = Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 8000, useNativeDriver: true })
      );
      spinLoop.current.start();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      spinLoop.current?.stop();
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive, spinAnim]);

  const handleToggle = () => { if (!interactive) return; setIsActive(p => !p); };
  const handleReset = () => {
    if (!interactive) return;
    setIsActive(false);
    setTimeLeft(TOTAL);
    spinAnim.setValue(0);
  };

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');
  const progressPct = ((TOTAL - timeLeft) / TOTAL) * 100;

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const isLight = customizations.backgroundColor === '#ffffff';
  const textColor = isLight ? '#000' : '#fff';
  const dimColor = isLight ? '#888' : '#666';
  const trackBg = isLight ? '#efeff4' : '#1c1c1e';

  const SESSION_LABELS = ['DEEP WORK', 'SHORT BREAK', 'LONG BREAK'];
  const sessionIdx = Math.floor((TOTAL - timeLeft) / TOTAL * 3) % 3;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LucideIcons.Target size={10} color={accentColor} />
          <Text style={[styles.title, { color: dimColor }]}>{title}</Text>
        </View>
        {isActive && (
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <LucideIcons.RefreshCw size={10} color={accentColor} />
          </Animated.View>
        )}
      </View>

      {/* Timer display */}
      <View style={styles.timerBlock}>
        <Text style={[styles.timerText, { color: textColor }]}>
          {mins}
          <Text style={[styles.colonText, { color: isActive ? accentColor : dimColor }]}>:</Text>
          {secs}
        </Text>
        <Text style={[styles.sessionLabel, { color: dimColor }]}>
          {SESSION_LABELS[sessionIdx]}
        </Text>
      </View>

      {/* Arc progress bar */}
      <View style={[styles.arcBar, { backgroundColor: trackBg }]}>
        <View style={[styles.arcFill, { width: `${progressPct}%`, backgroundColor: accentColor }]} />
      </View>

      {/* Controls */}
      {interactive && (
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: isActive ? '#ff3b30' : accentColor }]}
            onPress={handleToggle}
          >
            {isActive
              ? <LucideIcons.Pause size={10} color="#000" />
              : <LucideIcons.Play size={10} color="#000" />
            }
            <Text style={styles.btnText}>{isActive ? 'Pause' : 'Start'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: isLight ? '#efeff4' : '#1c1c1e' }]}
            onPress={handleReset}
          >
            <LucideIcons.RotateCcw size={10} color={dimColor} />
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
  timerBlock: {
    alignItems: 'flex-start',
  },
  timerText: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -1,
  },
  colonText: {
    fontSize: 26,
    fontWeight: '900',
  },
  sessionLabel: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  arcBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  arcFill: {
    height: '100%',
    borderRadius: 2,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 5,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  btnText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '900',
  },
});
