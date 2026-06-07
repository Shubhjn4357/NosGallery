import { Droplets, Thermometer, Wind } from 'lucide-react-native';

const LucideIcons = {
  Droplets,
  Thermometer,
  Wind,
};
import { WidgetCustomizations } from '../../store/widgetStore';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { fetchLiveWeather, LiveWeatherData } from '../../services/apiService';
import { ThemeId } from '../../themes/themes';

interface WeatherCurrentProps {
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
  interactive?: boolean;
}

const CONDITION_ICONS: Record<string, { icon: string; color: string }> = {
  sunny: { icon: 'Sun', color: '#ffcc00' },
  clear: { icon: 'Sun', color: '#ffcc00' },
  cloud: { icon: 'Cloud', color: '#8e8e93' },
  rain: { icon: 'CloudRain', color: '#007aff' },
  drizzle: { icon: 'CloudDrizzle', color: '#007aff' },
  snow: { icon: 'Snowflake', color: '#a8d8ea' },
  thunder: { icon: 'CloudLightning', color: '#ff9500' },
};

export const WeatherCurrent: React.FC<WeatherCurrentProps> = ({
  customizations,
  globalTheme,
  interactive = false,
}) => {
  const { accentColor } = useWidgetStyle(customizations, globalTheme);

  const [weather, setWeather] = useState<LiveWeatherData | null>(() => {
    if (!interactive) {
      return {
        temp: 72,
        condition: 'Sunny',
        windSpeed: 14,
        humidity: 62,
        uvIndex: 5,
        aqi: 42
      };
    }
    return null;
  });
  const [loading, setLoading] = useState(interactive);

  const title = customizations.titleText || 'WEATHER';

  useEffect(() => {
    if (!interactive) {
      return;
    }
    let active = true;
    const load = async () => {
      let lat = 51.5074; let lon = -0.1278;
      const city = title.toLowerCase();
      if (city.includes('new york') || city.includes('nyc')) { lat = 40.7128; lon = -74.006; }
      else if (city.includes('tokyo')) { lat = 35.6762; lon = 139.6503; }
      else if (city.includes('mumbai')) { lat = 19.076; lon = 72.8777; }
      const data = await fetchLiveWeather(lat, lon);
      if (active) { setWeather(data); setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, [title, interactive]);

  const getConditionStyle = (condition: string) => {
    const c = condition.toLowerCase();
    const match = Object.keys(CONDITION_ICONS).find(k => c.includes(k));
    return match ? CONDITION_ICONS[match] : { icon: 'CloudSun', color: accentColor };
  };

  if (loading || !weather) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="small" color={accentColor} />
        <Text style={[styles.loadingText, { color: accentColor }]}>Fetching...</Text>
      </View>
    );
  }

  const condStyle = getConditionStyle(weather.condition);
  const IconComp = (LucideIcons as any)[condStyle.icon];

  const isLight = customizations.backgroundColor === '#ffffff';
  const textColor = isLight ? '#000' : '#fff';
  const dimColor = isLight ? '#888' : '#666';
  const cardBg = isLight ? '#f2f2f7' : '#111114';

  // Feels-like estimate
  const feelsLike = (weather.temp + (weather.humidity - 50) * 0.05 - weather.windSpeed * 0.1).toFixed(1);

  return (
    <View style={styles.container}>
      {/* Top: Location + Icon */}
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.location, { color: dimColor }]}>{title.toUpperCase()}</Text>
          <Text style={[styles.temp, { color: textColor }]}>
            {weather.temp.toFixed(0)}<Text style={[styles.degree, { color: dimColor }]}>°C</Text>
          </Text>
        </View>
        {IconComp ? (
          <View style={[styles.iconCircle, { backgroundColor: condStyle.color + '1a' }]}>
            <IconComp size={22} color={condStyle.color} />
          </View>
        ) : null}
      </View>

      {/* Condition label */}
      <Text style={[styles.condText, { color: condStyle.color }]}>
        {weather.condition.toUpperCase()}
      </Text>

      {/* Stats row */}
      <View style={[styles.statsCard, { backgroundColor: cardBg }]}>
        <View style={styles.statItem}>
          <LucideIcons.Wind size={9} color={dimColor} />
          <Text style={[styles.statVal, { color: textColor }]}>{weather.windSpeed}<Text style={{ color: dimColor, fontSize: 7 }}>km/h</Text></Text>
        </View>
        <View style={[styles.divider, { backgroundColor: isLight ? '#d1d1d6' : '#2c2c2e' }]} />
        <View style={styles.statItem}>
          <LucideIcons.Droplets size={9} color={dimColor} />
          <Text style={[styles.statVal, { color: textColor }]}>{weather.humidity}<Text style={{ color: dimColor, fontSize: 7 }}>%</Text></Text>
        </View>
        <View style={[styles.divider, { backgroundColor: isLight ? '#d1d1d6' : '#2c2c2e' }]} />
        <View style={styles.statItem}>
          <LucideIcons.Thermometer size={9} color={dimColor} />
          <Text style={[styles.statVal, { color: textColor }]}>{feelsLike}<Text style={{ color: dimColor, fontSize: 7 }}>°</Text></Text>
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
    gap: 6,
  },
  loadingText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  location: {
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  temp: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  degree: {
    fontSize: 16,
    fontWeight: '400',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  condText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 7,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statVal: {
    fontSize: 10,
    fontWeight: '900',
  },
  divider: {
    width: 1,
    height: 20,
  },
});
