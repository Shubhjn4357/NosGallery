import { Sparkles } from 'lucide-react-native';
import { WidgetCustomizations } from '../../store/widgetStore';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

const LucideIcons = {
  Sparkles,
};

interface AiSummaryWidgetProps {
  valText: string;
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
}

export const AiSummaryWidget: React.FC<AiSummaryWidgetProps> = ({
  valText,
  customizations,
  globalTheme,
}) => {
  const { textStyle, accentColor } = useWidgetStyle(customizations, globalTheme);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.badge, textStyle, { borderColor: accentColor, color: accentColor }]}>AI BRIEF</Text>
        <LucideIcons.Sparkles size={12} color={accentColor} />
      </View>
      <Text style={[styles.desc, textStyle]}>
        {valText || 'Deploy Vercel branch. Storm forecasts won\'t affect commute. Crypto holds stable.'}
      </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    fontSize: 7.5,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    fontWeight: 'bold',
  },
  desc: {
    fontSize: 10,
    lineHeight: 14,
    marginTop: 4,
  },
});
