import { WidgetCustomizations } from '../../store/widgetStore';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { fetchLiveWeather, LiveWeatherData } from '../../services/apiService';
import { ThemeId } from '../../themes/themes';

interface WeatherCurrentProps {
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
}

export const WeatherCurrent: React.FC<WeatherCurrentProps> = ({
  customizations,
  globalTheme,
}) => {
  const { textStyle, subtextStyle, accentColor } = useWidgetStyle(customizations, globalTheme);

  const [weather, setWeather] = useState<LiveWeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const title = customizations.titleText || 'WEATHER';

  useEffect(() => {
    let active = true;
    const loadWeather = async () => {
      // Determine default coords based on city name customizations
      let lat = 51.5074;
      let lon = -0.1278; // London

      const city = title.toLowerCase();
      if (city.includes('new york') || city.includes('nyc')) {
        lat = 40.7128; lon = -74.0060;
      } else if (city.includes('tokyo') || city.includes('japan')) {
        lat = 35.6762; lon = 139.6503;
      } else if (city.includes('paris') || city.includes('france')) {
        lat = 48.8566; lon = 2.3522;
      } else if (city.includes('mumbai') || city.includes('india')) {
        lat = 19.0760; lon = 72.8777;
      }

      const data = await fetchLiveWeather(lat, lon);
      if (active) {
        setWeather(data);
        setLoading(false);
      }
    };
    loadWeather();
    return () => { active = false; };
  }, [title]);

  const renderIcon = (conditionText: string) => {
    const cond = conditionText.toLowerCase();
    if (cond.includes('sunny') || cond.includes('clear')) {
      return <LucideIcons.Sun size={24} color={accentColor} />;
    }
    if (cond.includes('cloud')) {
      return <LucideIcons.Cloud size={24} color={accentColor} />;
    }
    if (cond.includes('rain') || cond.includes('drizzle')) {
      return <LucideIcons.CloudRain size={24} color={accentColor} />;
    }
    if (cond.includes('snow')) {
      return <LucideIcons.Snowflake size={24} color={accentColor} />;
    }
    if (cond.includes('thunder')) {
      return <LucideIcons.CloudLightning size={24} color={accentColor} />;
    }
    return <LucideIcons.CloudSun size={24} color={accentColor} />;
  };

  if (loading || !weather) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={accentColor} />
      </View>
    );
  }

  // Display specific details based on template name (hourly, weekly, wind, humidity, etc.)
  const isWind = title.toLowerCase().includes('wind');
  const isHumidity = title.toLowerCase().includes('humidity');

  if (isWind) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, subtextStyle]}>{title}</Text>
          <LucideIcons.Wind size={14} color={accentColor} />
        </View>
        <Text style={[styles.largeValue, textStyle]}>{weather.windSpeed} km/h</Text>
        <Text style={[styles.desc, subtextStyle]}>BREEZY DIRECTION</Text>
      </View>
    );
  }

  if (isHumidity) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, subtextStyle]}>{title}</Text>
          <LucideIcons.Droplets size={14} color={accentColor} />
        </View>
        <Text style={[styles.largeValue, textStyle]}>{weather.humidity}%</Text>
        <Text style={[styles.desc, subtextStyle]}>RELATIVE MOISTURE</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.temp, textStyle]}>{weather.temp.toFixed(1)}°C</Text>
        {renderIcon(weather.condition)}
      </View>
      <Text style={[styles.title, textStyle]}>{title}</Text>
      <Text style={[styles.desc, subtextStyle, { fontSize: 10 }]}>
        {weather.condition.toUpperCase()} • UV: {weather.uvIndex}
      </Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  temp: {
    fontSize: 22,
    fontWeight: '900',
  },
  largeValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  title: {
    fontSize: 8.5,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  desc: {
    fontSize: 9.5,
  },
});
