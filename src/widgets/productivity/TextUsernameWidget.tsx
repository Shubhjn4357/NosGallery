import { Type, Check } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';
import { useWidgetStore } from '../../store/widgetStore';
import { useFeedback } from '../../hooks/useFeedback';

const LucideIcons = {
  Type,
  Check,
};

interface TextUsernameWidgetProps {
  globalTheme: ThemeId;
  interactive: boolean;
}

export const TextUsernameWidget: React.FC<TextUsernameWidgetProps> = ({
  globalTheme,
  interactive,
}) => {
  const { githubUsername, setGithubUsername, showToast } = useWidgetStore();
  const { triggerHaptic } = useFeedback();
  const { accentColor, textStyle, subtextStyle } = useWidgetStyle({}, globalTheme);

  const [inputVal, setInputVal] = useState(githubUsername);
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    if (!interactive) return;
    triggerHaptic('success');
    setGithubUsername(inputVal);
    setEditing(false);
    showToast(`GitHub User updated to @${inputVal}`, 'success');
  };

  const isLight = textStyle.color === '#000000';
  const containerBg = isLight ? '#efeff4' : '#1c1c1e';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LucideIcons.Type size={11} color={accentColor} />
          <Text style={[styles.title, subtextStyle]}>STUDIO ACCOUNT</Text>
        </View>
        <Text style={[styles.statusTxt, { color: accentColor }]}>
          {editing ? 'EDITING' : 'LINKED'}
        </Text>
      </View>

      <View style={styles.main}>
        {editing && interactive ? (
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { color: textStyle.color, borderColor: isLight ? '#ccc' : '#333' }]}
              value={inputVal}
              onChangeText={setInputVal}
              placeholder="Username..."
              placeholderTextColor="#555"
              autoCapitalize="none"
              autoFocus
            />
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveBtn, { backgroundColor: accentColor }]}
            >
              <LucideIcons.Check size={11} color="#000000" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => {
              if (interactive) setEditing(true);
            }}
            disabled={!interactive}
            style={[styles.profileButton, { backgroundColor: containerBg }]}
          >
            <Text style={[styles.userLabel, subtextStyle]}>GITHUB DEVELOPER</Text>
            <Text style={[styles.userName, textStyle]}>@{githubUsername}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.footer, subtextStyle]}>
        {editing ? 'TAP CHECK TO CONFIRM' : 'TAP WIDGET TO EDIT'}
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
  statusTxt: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    fontSize: 9.5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  saveBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButton: {
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  userLabel: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 12.5,
    fontWeight: '900',
    marginTop: 2,
  },
  footer: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
});
