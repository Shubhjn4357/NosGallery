import { WidgetCustomizations } from '../../store/widgetStore';
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

interface CicdPipelineProps {
  buildStatus: 'idle' | 'building' | 'testing' | 'success' | 'failed';
  buildProgress: number;
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
  interactive: boolean;
  triggerCICDBuild: () => void;
}

export const CicdPipeline: React.FC<CicdPipelineProps> = ({
  buildStatus,
  buildProgress,
  customizations,
  globalTheme,
  interactive,
  triggerCICDBuild,
}) => {
  const { textStyle, subtextStyle, accentColor, successColor, errorColor } = useWidgetStyle(customizations, globalTheme);

  const isRunning = buildStatus === 'building' || buildStatus === 'testing';
  const title = customizations.titleText || 'BUILD PIPELINE';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, subtextStyle]}>{title}</Text>
        <LucideIcons.Terminal size={12} color={accentColor} />
      </View>
      <View style={styles.statusRow}>
        {isRunning ? (
          <ActivityIndicator size="small" color={accentColor} style={styles.spinner} />
        ) : (
          <View style={[styles.indicator, { backgroundColor: buildStatus === 'success' ? successColor : errorColor }]} />
        )}
        <Text style={[styles.statusText, textStyle]}>
          {buildStatus.toUpperCase()} ({buildProgress}%)
        </Text>
      </View>
      {interactive && (
        <TouchableOpacity style={[styles.btn, { backgroundColor: accentColor }]} onPress={triggerCICDBuild}>
          <Text style={styles.btnText}>Run Test Pipeline</Text>
        </TouchableOpacity>
      )}
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    marginRight: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  btn: {
    paddingVertical: 3,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  btnText: {
    color: '#000000',
    fontSize: 8.5,
    fontWeight: 'bold',
  },
});
