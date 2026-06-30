import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { WidgetTemplate } from '../widgets/registry';
import { ActiveWidget } from '../store/widgetStore';
import { WidgetRenderer } from '../widgets/widgetRenderer';

const { width: SW } = Dimensions.get('window');

interface WidgetCardProps {
  template: WidgetTemplate;
  activeTheme: string;
  onPress: () => void;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({
  template,
  activeTheme,
  onPress,
}) => {
  const PREVIEW_W = (SW - 48) / 2;
  // Match WidgetRenderer's sizing: CELL_W = (SW - 32 - 12) / 4
  const CELL_W = (SW - 32 - 12) / 4;
  const widgetW = template.defaultWidth * CELL_W;
  const widgetH = template.defaultHeight * CELL_W; // square cells
  const scale = Math.min((PREVIEW_W - 16) / widgetW, 104 / widgetH);

  const mockWidget: ActiveWidget = {
    id: `showcase_${template.id}`,
    templateId: template.id,
    x: 0,
    y: 0,
    w: template.defaultWidth,
    h: template.defaultHeight,
  };

  return (
    <TouchableOpacity style={[styles.widgetCard, { width: PREVIEW_W }]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.widgetPreviewBox}>
        <View style={{
          width: widgetW,
          height: widgetH,
          transform: [{ scale }],
        }}>
          <WidgetRenderer widget={mockWidget} globalTheme={activeTheme as any} interactive={false} />
        </View>
      </View>
      <View style={styles.widgetCardFooter}>
        <Text style={styles.widgetCardName} numberOfLines={1}>{template.name}</Text>
        <Text style={styles.widgetCardSize}>{template.defaultWidth}×{template.defaultHeight}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  widgetCard: {
    backgroundColor: '#0d0d10',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1c1c20',
    overflow: 'hidden',
    marginBottom: 4,
  },
  widgetPreviewBox: {
    height: 120,
    backgroundColor: '#060609',
    borderRadius: 18,
    margin: 8,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  widgetCardFooter: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
    borderTopWidth: 1,
    borderTopColor: '#151518',
  },
  widgetCardName: {
    color: '#e5e5ea',
    fontSize: 11.5,
    fontWeight: '700',
  },
  widgetCardSize: {
    color: '#444',
    fontSize: 9.5,
    fontWeight: '600',
  },
});
