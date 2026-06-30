// @widget social_contact
import { User, Phone, MessageSquare } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Linking } from 'react-native';
import { View, Text, TouchableOpacity } from '../../../modules/expo-widget/src';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';
import { useFeedback } from '../../hooks/useFeedback';

const LucideIcons = {
  User,
  Phone,
  MessageSquare,
};

interface ContactWidgetProps {
  globalTheme: ThemeId;
  interactive: boolean;
}

export const ContactWidget: React.FC<ContactWidgetProps> = ({
  globalTheme,
  interactive,
}) => {
  const { accentColor, textStyle, subtextStyle } = useWidgetStyle({}, globalTheme);
  const { triggerHaptic } = useFeedback();

  const handleCall = () => {
    if (!interactive) return;
    triggerHaptic('light');
    Linking.openURL('tel:+15555555555').catch(() => {});
  };

  const handleMessage = () => {
    if (!interactive) return;
    triggerHaptic('light');
    Linking.openURL('sms:+15555555555').catch(() => {});
  };

  const isLight = textStyle.color === '#000000';
  const actionBg = isLight ? '#e5e5ea' : '#1c1c1e';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LucideIcons.User size={11} color={accentColor} />
          <Text style={[styles.title, subtextStyle]}>FAV CONTACT</Text>
        </View>
        <Text style={[styles.badge, { color: accentColor, borderColor: accentColor }]}>PRIMARY</Text>
      </View>

      {/* Profile summary */}
      <View style={styles.profileRow}>
        <View style={[styles.avatar, { backgroundColor: isLight ? '#d1d1d6' : '#2c2c2e' }]}>
          <Text style={styles.avatarTxt}>👤</Text>
        </View>
        <View style={styles.details}>
          <Text style={[styles.name, textStyle]}>Shubh</Text>
          <Text style={[styles.number, subtextStyle]}>+1 (555) 555-5555</Text>
        </View>
      </View>

      {/* Quick dials */}
      {interactive && (
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={handleCall}
            style={[styles.btn, { backgroundColor: actionBg }]}
            activeOpacity={0.8}
          >
            <LucideIcons.Phone size={11} color={accentColor} />
            <Text style={[styles.btnLabel, { color: accentColor }]}>CALL</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleMessage}
            style={[styles.btn, { backgroundColor: actionBg }]}
            activeOpacity={0.8}
          >
            <LucideIcons.MessageSquare size={11} color={textStyle.color} />
            <Text style={[styles.btnLabel, { color: textStyle.color }]}>MESSAGE</Text>
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
  badge: {
    fontSize: 6,
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    fontWeight: 'bold',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: {
    fontSize: 18,
  },
  details: {
    gap: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  number: {
    fontSize: 8.5,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  btn: {
    flex: 1,
    height: 24,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  btnLabel: {
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
