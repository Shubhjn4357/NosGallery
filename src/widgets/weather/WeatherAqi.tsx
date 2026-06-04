import { WidgetCustomizations } from '../../store/widgetStore';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { fetchLiveWeather, LiveWeatherData } from '../../services/apiService';
import { ThemeId } from '../../themes/themes';

interface WeatherAqiProps {
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
}

export const WeatherAqi: React.FC<WeatherAqiProps> = ({
  customizations,
  globalTheme,
}) => {
  const { textStyle, subtextStyle, accentColor } = useWidgetStyle(customizations, globalTheme);

  const [weather, setWeather] = useState<LiveWeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const title = customizations.titleText || 'AIR QUALITY';

  useEffect(() => {
    let active = true;
    const loadAqi = async () => {
      let lat = 51.5074;
      let lon = -0.1278;
      const parsedCity = title.toLowerCase();
      if (parsedCity.includes('new york') || parsedCity.includes('nyc')) {
        lat = 40.7128; lon = -74.0060;
      } else if (parsedCity.includes('tokyo') || parsedCity.includes('japan')) {
        lat = 35.6762; lon = 139.6503;
      }
      const data = await fetchLiveWeather(lat, lon);
      if (active) {
        setWeather(data);
        setLoading(false);
      }
    };
    loadAqi();
    return () => { active = false; };
  }, [title]);

  if (loading || !weather) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={accentColor} />
      </View>
    );
  }

  const getAqiLabel = (aqi: number) => {
    if (aqi <= 35) return 'GOOD';
    if (aqi <= 75) return 'MODERATE';
    return 'UNHEALTHY';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, subtextStyle]}>{title}</Text>
        <LucideIcons.Wind size={12} color={accentColor} />
      </View>
      <Text style={[styles.value, textStyle, { color: accentColor }]}>{weather.aqi} AQI</Text>
      <Text style={[styles.descText, textStyle, { fontSize: 10 }]}>
        {getAqiLabel(weather.aqi)} AIR QUALITY
      </Text>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${Math.min(weather.aqi, 100)}%`, backgroundColor: accentColor }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 8.5,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  value: {
    fontSize: 22,
    fontWeight: '900',
  },
  descText: {
    opacity: 0.7,
  },
  barBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    width: '100%',
    marginTop: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
});
