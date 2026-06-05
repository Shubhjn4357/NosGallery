import { WidgetCustomizations } from '../../store/widgetStore';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { fetchLiveWeather, LiveWeatherData } from '../../services/apiService';
import { ThemeId } from '../../themes/themes';
import Svg, { Circle } from 'react-native-svg';

interface WeatherAqiProps {
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
}

const ARC_SIZE = 60;
const STROKE = 6;

const AqiGauge: React.FC<{ aqi: number; color: string }> = ({ aqi, color }) => {
  const radius = (ARC_SIZE - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const fillPct = Math.min(aqi / 200, 1); // normalise to 0-200 scale
  const strokeDashoffset = circumference - fillPct * circumference;
  return (
    <Svg width={ARC_SIZE} height={ARC_SIZE}>
      <Circle cx={ARC_SIZE / 2} cy={ARC_SIZE / 2} r={radius} stroke="rgba(120,120,120,0.12)" strokeWidth={STROKE} fill="transparent" />
      <Circle
        cx={ARC_SIZE / 2} cy={ARC_SIZE / 2} r={radius}
        stroke={color} strokeWidth={STROKE}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        fill="transparent"
        rotation="-90"
        originX={ARC_SIZE / 2}
        originY={ARC_SIZE / 2}
      />
    </Svg>
  );
};

export const WeatherAqi: React.FC<WeatherAqiProps> = ({
  customizations,
  globalTheme,
}) => {
  const { accentColor } = useWidgetStyle(customizations, globalTheme);

  const [weather, setWeather] = useState<LiveWeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const title = customizations.titleText || 'AIR QUALITY';

  useEffect(() => {
    let active = true;
    const load = async () => {
      const data = await fetchLiveWeather(51.5074, -0.1278);
      if (active) { setWeather(data); setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, []);

  if (loading || !weather) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="small" color={accentColor} />
      </View>
    );
  }

  const aqi = weather.aqi;
  const getAqiInfo = (a: number) => {
    if (a <= 35) return { label: 'GOOD', color: '#39ff14', grade: 'A' };
    if (a <= 75) return { label: 'MODERATE', color: '#ffcc00', grade: 'B' };
    if (a <= 115) return { label: 'UNHEALTHY', color: '#ff9500', grade: 'C' };
    return { label: 'HAZARDOUS', color: '#7C9EFF', grade: 'D' };
  };

  const aqiInfo = getAqiInfo(aqi);
  const isLight = customizations.backgroundColor === '#ffffff';
  const textColor = isLight ? '#000' : '#fff';
  const dimColor = isLight ? '#888' : '#666';

  const POLLUTANTS = [
    { label: 'PM2.5', val: '12μg' },
    { label: 'O₃', val: '28ppb' },
    { label: 'NO₂', val: '8ppb' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LucideIcons.Wind size={10} color={accentColor} />
          <Text style={[styles.title, { color: dimColor }]}>{title}</Text>
        </View>
        <View style={[styles.gradeBadge, { backgroundColor: aqiInfo.color + '22' }]}>
          <Text style={[styles.gradeText, { color: aqiInfo.color }]}>{aqiInfo.grade}</Text>
        </View>
      </View>

      {/* Ring gauge + value */}
      <View style={styles.gaugeRow}>
        <View style={styles.gaugeStack}>
          <AqiGauge aqi={aqi} color={aqiInfo.color} />
          <View style={styles.gaugeCenter}>
            <Text style={[styles.aqiValue, { color: aqiInfo.color }]}>{aqi}</Text>
          </View>
        </View>
        {/* Right: label + pollutants */}
        <View style={styles.rightBlock}>
          <Text style={[styles.aqiLabel, { color: aqiInfo.color }]}>{aqiInfo.label}</Text>
          {POLLUTANTS.map(p => (
            <View key={p.label} style={styles.pollutantRow}>
              <Text style={[styles.pollLabel, { color: dimColor }]}>{p.label}</Text>
              <Text style={[styles.pollVal, { color: textColor }]}>{p.val}</Text>
            </View>
          ))}
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
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  gradeBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeText: {
    fontSize: 11,
    fontWeight: '900',
  },
  gaugeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  gaugeStack: {
    position: 'relative',
    width: ARC_SIZE,
    height: ARC_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aqiValue: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  rightBlock: {
    flex: 1,
    gap: 4,
  },
  aqiLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  pollutantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pollLabel: {
    fontSize: 8,
    fontWeight: '600',
  },
  pollVal: {
    fontSize: 8,
    fontWeight: '900',
  },
});
