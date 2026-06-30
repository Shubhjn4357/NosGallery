// @widget smart_home_sound_control
import { Volume2, Volume1, VolumeX } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { View, Text, TouchableOpacity } from '../../../modules/expo-widget/src';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';
import { useFeedback } from '../../hooks/useFeedback';

const LucideIcons = {
  Volume2,
  Volume1,
  VolumeX,
};

interface SoundControlWidgetProps {
  globalTheme: ThemeId;
  interactive: boolean;
}

export const SoundControlWidget: React.FC<SoundControlWidgetProps> = ({
  globalTheme,
  interactive,
}) => {
  const { accentColor, textStyle, subtextStyle } = useWidgetStyle({}, globalTheme);
  const { triggerHaptic } = useFeedback();

  // Profiles: 'sound' | 'vibrate' | 'silent'
  const [profile, setProfile] = useState<'sound' | 'vibrate' | 'silent'>('vibrate');

  const cycleProfile = () => {
    if (!interactive) return;

    if (profile === 'sound') {
      triggerHaptic('selection');
      setProfile('vibrate');
    } else if (profile === 'vibrate') {
      triggerHaptic('heavy');
      setProfile('silent');
    } else {
      triggerHaptic('medium');
      setProfile('sound');
    }
  };

  const isLight = textStyle.color === '#000000';
  const displayBg = isLight ? '#e5e5ea' : '#1c1c1e';

  const getProfileDetails = () => {
    switch (profile) {
      case 'sound':
        return { label: 'SOUND MODE ACTIVE', desc: 'Ringer & alerts enabled', icon: 'Volume2', color: accentColor };
      case 'vibrate':
        return { label: 'VIBRATE PROFILE', desc: 'Calls silented, motor active', icon: 'Volume1', color: accentColor };
      case 'silent':
        return { label: 'SILENT / DND', desc: 'All alerts muted completely', icon: 'VolumeX', color: '#ff3b30' };
    }
  };

  const details = getProfileDetails();
  const IconComp = LucideIcons[details.icon as keyof typeof LucideIcons] || LucideIcons.Volume2;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <IconComp size={11} color={details.color} />
          <Text style={[styles.title, subtextStyle]}>SOUND SYSTEM</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={cycleProfile}
        disabled={!interactive}
        activeOpacity={0.8}
        style={[styles.profileCard, { backgroundColor: displayBg }]}
      >
        <Text style={[styles.profileLabel, { color: details.color }]}>
          {details.label}
        </Text>
        <Text style={[styles.profileDesc, subtextStyle]}>
          {details.desc}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.footer, subtextStyle]}>
        {interactive ? 'TAP TO CYCLE PROFILES' : 'SYSTEM LINKED'}
      </Text>
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
  profileCard: {
    padding: 8,
    borderRadius: 8,
    marginVertical: 4,
  },
  profileLabel: {
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  profileDesc: {
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 2,
  },
  footer: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
});
