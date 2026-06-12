import { Hourglass, Play, Pause, RotateCcw } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';
import { useFeedback } from '../../hooks/useFeedback';

const LucideIcons = {
  Hourglass,
  Play,
  Pause,
  RotateCcw,
};

interface PomodoroWidgetProps {
  globalTheme: ThemeId;
  interactive: boolean;
}

export const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({
  globalTheme,
  interactive,
}) => {
  const { accentColor, textStyle, subtextStyle } = useWidgetStyle({}, globalTheme);
  const { triggerHaptic, triggerSound } = useFeedback();

  // Mode: 'focus' (25m) | 'break' (5m)
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || !interactive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          triggerHaptic('heavy');
          triggerSound('success');
          // Toggle mode
          if (mode === 'focus') {
            setMode('break');
            return 5 * 60;
          } else {
            setMode('focus');
            return 25 * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running, mode, interactive]);

  const handleStartPause = () => {
    if (!interactive) return;
    triggerHaptic('light');
    setRunning(!running);
  };

  const handleReset = () => {
    if (!interactive) return;
    triggerHaptic('medium');
    setRunning(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isLight = textStyle.color === '#000000';
  const controlBg = isLight ? '#e5e5ea' : '#1c1c1e';
  const progressPct = (timeLeft / (mode === 'focus' ? 25 * 60 : 5 * 60)) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LucideIcons.Hourglass size={11} color={accentColor} />
          <Text style={[styles.title, subtextStyle]}>POMODORO</Text>
        </View>
        <Text style={[styles.modeTxt, { color: accentColor }]}>
          {mode.toUpperCase()} SESSION
        </Text>
      </View>

      <View style={styles.timerCenter}>
        <Text style={[styles.timerTxt, textStyle]}>{formatTime(timeLeft)}</Text>
        <View style={[styles.progressTrack, { backgroundColor: isLight ? '#efeff4' : '#1c1c1e' }]}>
          <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: accentColor }]} />
        </View>
      </View>

      {interactive && (
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={handleStartPause}
            style={[styles.btn, { backgroundColor: accentColor }]}
            activeOpacity={0.8}
          >
            {running ? (
              <LucideIcons.Pause size={10} color="#000000" />
            ) : (
              <LucideIcons.Play size={10} color="#000000" />
            )}
            <Text style={styles.btnLabel}>{running ? 'PAUSE' : 'START'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleReset}
            style={[styles.resetBtn, { backgroundColor: controlBg }]}
            activeOpacity={0.8}
          >
            <LucideIcons.RotateCcw size={10} color={textStyle.color} />
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
  modeTxt: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  timerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginVertical: 4,
  },
  timerTxt: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  progressTrack: {
    height: 3,
    width: '80%',
    borderRadius: 1.5,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  controls: {
    flexDirection: 'row',
    gap: 6,
  },
  btn: {
    flex: 1,
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
  resetBtn: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
