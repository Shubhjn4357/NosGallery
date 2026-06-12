import { Sparkles, Brain } from 'lucide-react-native';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';
import { useWidgetStore } from '../../store/widgetStore';
import { useFeedback } from '../../hooks/useFeedback';

const LucideIcons = {
  Sparkles,
  Brain,
};

interface AiBarWidgetProps {
  globalTheme: ThemeId;
  interactive: boolean;
}

const PROVIDERS = [
  { id: 'gemini', label: 'GEMINI' },
  { id: 'gpt', label: 'GPT-4' },
  { id: 'claude', label: 'CLAUDE' },
  { id: 'deepseek', label: 'DEEPSEEK' },
];

export const AiBarWidget: React.FC<AiBarWidgetProps> = ({
  globalTheme,
  interactive,
}) => {
  const { activeAiProvider, setActiveAiProvider, showToast } = useWidgetStore();
  const { triggerHaptic } = useFeedback();
  const { accentColor, textStyle, subtextStyle } = useWidgetStyle({}, globalTheme);

  const handleSelectProvider = (providerId: string, label: string) => {
    if (!interactive) return;
    triggerHaptic('selection');
    setActiveAiProvider(providerId);
    showToast(`AI Assistant routed to ${label}`, 'info');
  };

  const isLight = textStyle.color === '#000000';
  const inactiveBg = isLight ? '#e5e5ea' : '#1c1c1e';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LucideIcons.Sparkles size={11} color={accentColor} />
          <Text style={[styles.title, subtextStyle]}>AI PROVIDER ROUTER</Text>
        </View>
        <LucideIcons.Brain size={11} color={subtextStyle.color} />
      </View>

      <View style={styles.providerGrid}>
        {PROVIDERS.map((prov) => {
          const isActive = activeAiProvider === prov.id;
          const bg = isActive ? accentColor : inactiveBg;
          const labelColor = isActive ? '#000000' : textStyle.color;

          return (
            <TouchableOpacity
              key={prov.id}
              onPress={() => handleSelectProvider(prov.id, prov.label)}
              disabled={!interactive}
              style={[styles.chip, { backgroundColor: bg }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, { color: labelColor }]}>{prov.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.footer, subtextStyle]}>
        ROUTING SYSTEM OPTIMIZED
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
  providerGrid: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chip: {
    flex: 1,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  footer: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
});
