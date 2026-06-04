import { WidgetCustomizations } from '../../store/widgetStore';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

interface SocialFeedProps {
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({
  customizations,
  globalTheme,
}) => {
  const { textStyle, subtextStyle, accentColor, successColor } = useWidgetStyle(customizations, globalTheme);

  const title = customizations.titleText || 'SUBSCRIBERS';

  // Live ticking subscriber count
  const [subscribers, setSubscribers] = useState(14242);

  useEffect(() => {
    const timer = setInterval(() => {
      setSubscribers(prev => prev + Math.floor(Math.random() * 2));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, subtextStyle]}>{title}</Text>
        <LucideIcons.MessageSquare size={12} color={accentColor} />
      </View>
      <Text style={[styles.value, textStyle]}>
        {subscribers.toLocaleString()} SUBSCRIBERS
      </Text>
      <Text style={[styles.trendText, textStyle, { color: successColor }]}>▲ +128 today</Text>
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
  value: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  trendText: {
    fontSize: 10.5,
    fontWeight: 'bold',
  },
});
