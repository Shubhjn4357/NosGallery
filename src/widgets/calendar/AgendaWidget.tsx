import { WidgetCustomizations } from '../../store/widgetStore';
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

interface AgendaWidgetProps {
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
}

export const AgendaWidget: React.FC<AgendaWidgetProps> = ({
  customizations,
  globalTheme,
}) => {
  const { textStyle, subtextStyle } = useWidgetStyle(customizations, globalTheme);

  const title = customizations.titleText || 'DAILY AGENDA';
  const lowercaseTitle = title.toLowerCase();

  const getEvents = () => {
    if (lowercaseTitle.includes('birthday') || lowercaseTitle.includes('anniversary')) {
      return [
        '🎉 Sarah\'s Birthday - All Day',
        '❤️ Wedding Anniversary - Jun 12',
        '🎂 Dad\'s Birthday - Jun 25',
      ];
    }
    if (lowercaseTitle.includes('travel') || lowercaseTitle.includes('flight')) {
      return [
        '✈️ Heathrow Flight BA431 - 10:20 AM',
        '🏨 Check-in: Obsidian Hotel - 03:00 PM',
        '🗺️ London Walking Tour - Jun 05',
      ];
    }
    if (lowercaseTitle.includes('meeting') || lowercaseTitle.includes('work')) {
      return [
        '💼 Standup Sync - 09:30 AM',
        '📈 Sales Forecast Review - 11:00 AM',
        '🤝 Client Onboarding - 02:30 PM',
      ];
    }
    // Default
    return [
      '• 09:30 AM - Design Matrix Sync',
      '• 12:45 PM - Vercel Pipeline Deploy',
      '• 04:00 PM - API Test Automation',
    ];
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, subtextStyle]}>{title}</Text>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.listScroll}>
        {getEvents().map((event, idx) => (
          <Text key={idx} style={[styles.agendaItem, textStyle]}>{event}</Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 8.5,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  listScroll: {
    maxHeight: 75,
    marginTop: 4,
  },
  agendaItem: {
    fontSize: 9,
    marginVertical: 1,
  },
});
