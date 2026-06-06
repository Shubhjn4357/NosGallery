import { WidgetCustomizations } from '../../store/widgetStore';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useWidgetStyle } from '../../hooks/useWidgetStyle';
import { ThemeId } from '../../themes/themes';

interface TodoWidgetProps {
  customizations: WidgetCustomizations;
  globalTheme: ThemeId;
  interactive: boolean;
}

const TASKS = [
  { id: 1, text: 'Ship the Expo build', priority: 'high' },
  { id: 2, text: 'Widget design review', priority: 'med' },
  { id: 3, text: 'Hydrate 8 glasses', priority: 'low' },
];

export const TodoWidget: React.FC<TodoWidgetProps> = ({
  customizations,
  globalTheme,
  interactive,
}) => {
  const { accentColor } = useWidgetStyle(customizations, globalTheme);
  const title = customizations.titleText || 'TODAY TASKS';

  const [todoList, setTodoList] = useState(
    TASKS.map(t => ({ ...t, done: false }))
  );

  const handleToggle = (id: number) => {
    if (!interactive) return;
    setTodoList(list =>
      list.map(item => item.id === id ? { ...item, done: !item.done } : item)
    );
  };

  const completedCount = todoList.filter(t => t.done).length;
  const progressPct = (completedCount / todoList.length) * 100;

  const isLight = customizations.backgroundColor === '#ffffff';
  const textColor = isLight ? '#111' : '#fff';
  const dimColor = isLight ? '#888' : '#666';
  const trackBg = isLight ? '#efeff4' : '#1c1c1e';

  const PRIORITY_COLORS: Record<string, string> = {
    high: '#7C9EFF',
    med: '#ff9500',
    low: '#34c759',
  };

  return (
    <View style={styles.container}>
      {/* Header with progress */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LucideIcons.CheckSquare size={10} color={accentColor} />
          <Text style={[styles.title, { color: dimColor }]}>{title}</Text>
        </View>
        <Text style={[styles.countBadge, { color: accentColor }]}>
          {completedCount}/{todoList.length}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: trackBg }]}>
        <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: accentColor }]} />
      </View>

      {/* Task rows */}
      <View style={styles.list}>
        {todoList.map(todo => (
          <TouchableOpacity
            key={todo.id}
            disabled={!interactive}
            style={styles.itemRow}
            onPress={() => handleToggle(todo.id)}
          >
            {/* Priority indicator dot */}
            <View style={[styles.priorityDot, { backgroundColor: todo.done ? dimColor : PRIORITY_COLORS[todo.priority] }]} />
            <Text
              style={[
                styles.taskText,
                { color: textColor, opacity: todo.done ? 0.4 : 1 },
                todo.done && styles.strikeThrough,
              ]}
              numberOfLines={1}
            >
              {todo.text}
            </Text>
            {todo.done && <LucideIcons.Check size={10} color={accentColor} />}
          </TouchableOpacity>
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
  title: {
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  countBadge: {
    fontSize: 11,
    fontWeight: '900',
  },
  progressTrack: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
    marginVertical: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  list: {
    gap: 5,
    flex: 1,
    justifyContent: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  taskText: {
    flex: 1,
    fontSize: 10,
    fontWeight: '500',
  },
  strikeThrough: {
    textDecorationLine: 'line-through',
  },
});
