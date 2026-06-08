import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { WidgetCustomizations } from '../../store/widgetStore';
import { themes } from '../../themes/themes';
import { fonts } from '../../fonts/fonts';

const PRESET_COLORS = [
  '#000000', '#ffffff', '#7C9EFF', '#007aff', '#39ff14', 
  '#ff2d55', '#dfba6b', '#1a0826', '#e0e0e0', '#f7ebec'
];

const BORDER_RADII = [0, 8, 12, 16, 20, 24, 32];
const SHADOW_TYPES: WidgetCustomizations['shadowType'][] = ['none', 'soft', 'medium', 'hard', 'glow'];
const TRANSPARENCIES = [0, 20, 40, 60, 80];

interface DesignStylesEditorProps {
  customizations: WidgetCustomizations;
  handleUpdate: (updates: Partial<WidgetCustomizations>) => void;
}

export const DesignStylesEditor: React.FC<DesignStylesEditorProps> = ({
  customizations,
  handleUpdate,
}) => {
  return (
    <View style={{ gap: 12 }}>
      {/* Theme overrides */}
      <Text style={styles.inputLabel}>Skin Style Override</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
        <TouchableOpacity
          style={[
            styles.choiceChip,
            (!customizations.themeOverride || customizations.themeOverride === 'none') && styles.activeChoiceChip,
          ]}
          onPress={() => handleUpdate({ themeOverride: 'none' })}
        >
          <Text style={[styles.choiceChipText, (!customizations.themeOverride || customizations.themeOverride === 'none') && styles.activeChoiceChipText]}>Global Default</Text>
        </TouchableOpacity>
        {Object.values(themes).map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[
              styles.choiceChip,
              customizations.themeOverride === t.id && styles.activeChoiceChip,
            ]}
            onPress={() => handleUpdate({ themeOverride: t.id })}
          >
            <Text style={[styles.choiceChipText, customizations.themeOverride === t.id && styles.activeChoiceChipText]}>{t.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Background style */}
      <Text style={styles.inputLabel}>Background Fill Style</Text>
      <View style={styles.segmentedControl}>
        {(['solid', 'gradient', 'glass', 'none'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.segmentBtn,
              customizations.backgroundType === type && styles.activeSegmentBtn,
            ]}
            onPress={() => handleUpdate({ backgroundType: type })}
          >
            <Text style={[styles.segmentBtnText, customizations.backgroundType === type && styles.activeSegmentBtnText]}>
              {type.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Colors Palette (only if solid background) */}
      {customizations.backgroundType === 'solid' && (
        <>
          <Text style={styles.inputLabel}>Solid Background Color</Text>
          <View style={styles.colorPalette}>
            {PRESET_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorCircle,
                  { backgroundColor: c },
                  customizations.backgroundColor === c && { borderWidth: 2, borderColor: '#ffffff' },
                ]}
                onPress={() => handleUpdate({ backgroundColor: c })}
              />
            ))}
          </View>
        </>
      )}

      {/* Fonts */}
      <Text style={styles.inputLabel}>Typography Font Family</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
        {Object.values(fonts).map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[
              styles.choiceChip,
              customizations.fontId === f.id && styles.activeChoiceChip,
            ]}
            onPress={() => handleUpdate({ fontId: f.id })}
          >
            <Text style={[styles.choiceChipText, customizations.fontId === f.id && styles.activeChoiceChipText]}>{f.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Corner Radius */}
      <Text style={styles.inputLabel}>Corner Border Radius</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
        {BORDER_RADII.map((r) => (
          <TouchableOpacity
            key={r}
            style={[
              styles.choiceChip,
              customizations.borderRadius === r && styles.activeChoiceChip,
            ]}
            onPress={() => handleUpdate({ borderRadius: r })}
          >
            <Text style={[styles.choiceChipText, customizations.borderRadius === r && styles.activeChoiceChipText]}>{r}px</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Shadows */}
      <Text style={styles.inputLabel}>Shadow Effect Glow</Text>
      <View style={styles.segmentedControl}>
        {SHADOW_TYPES.map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.segmentBtn,
              customizations.shadowType === s && styles.activeSegmentBtn,
            ]}
            onPress={() => handleUpdate({ shadowType: s })}
          >
            <Text style={[styles.segmentBtnText, customizations.shadowType === s && styles.activeSegmentBtnText]}>
              {s.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transparency */}
      <Text style={styles.inputLabel}>Translucent Blend: {customizations.transparency}%</Text>
      <View style={styles.sliderBar}>
        {TRANSPARENCIES.map((val) => (
          <TouchableOpacity
            key={val}
            style={[styles.sliderSegment, customizations.transparency === val && { backgroundColor: '#ffffff' }]}
            onPress={() => handleUpdate({ transparency: val })}
          >
            <Text style={[styles.sliderLabelText, customizations.transparency === val && { color: '#000000' }]}>
              {val}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputLabel: {
    color: '#8e8e93',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  choiceChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#0c0c0e',
    borderWidth: 1,
    borderColor: '#1f1f23',
    marginRight: 6,
  },
  activeChoiceChip: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  choiceChipText: {
    color: '#8e8e93',
    fontSize: 10.5,
    fontWeight: '700',
  },
  activeChoiceChipText: {
    color: '#000000',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#0a0a0c',
    borderRadius: 12,
    padding: 3,
    gap: 4,
    borderWidth: 1,
    borderColor: '#1f1f23',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 9,
  },
  activeSegmentBtn: {
    backgroundColor: '#1f1f23',
  },
  segmentBtnText: {
    color: '#666',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  activeSegmentBtnText: {
    color: '#ffffff',
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 4,
  },
  colorCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#222',
  },
  sliderBar: {
    flexDirection: 'row',
    backgroundColor: '#0a0a0c',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: '#1f1f23',
  },
  sliderSegment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 9,
  },
  sliderLabelText: {
    color: '#8e8e93',
    fontSize: 10,
    fontWeight: '700',
  },
});
