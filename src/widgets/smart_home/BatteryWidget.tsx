// @widget developer_battery
import { BatteryCharging, Battery } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { View, Text } from '../../../modules/expo-widget/src';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

const LucideIcons = {
  BatteryCharging,
  Battery,
};

interface BatteryWidgetProps {
  globalTheme: ThemeId;
  interactive: boolean;
}

export const BatteryWidget: React.FC<BatteryWidgetProps> = ({
  globalTheme,
  interactive,
}) => {
  const { accentColor, textStyle, subtextStyle } = useWidgetStyle({}, globalTheme);

  const [phoneBattery, setPhoneBattery] = useState(82);
  const [isCharging, setIsCharging] = useState(false);

  useEffect(() => {
    if (!interactive) return;
    // Periodically update / simulate charging state
    const interval = setInterval(() => {
      setPhoneBattery((prev) => {
        if (prev >= 100) {
          setIsCharging(false);
          return 80; // Reset cycle
        }
        return prev + 1;
      });
    }, 12000);

    return () => clearInterval(interval);
  }, [interactive]);

  const earL = 90;
  const earR = 85;
  const earCase = 60;

  const isLight = textStyle.color === '#000000';
  const trackBg = isLight ? '#efeff4' : '#1c1c1e';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {isCharging ? (
            <LucideIcons.BatteryCharging size={11} color={accentColor} />
          ) : (
            <LucideIcons.Battery size={11} color={accentColor} />
          )}
          <Text style={[styles.title, subtextStyle]}>POWER CENTER</Text>
        </View>
        <Text style={[styles.chargingTxt, { color: accentColor }]}>
          {isCharging ? 'CHARGING' : 'DISCHARGING'}
        </Text>
      </View>

      {/* Main phone battery view */}
      <View style={styles.phoneSection}>
        <Text style={[styles.batteryPct, textStyle]}>
          {phoneBattery}%
        </Text>
        <View style={[styles.batteryTrack, { backgroundColor: trackBg }]}>
          <View style={[styles.batteryFill, { width: `${phoneBattery}%`, backgroundColor: accentColor }]} />
        </View>
        <Text style={[styles.deviceLabel, subtextStyle]}>PHONE MODULE</Text>
      </View>

      {/* Nothing Ear buds battery subview */}
      <View style={styles.budsRow}>
        <View style={styles.budCol}>
          <Text style={[styles.budPct, textStyle]}>{earL}%</Text>
          <Text style={[styles.budLabel, subtextStyle]}>EAR (L)</Text>
        </View>
        <View style={styles.budDivider} />
        <View style={styles.budCol}>
          <Text style={[styles.budPct, textStyle]}>{earR}%</Text>
          <Text style={[styles.budLabel, subtextStyle]}>EAR (R)</Text>
        </View>
        <View style={styles.budDivider} />
        <View style={styles.budCol}>
          <Text style={[styles.budPct, textStyle]}>{earCase}%</Text>
          <Text style={[styles.budLabel, subtextStyle]}>CASE</Text>
        </View>
      </View>
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
  chargingTxt: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  phoneSection: {
    marginVertical: 4,
  },
  batteryPct: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 24,
  },
  batteryTrack: {
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  batteryFill: {
    height: '100%',
    borderRadius: 2,
  },
  deviceLabel: {
    fontSize: 6.5,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  budsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(120, 120, 120, 0.08)',
    paddingTop: 4,
  },
  budCol: {
    flex: 1,
    alignItems: 'center',
  },
  budPct: {
    fontSize: 9.5,
    fontWeight: '900',
  },
  budLabel: {
    fontSize: 5.5,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  budDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(120, 120, 120, 0.15)',
  },
});
