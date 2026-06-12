import { Folder, Clock, Calendar, CloudSun, Sliders } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';
import { useWidgetStore } from '../../store/widgetStore';
import { useFeedback } from '../../hooks/useFeedback';

const LucideIcons = {
  Folder,
  Clock,
  Calendar,
  CloudSun,
  Sliders,
};

interface FolderWidgetProps {
  globalTheme: ThemeId;
  interactive: boolean;
}

export const FolderWidget: React.FC<FolderWidgetProps> = ({
  globalTheme,
  interactive,
}) => {
  const { setActiveTab } = useWidgetStore();
  const { triggerHaptic } = useFeedback();
  const { accentColor, textStyle, subtextStyle } = useWidgetStyle({}, globalTheme);

  const apps = [
    { name: 'CLOCK', icon: 'Clock', action: 'clock' },
    { name: 'CALENDAR', icon: 'Calendar', action: 'calendar' },
    { name: 'WEATHER', icon: 'CloudSun', action: 'weather' },
    { name: 'SETTINGS', icon: 'Sliders', action: 'settings' },
  ];

  const handleLaunch = (action: string) => {
    if (!interactive) return;
    triggerHaptic('light');

    if (action === 'settings') {
      setActiveTab('settings');
      return;
    }

    // Direct Intent launching on Android
    // On other platforms, just open search fallback or alert
    setActiveTab('editor');
  };

  const isLight = textStyle.color === '#000000';
  const tileBg = isLight ? '#e5e5ea' : '#1c1c1e';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LucideIcons.Folder size={11} color={accentColor} />
          <Text style={[styles.title, subtextStyle]}>QUICK APPS</Text>
        </View>
        <Text style={[styles.badge, { color: accentColor }]}>FOLDER</Text>
      </View>

      <View style={styles.grid}>
        {apps.map((app) => {
          const IconComp = LucideIcons[app.icon as keyof typeof LucideIcons] || LucideIcons.Folder;
          return (
            <TouchableOpacity
              key={app.name}
              onPress={() => handleLaunch(app.action)}
              disabled={!interactive}
              style={[styles.appTile, { backgroundColor: tileBg }]}
              activeOpacity={0.7}
            >
              <IconComp size={14} color={accentColor} />
              <Text style={[styles.appLabel, textStyle]}>{app.name}</Text>
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
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'space-between',
    flex: 1,
    alignItems: 'center',
  },
  appTile: {
    width: '48%',
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  appLabel: {
    fontSize: 6.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});
