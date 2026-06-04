import { WidgetCustomizations } from '../../store/widgetStore';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

interface CalendarMonthlyProps {
  currentTime: Date;
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
}

export const CalendarMonthly: React.FC<CalendarMonthlyProps> = ({
  currentTime,
  customizations,
  globalTheme,
}) => {
  const { textStyle, subtextStyle, accentColor } = useWidgetStyle(customizations, globalTheme);

  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const currentDay = currentTime.getDate();
  const title = customizations.titleText || 'CALENDAR';

  // Customize layouts for Chinese, Hijri, Panchang, or Week/Day views
  const lowercaseTitle = title.toLowerCase();

  if (lowercaseTitle.includes('panchang')) {
    return (
      <View style={styles.container}>
        <View style={styles.rowSpace}>
          <Text style={[styles.title, subtextStyle]}>{title}</Text>
          <LucideIcons.Compass size={12} color={accentColor} />
        </View>
        <View style={styles.detailBox}>
          <Text style={[styles.detailText, textStyle]}>Tithi: Dwadashi (Shukla)</Text>
          <Text style={[styles.detailText, textStyle, { color: accentColor }]}>Nakshatra: Swati</Text>
          <Text style={[styles.detailText, textStyle]}>Rashi: Kanya (Virgo)</Text>
        </View>
      </View>
    );
  }

  if (lowercaseTitle.includes('chinese') || lowercaseTitle.includes('lunar')) {
    return (
      <View style={styles.container}>
        <View style={styles.rowSpace}>
          <Text style={[styles.title, subtextStyle]}>{title}</Text>
          <LucideIcons.Moon size={12} color={accentColor} />
        </View>
        <View style={styles.detailBox}>
          <Text style={[styles.detailText, textStyle]}>Lunar: Month 4 Day 19</Text>
          <Text style={[styles.detailText, textStyle, { color: accentColor }]}>Year of the Horse</Text>
          <Text style={[styles.detailText, textStyle]}>Solar Term: Mangzhong</Text>
        </View>
      </View>
    );
  }

  if (lowercaseTitle.includes('islamic') || lowercaseTitle.includes('hijri')) {
    return (
      <View style={styles.container}>
        <View style={styles.rowSpace}>
          <Text style={[styles.title, subtextStyle]}>{title}</Text>
          <LucideIcons.MoonStar size={12} color={accentColor} />
        </View>
        <View style={styles.detailBox}>
          <Text style={[styles.detailText, textStyle]}>Hijri: 19 Dhu al-Hijjah</Text>
          <Text style={[styles.detailText, textStyle, { color: accentColor }]}>Year: 1447 AH</Text>
          <Text style={[styles.detailText, textStyle]}>Phase: Waning Gibbous</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.rowSpace}>
        <Text style={[styles.title, subtextStyle]}>{title}</Text>
        <LucideIcons.Calendar size={12} color={accentColor} />
      </View>
      <View style={styles.calendarGrid}>
        {days.map((day) => (
          <View
            key={day}
            style={[
              styles.calDayBox,
              day === currentDay && { backgroundColor: accentColor, borderRadius: 4 },
            ]}
          >
            <Text
              style={[
                styles.calDayLabel,
                textStyle,
                { color: day === currentDay ? '#ffffff' : textStyle.color },
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  rowSpace: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 8.5,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    marginTop: 4,
  },
  calDayBox: {
    width: 13,
    height: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calDayLabel: {
    fontSize: 8.5,
    textAlign: 'center',
  },
  detailBox: {
    marginTop: 6,
    gap: 3,
  },
  detailText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});
