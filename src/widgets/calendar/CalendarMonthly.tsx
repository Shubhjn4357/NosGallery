import { Calendar } from 'lucide-react-native';
import { WidgetCustomizations } from '../../store/widgetStore';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

const LucideIcons = {
  Calendar,
};

interface CalendarMonthlyProps {
  currentTime: Date;
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
}

const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const CalendarMonthly: React.FC<CalendarMonthlyProps> = ({
  currentTime,
  customizations,
  globalTheme,
}) => {
  const { accentColor } = useWidgetStyle(customizations, globalTheme);

  const year = currentTime.getFullYear();
  const month = currentTime.getMonth();
  const currentDay = currentTime.getDate();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const isLight = customizations.backgroundColor === '#ffffff';
  const textColor = isLight ? '#111' : '#fff';
  const dimColor = isLight ? '#aaa' : '#555';
  const todayBg = accentColor;

  // Build full 6-week grid
  const TOTAL_CELLS = 42;
  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ...Array(TOTAL_CELLS - firstDayOfWeek - daysInMonth).fill(null),
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LucideIcons.Calendar size={10} color={accentColor} />
          <Text style={[styles.monthLabel, { color: textColor }]}>
            {MONTHS[month]} <Text style={{ color: dimColor, fontSize: 9 }}>{year}</Text>
          </Text>
        </View>
        <Text style={[styles.todayBadge, { color: accentColor }]}>
          Day {currentDay}
        </Text>
      </View>

      {/* Weekday headers */}
      <View style={styles.weekRow}>
        {WEEK_DAYS.map((d, i) => (
          <Text key={i} style={[styles.weekDayLabel, { color: (i === 0 || i === 6) ? '#7C9EFF' : dimColor }]}>
            {d}
          </Text>
        ))}
      </View>

      {/* Date grid */}
      <View style={styles.grid}>
        {cells.slice(0, 35).map((day, i) => (
          <View
            key={i}
            style={[
              styles.dayCell,
              day === currentDay && { backgroundColor: todayBg, borderRadius: 5 },
            ]}
          >
            {day !== null && (
              <Text
                style={[
                  styles.dayText,
                  { color: day === currentDay ? '#000' : textColor },
                  !day && { opacity: 0 },
                ]}
              >
                {day}
              </Text>
            )}
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
  monthLabel: {
    fontSize: 11,
    fontWeight: '900',
  },
  todayBadge: {
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  weekDayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 7,
    fontWeight: '900',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  dayCell: {
    width: `${100 / 7}%` as any,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 7.5,
    fontWeight: '600',
  },
});
