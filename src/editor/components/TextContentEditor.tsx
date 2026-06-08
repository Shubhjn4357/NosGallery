import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { WidgetCustomizations } from '../../store/widgetStore';

const FONT_SIZES = [10, 12, 14, 16, 20, 24, 28, 32];

interface TextContentEditorProps {
  customizations: WidgetCustomizations;
  handleUpdate: (updates: Partial<WidgetCustomizations>) => void;
}

export const TextContentEditor: React.FC<TextContentEditorProps> = ({
  customizations,
  handleUpdate,
}) => {
  return (
    <View style={{ gap: 12 }}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Widget Header / Title</Text>
        <TextInput
          style={styles.textInput}
          value={customizations.titleText || ''}
          onChangeText={(txt) => handleUpdate({ titleText: txt })}
          placeholder="Title Text"
          placeholderTextColor="#555"
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Widget Value / Description</Text>
        <TextInput
          style={[styles.textInput, { height: 80 }]}
          multiline
          numberOfLines={4}
          value={customizations.valueText || ''}
          onChangeText={(txt) => handleUpdate({ valueText: txt })}
          placeholder="Value description"
          placeholderTextColor="#555"
        />
      </View>

      <Text style={styles.inputLabel}>Font Size: {customizations.fontSize || 14}px</Text>
      <View style={styles.sliderBar}>
        {FONT_SIZES.map((sz) => (
          <TouchableOpacity
            key={sz}
            style={[styles.sliderSegment, customizations.fontSize === sz && { backgroundColor: '#ffffff' }]}
            onPress={() => handleUpdate({ fontSize: sz })}
          >
            <Text style={[styles.sliderLabelText, customizations.fontSize === sz && { color: '#000000' }]}>{sz}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    color: '#8e8e93',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  textInput: {
    backgroundColor: '#0c0c0e',
    borderWidth: 1,
    borderColor: '#1c1c20',
    borderRadius: 12,
    color: '#ffffff',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
