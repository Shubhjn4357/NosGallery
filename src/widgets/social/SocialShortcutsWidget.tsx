// @widget social_shortcuts
import { Share2, MessageSquare, Send, Compass } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Linking } from 'react-native';
import { View, Text, TouchableOpacity } from '../../../modules/expo-widget/src';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';
import { useFeedback } from '../../hooks/useFeedback';
import { InstagramIcon, TwitterIcon, WhatsappIcon, TelegramIcon } from '../../components/BrandIcons';

const LucideIcons = {
  Share2,
  MessageSquare,
  Send,
  Compass,
  Instagram: InstagramIcon,
  Twitter: TwitterIcon,
  WhatsApp: WhatsappIcon,
  Telegram: TelegramIcon,
};

interface SocialShortcutsWidgetProps {
  globalTheme: ThemeId;
  interactive: boolean;
}

const SHORTCUTS = [
  { name: 'WhatsApp', scheme: 'whatsapp://', icon: 'WhatsApp', color: '#25D366' },
  { name: 'Telegram', scheme: 'tg://', icon: 'Telegram', color: '#0088cc' },
  { name: 'Instagram', scheme: 'instagram://', icon: 'Instagram', color: '#E1306C' },
  { name: 'Snapchat', scheme: 'snapchat://', icon: 'Compass', color: '#FFFC00' },
  { name: 'Twitter', scheme: 'twitter://', icon: 'Twitter', color: '#1DA1F2' },
];

export const SocialShortcutsWidget: React.FC<SocialShortcutsWidgetProps> = ({
  globalTheme,
  interactive,
}) => {
  const { accentColor, textStyle, subtextStyle } = useWidgetStyle({}, globalTheme);
  const { triggerHaptic } = useFeedback();

  const handleLaunch = (scheme: string, name: string) => {
    if (!interactive) return;
    triggerHaptic('light');
    Linking.openURL(scheme).catch(() => {
      // Fallback to web search
      Linking.openURL(`https://www.google.com/search?q=${name}`).catch(() => {});
    });
  };

  const isLight = textStyle.color === '#000000';
  const tileBg = isLight ? '#e5e5ea' : '#1c1c1e';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LucideIcons.Share2 size={11} color={accentColor} />
          <Text style={[styles.title, subtextStyle]}>SOCIAL HUB</Text>
        </View>
        <Text style={[styles.badge, { color: accentColor }]}>SHORTCUTS</Text>
      </View>

      <View style={styles.grid}>
        {SHORTCUTS.map((app) => {
          const IconComp = LucideIcons[app.icon as keyof typeof LucideIcons] || LucideIcons.Compass;
          return (
            <TouchableOpacity
              key={app.name}
              onPress={() => handleLaunch(app.scheme, app.name)}
              disabled={!interactive}
              style={[styles.tile, { backgroundColor: tileBg }]}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: app.color + '18' }]}>
                <IconComp size={15} color={app.color} />
              </View>
              <Text style={[styles.appName, textStyle]} numberOfLines={1}>
                {app.name.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    marginBottom: 6,
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
  badge: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    flex: 1,
    alignItems: 'center',
  },
  tile: {
    width: '31%',
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 6.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});
