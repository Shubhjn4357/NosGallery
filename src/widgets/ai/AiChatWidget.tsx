// @widget ai_chat
import { Send, User } from 'lucide-react-native';
import React from 'react';
import { StyleSheet } from 'react-native';

import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from '../../../modules/expo-widget/src';

import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';
import { useWidgetStore, WidgetCustomizations } from '../../store/widgetStore';

const LucideIcons = {
  Send,
  User,
};

interface AiChatWidgetProps {
  aiInput: string;
  aiResponse: string;
  aiThinking: boolean;
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
  interactive: boolean;
  setAiInput: (txt: string) => void;
  triggerAIChat: () => void;
}

export const AiChatWidget: React.FC<AiChatWidgetProps> = ({
  aiInput,
  aiResponse,
  aiThinking,
  customizations,
  globalTheme,
  interactive,
  setAiInput,
  triggerAIChat,
}) => {
  const { googleUser } = useWidgetStore();
  const { textStyle, subtextStyle, accentColor } = useWidgetStyle(customizations, globalTheme);

  const title = customizations.titleText || 'AI ASSISTANT';

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, subtextStyle]}>{title}</Text>
        {googleUser && (
          <View style={styles.userBadge}>
            <LucideIcons.User size={8} color={accentColor} />
            <Text style={[styles.userEmailText, subtextStyle, { color: accentColor }]}>{googleUser.email}</Text>
          </View>
        )}
      </View>
      {aiResponse ? (
        <ScrollView style={styles.responseScroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.response, textStyle]}>{aiResponse}</Text>
        </ScrollView>
      ) : (
        <Text style={[styles.desc, textStyle]}>Type &quot;todo&quot;, &quot;weather&quot;, or &quot;stocks&quot; below:</Text>
      )}
      {interactive && (
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { color: textStyle.color, borderColor: textStyle.color === '#ffffff' ? '#333' : '#ddd' }]}
            value={aiInput}
            onChangeText={setAiInput}
            placeholder="Ask AI..."
            placeholderTextColor="#777"
          />
          <TouchableOpacity style={[styles.sendBtn, { backgroundColor: accentColor }]} onPress={triggerAIChat}>
            {aiThinking ? <ActivityIndicator size="small" color="#000" /> : <LucideIcons.Send size={10} color="#000" />}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  userEmailText: {
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 8.5,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  responseScroll: {
    maxHeight: 40,
  },
  response: {
    fontSize: 10,
    lineHeight: 13,
  },
  desc: {
    fontSize: 9,
    opacity: 0.7,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    marginTop: 4,
  },
  input: {
    flex: 1,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 4,
    fontSize: 8.5,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  sendBtn: {
    width: 22,
    height: 22,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
