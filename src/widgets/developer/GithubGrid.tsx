import { WidgetCustomizations } from '../../store/widgetStore';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { fetchGithubStats, LiveGithubData } from '../../services/apiService';
import { ThemeId } from '../../themes/themes';

interface GithubGridProps {
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
  interactive?: boolean;
}

export const GithubGrid: React.FC<GithubGridProps> = ({
  customizations,
  globalTheme,
  interactive = false,
}) => {
  const { textStyle, subtextStyle, accentColor } = useWidgetStyle(customizations, globalTheme);

  const [gitStats, setGitStats] = useState<LiveGithubData | null>(null);
  const [loading, setLoading] = useState(true);

  const title = customizations.titleText || 'GITHUB';

  useEffect(() => {
    if (!interactive) {
      setLoading(false);
      return;
    }
    let active = true;
    const loadGithub = async () => {
      // Find customized username from widget labels
      let username = 'octocat';
      if (customizations.valueText && customizations.valueText.trim()) {
        username = customizations.valueText.trim();
      }
      
      const stats = await fetchGithubStats(username);
      if (active) {
        setGitStats(stats);
        setLoading(false);
      }
    };
    loadGithub();
    return () => { active = false; };
  }, [customizations.valueText, interactive]);

  if (loading || !gitStats) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={accentColor} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, subtextStyle]}>{title}</Text>
          <Text style={[styles.userLabel, textStyle, { color: accentColor }]}>@{gitStats.username}</Text>
        </View>
        <LucideIcons.GitBranch size={12} color={accentColor} />
      </View>
      <Text style={[styles.statsLabel, textStyle]}>
        Repos: {gitStats.publicRepos} • Followers: {gitStats.followers}
      </Text>
      <View style={styles.gridRow}>
        {Array.from({ length: 28 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.block,
              {
                backgroundColor: i % 4 === 0 ? accentColor : (i % 6 === 0 ? `${accentColor}88` : '#222'),
                opacity: i % 5 === 0 ? 0.35 : 1,
              },
            ]}
          />
        ))}
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 8.5,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  userLabel: {
    fontSize: 9.5,
    fontWeight: 'bold',
  },
  statsLabel: {
    fontSize: 9,
    opacity: 0.85,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    marginTop: 4,
  },
  block: {
    width: 13,
    height: 13,
    borderRadius: 2,
  },
});
