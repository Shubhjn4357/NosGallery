import { RotateCcw, Play, Pause, Flag } from 'lucide-react-native';
import { WidgetCustomizations } from '../../store/widgetStore';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { View, Text, TouchableOpacity } from '../../../modules/expo-widget/src';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';
import { useFeedback } from '../../hooks/useFeedback';

const LucideIcons = {
  RotateCcw,
  Play,
  Pause,
  Flag,
};

interface StopwatchWidgetProps {
  swTime: number;
  swActive: boolean;
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
  interactive: boolean;
  handleStopwatch: () => void;
  handleStopwatchReset: () => void;
}

export const StopwatchWidget: React.FC<StopwatchWidgetProps> = ({
  swTime,
  swActive,
  customizations,
  globalTheme,
  interactive,
  handleStopwatch,
  handleStopwatchReset,
}) => {
  const { accentColor, textStyle, subtextStyle } = useWidgetStyle(customizations, globalTheme);
  const { triggerHaptic } = useFeedback();

  // Local laps state
  const [laps, setLaps] = useState<string[]>([]);

  // Reset laps when time is reset
  const [prevSwTime, setPrevSwTime] = useState(swTime);
  if (swTime !== prevSwTime) {
    setPrevSwTime(swTime);
    if (swTime === 0) {
      setLaps([]);
    }
  }

  const formatStopwatchTime = (time: number) => {
    const mins = Math.floor(time / 600);
    const secs = Math.floor((time % 600) / 10);
    const deci = time % 10;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${deci}`;
  };

  const handleLap = () => {
    if (!interactive || !swActive) return;
    triggerHaptic('selection');
    const lapTimeStr = formatStopwatchTime(swTime);
    setLaps((prev) => [lapTimeStr, ...prev].slice(0, 3)); // Keep last 3 laps
  };

  const isLight = textStyle.color === '#000000';
  const controlBg = isLight ? '#e5e5ea' : '#1c1c1e';

  // Tick calculation for ring or line
  const maxTicks = 16;
  const filledTicks = Math.min(maxTicks, Math.round(((swTime / 10) % 15) / 15 * maxTicks));

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={[styles.title, subtextStyle]}>CHRONOMETER</Text>
        <View style={styles.ticksRow}>
          {Array.from({ length: maxTicks }).map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.tickBar,
                {
                  backgroundColor: idx < filledTicks ? accentColor : (isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)'),
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Timer readout & Laps side-by-side */}
      <View style={styles.mainRow}>
        <View style={styles.timerCol}>
          <Text style={[styles.timeText, textStyle]}>
            {formatStopwatchTime(swTime)}
          </Text>
        </View>
        <View style={styles.lapsCol}>
          {laps.length > 0 ? (
            laps.map((lap, i) => (
              <Text key={i} style={[styles.lapTxt, subtextStyle]}>
                LAP {laps.length - i} • {lap}
              </Text>
            ))
          ) : (
            <Text style={[styles.noLapsTxt, subtextStyle]}>NO LAPS SAVED</Text>
          )}
        </View>
      </View>

      {/* Buttons */}
      {interactive && (
        <View style={styles.buttons}>
          <TouchableOpacity
            onPress={handleStopwatch}
            style={[styles.startBtn, { backgroundColor: swActive ? '#ff3b30' : accentColor }]}
            activeOpacity={0.8}
          >
            {swActive ? (
              <LucideIcons.Pause size={10} color="#ffffff" />
            ) : (
              <LucideIcons.Play size={10} color="#000000" />
            )}
            <Text style={[styles.btnLabel, { color: swActive ? '#ffffff' : '#000000' }]}>
              {swActive ? 'PAUSE' : 'START'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLap}
            disabled={!swActive}
            style={[styles.iconBtn, { backgroundColor: controlBg, opacity: swActive ? 1 : 0.4 }]}
            activeOpacity={0.8}
          >
            <LucideIcons.Flag size={10} color={textStyle.color} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleStopwatchReset}
            disabled={swActive || swTime === 0}
            style={[styles.iconBtn, { backgroundColor: controlBg, opacity: !swActive && swTime > 0 ? 1 : 0.4 }]}
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
  title: {
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  ticksRow: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
  },
  tickBar: {
    width: 2.5,
    height: 6,
    borderRadius: 1,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginVertical: 4,
  },
  timerCol: {
    flex: 1.2,
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    fontFamily: 'monospace',
  },
  lapsCol: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  lapTxt: {
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  noLapsTxt: {
    fontSize: 7.5,
    fontWeight: '900',
    opacity: 0.5,
    letterSpacing: 0.5,
  },
  buttons: {
    flexDirection: 'row',
    gap: 6,
  },
  startBtn: {
    flex: 1.5,
    height: 22,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  btnLabel: {
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
});
