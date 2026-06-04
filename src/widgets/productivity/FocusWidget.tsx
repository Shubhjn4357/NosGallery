import { WidgetCustomizations } from '../../store/widgetStore';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

interface FocusWidgetProps {
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
  interactive: boolean;
}

export const FocusWidget: React.FC<FocusWidgetProps> = ({
  customizations,
  globalTheme,
  interactive,
}) => {
  const { textStyle, subtextStyle, accentColor } = useWidgetStyle(customizations, globalTheme);

  const title = customizations.titleText || 'FOCUS MODE';

  // Real Pomodoro Countdown Timer Ticker
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsActive(false);
            return 25 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const handleToggle = () => {
    if (!interactive) return;
    setIsActive(!isActive);
  };

  const handleReset = () => {
    if (!interactive) return;
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, subtextStyle]}>{title}</Text>
        <LucideIcons.Target size={14} color={accentColor} />
      </View>
      <Text style={[styles.timeLabel, textStyle]}>{mins}:{secs}</Text>
      
      {interactive ? (
        <View style={styles.btnRow}>
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: isActive ? '#ff3b30' : '#34c759' }]} 
            onPress={handleToggle}
          >
            <Text style={styles.btnText}>{isActive ? 'Pause' : 'Start'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#555' }]} onPress={handleReset}>
            <Text style={styles.btnText}>Reset</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={[styles.desc, subtextStyle]}>POMODORO FOCUS STATUS</Text>
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
  timeLabel: {
    fontSize: 24,
    fontWeight: '900',
  },
  desc: {
    fontSize: 9.5,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 4,
  },
  btn: {
    flex: 1,
    paddingVertical: 3,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 8.5,
    fontWeight: 'bold',
  },
});
