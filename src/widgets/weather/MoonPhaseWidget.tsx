import { Moon, Eye } from 'lucide-react-native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

const LucideIcons = {
  Moon,
  Eye,
};

interface MoonPhaseWidgetProps {
  globalTheme: ThemeId;
  interactive: boolean;
}

export const MoonPhaseWidget: React.FC<MoonPhaseWidgetProps> = ({
  globalTheme,
  interactive,
}) => {
  const { accentColor, textStyle, subtextStyle } = useWidgetStyle({}, globalTheme);

  // Astronomy logic to calculate moon phase
  const getMoonPhase = (date: Date) => {
    const knownNewMoon = new Date(1970, 0, 7).getTime();
    const diffMs = date.getTime() - knownNewMoon;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const cycle = 29.530588853; // synodic month
    const age = diffDays % cycle;
    const pct = age / cycle;

    let phase = 'New Moon';
    let icon = '🌑';
    let label = '0% illumination';

    if (pct < 0.03 || pct > 0.97) {
      phase = 'New Moon';
      icon = '🌑';
      label = '0% illuminated';
    } else if (pct < 0.22) {
      phase = 'Waxing Crescent';
      icon = '🌒';
      label = `${Math.round(pct * 100 * 2)}% illuminated`;
    } else if (pct < 0.28) {
      phase = 'First Quarter';
      icon = '🌓';
      label = '50% illuminated';
    } else if (pct < 0.47) {
      phase = 'Waxing Gibbous';
      icon = '🌔';
      label = `${Math.round(50 + (pct - 0.25) * 100 * 2)}% illuminated`;
    } else if (pct < 0.53) {
      phase = 'Full Moon';
      icon = '🌕';
      label = '100% illuminated';
    } else if (pct < 0.72) {
      phase = 'Waning Gibbous';
      icon = '🌖';
      label = `${Math.round(100 - (pct - 0.5) * 100 * 2)}% illuminated`;
    } else if (pct < 0.78) {
      phase = 'Third Quarter';
      icon = '🌗';
      label = '50% illuminated';
    } else {
      phase = 'Waning Crescent';
      icon = '🌘';
      label = `${Math.round(50 - (pct - 0.75) * 100 * 2)}% illuminated`;
    }

    return { phase, icon, label, age: age.toFixed(1) };
  };

  const today = new Date();
  const moon = getMoonPhase(today);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LucideIcons.Moon size={11} color={accentColor} />
          <Text style={[styles.title, subtextStyle]}>LUNAR INDEX</Text>
        </View>
        <Text style={[styles.luniTxt, { color: accentColor }]}>ASTRO</Text>
      </View>

      <View style={styles.center}>
        <Text style={styles.moonIcon}>{moon.icon}</Text>
        <View style={styles.details}>
          <Text style={[styles.phaseName, textStyle]}>
            {moon.phase.toUpperCase()}
          </Text>
          <Text style={[styles.illumination, subtextStyle]}>
            {moon.label} • Age {moon.age}d
          </Text>
        </View>
      </View>

      <Text style={[styles.footer, subtextStyle]}>
        CYCLE PROGRESS {Math.round((parseFloat(moon.age) / 29.53) * 100)}%
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
  luniTxt: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  center: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
    flex: 1,
  },
  moonIcon: {
    fontSize: 32,
  },
  details: {
    flex: 1,
    gap: 2,
  },
  phaseName: {
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  illumination: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  footer: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
});
