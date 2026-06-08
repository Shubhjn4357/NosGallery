import { MessageSquare } from 'lucide-react-native';
import { WidgetCustomizations } from '../../store/widgetStore';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

const LucideIcons = {
  MessageSquare,
};

interface SocialFeedProps {
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
  interactive?: boolean;
}

const FEED_ITEMS = [
  { platform: '𝕏', handle: '@nosgallery', msg: 'Just shipped 3.0 🚀', time: '2m', color: '#ffffff' },
  { platform: 'IN', handle: 'NOS Studio', msg: 'Team of 5 engineers', time: '1h', color: '#0a66c2' },
  { platform: '▶', handle: 'Creator', msg: '+248 new subscribers', time: '4h', color: '#7C9EFF' },
];

export const SocialFeed: React.FC<SocialFeedProps> = ({
  customizations,
  globalTheme,
  interactive = false,
}) => {
  const { accentColor } = useWidgetStyle(customizations, globalTheme);
  const title = customizations.titleText || 'SOCIAL INBOX';

  const [activeIdx, setActiveIdx] = useState(0);
  const [slideAnim] = useState(() => new Animated.Value(0));

  // Auto-cycle through feed items
  useEffect(() => {
    if (!interactive) return;
    const interval = setInterval(() => {
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setActiveIdx(prev => (prev + 1) % FEED_ITEMS.length);
        slideAnim.setValue(20);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [slideAnim, interactive]);

  const item = FEED_ITEMS[activeIdx];

  const [subCount, setSubCount] = useState(14_242);
  useEffect(() => {
    if (!interactive) return;
    const t = setInterval(() => setSubCount(p => p + Math.floor(Math.random() * 3)), 4000);
    return () => clearInterval(t);
  }, [interactive]);

  const isLight = customizations.backgroundColor === '#ffffff';
  const cardBg = isLight ? '#f2f2f7' : '#111113';
  const textColor = isLight ? '#000' : '#fff';
  const dimColor = isLight ? '#888' : '#666';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LucideIcons.MessageSquare size={10} color={accentColor} />
          <Text style={[styles.title, { color: dimColor }]}>{title}</Text>
        </View>
        <View style={[styles.liveDot, { backgroundColor: accentColor }]} />
      </View>

      {/* Sliding feed card */}
      <Animated.View style={[styles.feedCard, { backgroundColor: cardBg, transform: [{ translateY: slideAnim }] }]}>
        <View style={[styles.platformBadge, { backgroundColor: item.color + '22' }]}>
          <Text style={[styles.platformText, { color: item.color }]}>{item.platform}</Text>
        </View>
        <View style={styles.feedContent}>
          <Text style={[styles.handleText, { color: accentColor }]} numberOfLines={1}>{item.handle}</Text>
          <Text style={[styles.msgText, { color: textColor }]} numberOfLines={1}>{item.msg}</Text>
        </View>
        <Text style={[styles.timeText, { color: dimColor }]}>{item.time}</Text>
      </Animated.View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statCol}>
          <Text style={[styles.statValue, { color: textColor }]}>{subCount.toLocaleString()}</Text>
          <Text style={[styles.statLabel, { color: dimColor }]}>SUBS</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: isLight ? '#d1d1d6' : '#2c2c2e' }]} />
        <View style={styles.statCol}>
          <Text style={[styles.statValue, { color: '#39ff14' }]}>+128</Text>
          <Text style={[styles.statLabel, { color: dimColor }]}>TODAY</Text>
        </View>
        {/* Pagination dots */}
        <View style={styles.dotRow}>
          {FEED_ITEMS.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i === activeIdx ? accentColor : dimColor, width: i === activeIdx ? 10 : 5 }]} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  feedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 8,
    gap: 8,
  },
  platformBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformText: {
    fontSize: 11,
    fontWeight: '900',
  },
  feedContent: {
    flex: 1,
  },
  handleText: {
    fontSize: 8.5,
    fontWeight: '900',
  },
  msgText: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 1,
  },
  timeText: {
    fontSize: 8,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statCol: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },
  divider: {
    width: 1,
    height: 24,
  },
  dotRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 3,
  },
  dot: {
    height: 5,
    borderRadius: 2.5,
  },
});
